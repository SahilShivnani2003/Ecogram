import {DrawerNavigationProp} from '@react-navigation/drawer';
import React, {useRef, useState} from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppInput from '@components/ui/AppInput';
import {Colors, Radius, Shadow, Spacing, Typography} from '@theme/index';

// ─── Types ────────────────────────────────────────────────────────────────────

type WithdrawalType = 'wallet' | 'cashback' | 'rewards';

interface WithdrawalRecord {
  id: string;
  date: string;
  amount: number;
  type: WithdrawalType;
  status: 'pending' | 'approved' | 'rejected';
  bankName: string;
}

interface WalletData {
  walletBalance: number;
  cashbackBalance: number;
  rewardPoints: number;
  totalEarned: number;
  withdrawalHistory: WithdrawalRecord[];
}

interface WithdrawForm {
  type: WithdrawalType;
  amount: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

interface WithdrawErrors {
  amount?: string;
  holderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

interface WalletScreenProps {
  navigation: DrawerNavigationProp<any>;
  wallet?: WalletData;
  onSubmitWithdrawal?: (form: WithdrawForm) => Promise<void> | void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WITHDRAWAL_TYPES: {value: WithdrawalType; label: string}[] = [
  {value: 'wallet', label: 'Wallet Balance'},
  {value: 'cashback', label: 'Cashback Balance'},
  {value: 'rewards', label: 'Reward Points'},
];

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(s: WithdrawalRecord['status']): string {
  return s === 'approved'
    ? Colors.accentGreen
    : s === 'rejected'
    ? Colors.error
    : Colors.warning;
}

function getAvailable(wallet: WalletData, type: WithdrawalType): number {
  if (type === 'wallet') return wallet.walletBalance;
  if (type === 'cashback') return wallet.cashbackBalance;
  return wallet.rewardPoints;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BalanceCardProps {
  icon: string;
  iconColor: string;
  cardBg: string;
  label: string;
  value: string;
  delay?: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  icon,
  iconColor,
  cardBg,
  label,
  value,
  delay = 0,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 400, delay, useNativeDriver: true}),
      Animated.timing(translateY, {toValue: 0, duration: 400, delay, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.balCard,
        {backgroundColor: cardBg, opacity, transform: [{translateY}]},
      ]}>
      <Icon name={icon} size={22} color={iconColor} style={{marginBottom: Spacing.sm}} />
      <Text style={[styles.balValue, {color: iconColor}]}>{value}</Text>
      <Text style={styles.balLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_WALLET: WalletData = {
  walletBalance: 0,
  cashbackBalance: 0,
  rewardPoints: 0,
  totalEarned: 0,
  withdrawalHistory: [],
};

const WalletScreen: React.FC<WalletScreenProps> = ({
  navigation,
  wallet = DEFAULT_WALLET,
  onSubmitWithdrawal,
}) => {
  const [form, setForm] = useState<WithdrawForm>({
    type: 'wallet',
    amount: '',
    holderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });
  const [errors, setErrors] = useState<WithdrawErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const available = getAvailable(wallet, form.type);

  // ── Validation ──────────────────────────────────────────────────────────

  function validateForm(f: WithdrawForm): WithdrawErrors {
    const e: WithdrawErrors = {};
    const amt = parseFloat(f.amount);
    if (!f.amount.trim()) {
      e.amount = 'Amount is required';
    } else if (isNaN(amt) || amt < 100) {
      e.amount = 'Minimum withdrawal amount is ₹100';
    } else if (amt > available) {
      e.amount = `Insufficient balance (Available: ${formatCurrency(available)})`;
    }
    if (!f.holderName.trim()) e.holderName = 'Account holder name is required';
    if (!f.accountNumber.trim()) {
      e.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(f.accountNumber.trim())) {
      e.accountNumber = 'Enter a valid account number (9–18 digits)';
    }
    if (!f.ifscCode.trim()) {
      e.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(f.ifscCode.trim().toUpperCase())) {
      e.ifscCode = 'Enter a valid IFSC code (e.g. SBIN0001234)';
    }
    if (!f.bankName.trim()) e.bankName = 'Bank name is required';
    return e;
  }

  const handleChange =
    (field: keyof WithdrawForm) => (val: string) => {
      setForm(p => ({...p, [field]: val}));
      setSuccessMsg('');
      if (touched[field]) {
        setErrors(validateForm({...form, [field]: val}));
      }
    };

  const handleBlurField = (field: keyof WithdrawForm) => () => {
    setTouched(t => ({...t, [field]: true}));
    setErrors(validateForm(form));
  };

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(
      Object.keys(form).map(k => [k, true]),
    );
    setTouched(allTouched);
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await onSubmitWithdrawal?.(form);
      setSuccessMsg('Withdrawal request submitted successfully!');
      setForm({
        type: 'wallet',
        amount: '',
        holderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      });
      setTouched({});
      setErrors({});
    } catch (err: any) {
      setErrors({amount: err?.message ?? 'Submission failed. Try again.'});
    } finally {
      setLoading(false);
    }
  };

  const balanceCards: BalanceCardProps[] = [
    {
      icon: 'wallet-outline',
      iconColor: '#3ECF60',
      cardBg: '#0D2A12',
      label: 'Wallet Balance',
      value: formatCurrency(wallet.walletBalance),
      delay: 80,
    },
    {
      icon: 'gift-outline',
      iconColor: '#C27AF5',
      cardBg: '#1A0A2E',
      label: 'Cashback Balance',
      value: formatCurrency(wallet.cashbackBalance),
      delay: 160,
    },
    {
      icon: 'star-outline',
      iconColor: '#F5C242',
      cardBg: '#2A1C08',
      label: 'Reward Points',
      value: String(wallet.rewardPoints),
      delay: 240,
    },
    {
      icon: 'trending-up',
      iconColor: '#4A90E2',
      cardBg: '#081828',
      label: 'Total Earned',
      value: formatCurrency(wallet.totalEarned),
      delay: 320,
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />

      {/* ── Custom Top Header ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.hamburger}
          activeOpacity={0.7}>
          <Icon name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarBrand}>
          <Icon name="wallet-outline" size={18} color={Colors.accentGreen} />
          <Text style={styles.topBarTitle}>My Wallet</Text>
        </View>

        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Page heading */}
        <Text style={styles.pageTitle}>My Wallet</Text>
        <Text style={styles.pageSubtitle}>
          Manage your earnings and withdrawals
        </Text>

        {/* ── Balance Cards ── */}
        <View style={styles.balGrid}>
          {balanceCards.map(c => (
            <BalanceCard key={c.label} {...c} />
          ))}
        </View>

        {/* ── Bottom row: Form + History ── */}
        <View style={styles.bottomRow}>

          {/* ── Withdrawal Form ── */}
          <View style={styles.formCard}>
            {/* Card header */}
            <View style={styles.formHeader}>
              <Icon name="arrow-top-right" size={18} color={Colors.accentGreen} />
              <Text style={styles.formTitle}>Request Withdrawal</Text>
            </View>

            {/* Success */}
            {successMsg ? (
              <View style={styles.successBox}>
                <Icon name="check-circle" size={16} color={Colors.accentGreen} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* Withdrawal Type */}
            <Text style={styles.fieldLabel}>Withdrawal Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setTypePickerOpen(o => !o)}
              activeOpacity={0.8}>
              <Text style={styles.typeSelectorText}>
                {WITHDRAWAL_TYPES.find(t => t.value === form.type)?.label}
              </Text>
              <Icon
                name={typePickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
            {typePickerOpen && (
              <View style={styles.typeDropdown}>
                {WITHDRAWAL_TYPES.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.typeOption,
                      opt.value === form.type && styles.typeOptionSelected,
                    ]}
                    onPress={() => {
                      setForm(p => ({...p, type: opt.value}));
                      setTypePickerOpen(false);
                    }}
                    activeOpacity={0.75}>
                    <Text
                      style={[
                        styles.typeOptionText,
                        opt.value === form.type && styles.typeOptionTextSelected,
                      ]}>
                      {opt.label}
                    </Text>
                    {opt.value === form.type && (
                      <Icon name="check" size={14} color={Colors.accentGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Amount */}
            <AppInput
              label={`Amount (min ₹100)`}
              icon="currency-inr"
              placeholder="100"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={handleChange('amount')}
              onBlur={handleBlurField('amount')}
              error={touched.amount ? errors.amount : undefined}
              helperText={`Available: ${formatCurrency(available)}`}
              returnKeyType="next"
            />

            {/* Account Holder */}
            <AppInput
              label="Account Holder Name"
              icon="account-outline"
              placeholder="John Doe"
              autoCapitalize="words"
              value={form.holderName}
              onChangeText={handleChange('holderName')}
              onBlur={handleBlurField('holderName')}
              error={touched.holderName ? errors.holderName : undefined}
              returnKeyType="next"
            />

            {/* Account Number */}
            <AppInput
              label="Account Number"
              icon="credit-card-outline"
              placeholder="1234567890"
              keyboardType="numeric"
              value={form.accountNumber}
              onChangeText={handleChange('accountNumber')}
              onBlur={handleBlurField('accountNumber')}
              error={touched.accountNumber ? errors.accountNumber : undefined}
              returnKeyType="next"
            />

            {/* IFSC */}
            <AppInput
              label="IFSC Code"
              icon="bank-outline"
              placeholder="SBIN0001234"
              autoCapitalize="characters"
              value={form.ifscCode}
              onChangeText={t => handleChange('ifscCode')(t.toUpperCase())}
              onBlur={handleBlurField('ifscCode')}
              error={touched.ifscCode ? errors.ifscCode : undefined}
              returnKeyType="next"
            />

            {/* Bank Name */}
            <AppInput
              label="Bank Name"
              icon="office-building-outline"
              placeholder="State Bank of India"
              autoCapitalize="words"
              value={form.bankName}
              onChangeText={handleChange('bankName')}
              onBlur={handleBlurField('bankName')}
              error={touched.bankName ? errors.bankName : undefined}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <Text style={styles.submitBtnText}>Submitting…</Text>
              ) : (
                <Text style={styles.submitBtnText}>Submit Withdrawal Request</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Withdrawal History ── */}
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Withdrawal History</Text>

            {wallet.withdrawalHistory.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Icon
                  name="clock-outline"
                  size={36}
                  color={Colors.textMuted}
                  style={{marginBottom: Spacing.sm}}
                />
                <Text style={styles.historyEmptyText}>
                  No withdrawal requests yet
                </Text>
              </View>
            ) : (
              wallet.withdrawalHistory.map(record => (
                <View key={record.id} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Icon
                      name="arrow-top-right-thin-circle-outline"
                      size={20}
                      color={statusColor(record.status)}
                    />
                    <View>
                      <Text style={styles.historyAmount}>
                        {formatCurrency(record.amount)}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {record.bankName} · {formatDate(record.date)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {borderColor: statusColor(record.status)},
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {color: statusColor(record.status)},
                      ]}>
                      {record.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgDeep,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hamburger: {padding: Spacing.xs},
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  topBarTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
  },

  scroll: {flex: 1},
  scrollContent: {padding: Spacing.md},

  pageTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightExtraBold,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  pageSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSM,
    marginBottom: Spacing.lg,
  },

  // Balance cards
  balGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  balCard: {
    width: '47.5%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.subtle,
  },
  balValue: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightExtraBold,
    marginBottom: 2,
  },
  balLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
  },

  bottomRow: {
    gap: Spacing.md,
  },

  // Withdrawal form card
  formCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0D2A12',
    borderWidth: 1,
    borderColor: Colors.accentGreen,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.accentGreen,
    fontSize: Typography.fontSizeSM,
    flex: 1,
    fontWeight: Typography.fontWeightMedium,
  },

  // Type selector
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: Spacing.xs + 2,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D2210',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    marginBottom: Spacing.md,
  },
  typeSelectorText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
  },
  typeDropdown: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeOptionSelected: {
    backgroundColor: '#0D2A12',
  },
  typeOptionText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeMD,
  },
  typeOptionTextSelected: {
    color: Colors.accentGreen,
    fontWeight: Typography.fontWeightSemiBold,
  },

  // Submit button
  submitBtn: {
    backgroundColor: Colors.accentGreen,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadow.subtle,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 0.2,
  },

  // History card
  historyCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 160,
    ...Shadow.subtle,
  },
  historyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.md,
  },
  historyEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  historyEmptyText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSM,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  historyAmount: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },
  historyMeta: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    marginTop: 1,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 0.8,
  },
});

export default WalletScreen;