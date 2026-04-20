import {DrawerNavigationProp} from '@react-navigation/drawer';
import React, {useRef} from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Radius, Shadow, Spacing, Typography} from '@theme/index';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvestorData {
  name: string;
  email: string;
  walletBalance: number;
  totalEarned: number;
  activePlans: number;
  rewardPoints: number;
  bookings: number;
  referrals: number;
}

interface DashboardScreenProps {
  navigation: DrawerNavigationProp<any>;
  investor?: InvestorData;
  onInvestNow?: () => void;
  onNavigate?: (route: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  onPress?: () => void;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  delay = 0,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 420, delay, useNativeDriver: true}),
      Animated.timing(translateY, {toValue: 0, duration: 420, delay, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{opacity, transform: [{translateY}]}, styles.statCardWrap]}>
      <TouchableOpacity
        style={styles.statCard}
        onPress={onPress}
        activeOpacity={0.75}>
        <View style={styles.statCardTop}>
          <View style={[styles.statIconBg, {backgroundColor: iconBg}]}>
            <Icon name={icon} size={18} color={iconColor} />
          </View>
          <Icon name="arrow-right" size={14} color={Colors.textMuted} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface QuickActionProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.quickIconBg, {backgroundColor: iconBg}]}>
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.quickText}>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSub}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={18} color={Colors.textMuted} />
  </TouchableOpacity>
);

interface BenefitItemProps {
  icon: string;
  title: string;
  subtitle: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({icon, title, subtitle}) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <View style={styles.benefitText}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitSub}>{subtitle}</Text>
    </View>
  </View>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_INVESTOR: InvestorData = {
  name: 'Investor',
  email: 'investor@gmail.com',
  walletBalance: 0,
  totalEarned: 0,
  activePlans: 0,
  rewardPoints: 0,
  bookings: 0,
  referrals: 0,
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
  investor = DEFAULT_INVESTOR,
  onInvestNow,
  onNavigate,
}) => {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {toValue: 1, duration: 500, useNativeDriver: true}),
      Animated.timing(headerY, {toValue: 0, duration: 500, useNativeDriver: true}),
    ]).start();
  }, []);

  const initial = investor.name.charAt(0).toUpperCase();

  const stats: StatCardProps[] = [
    {
      icon: 'wallet-outline',
      iconColor: '#3ECF60',
      iconBg: '#0F3A1A',
      label: 'Wallet Balance',
      value: formatCurrency(investor.walletBalance),
      onPress: () => onNavigate?.('Wallet'),
      delay: 100,
    },
    {
      icon: 'currency-inr',
      iconColor: '#6C88FF',
      iconBg: '#131A38',
      label: 'Total Earned',
      value: formatCurrency(investor.totalEarned),
      onPress: () => onNavigate?.('Earnings'),
      delay: 160,
    },
    {
      icon: 'trending-up',
      iconColor: '#F5A623',
      iconBg: '#2A1C08',
      label: 'Active Plans',
      value: String(investor.activePlans),
      onPress: () => onNavigate?.('Plans'),
      delay: 220,
    },
    {
      icon: 'star-outline',
      iconColor: '#C27AF5',
      iconBg: '#1E1030',
      label: 'Reward Points',
      value: String(investor.rewardPoints),
      onPress: () => onNavigate?.('Wallet'),
      delay: 280,
    },
    {
      icon: 'calendar-check-outline',
      iconColor: '#F5A623',
      iconBg: '#2A1C08',
      label: 'My Bookings',
      value: String(investor.bookings),
      onPress: () => onNavigate?.('Bookings'),
      delay: 340,
    },
    {
      icon: 'account-group-outline',
      iconColor: '#E05252',
      iconBg: '#2A0E0E',
      label: 'My Referrals',
      value: String(investor.referrals),
      onPress: () => onNavigate?.('Referral'),
      delay: 400,
    },
  ];

  const quickActions = [
    {
      icon: 'sprout',
      iconColor: '#3ECF60',
      iconBg: '#0F3A1A',
      title: 'Invest in Land',
      subtitle: 'Plan A — Agri Farm',
      route: 'Plans',
    },
    {
      icon: 'cow',
      iconColor: '#3DB8CF',
      iconBg: '#0A2A30',
      title: 'Lease a Cow',
      subtitle: 'Plan B — Cow Leasing',
      route: 'Plans',
    },
    {
      icon: 'chart-line',
      iconColor: '#F5A623',
      iconBg: '#2A1C08',
      title: 'Daily Income',
      subtitle: 'Track your earnings',
      route: 'Daily Income',
    },
    {
      icon: 'account-multiple-plus',
      iconColor: '#C27AF5',
      iconBg: '#1E1030',
      title: 'Refer & Earn',
      subtitle: '1% monthly on referrals',
      route: 'Referral',
    },
  ];

  const benefits = [
    {icon: '🏡', title: '2 Luxury Eco Cottage stays/year', subtitle: '2N/3D, up to 4 pax'},
    {icon: '💰', title: 'Up to 5% one-time cashback', subtitle: 'When offer is open'},
    {icon: '👥', title: '1% monthly referral income', subtitle: 'On referred active accounts'},
    {icon: '🎁', title: 'Reward points on every purchase', subtitle: 'Redeem for stays, products, cashback'},
    {icon: '📈', title: 'Up to 10 top-up options/year', subtitle: 'Per financial year'},
    {icon: '🏦', title: 'Advance wallet payment option', subtitle: 'With T&C'},
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
          <Icon name="leaf" size={18} color={Colors.accentGreen} />
          <Text style={styles.topBarTitle}>Overview</Text>
        </View>

        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Welcome Banner ── */}
        <Animated.View
          style={[
            styles.welcomeBanner,
            {opacity: headerOpacity, transform: [{translateY: headerY}]},
          ]}>
          <View style={styles.welcomeLeft}>
            <View style={styles.welcomeAvatar}>
              <Text style={styles.welcomeAvatarText}>{initial}</Text>
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Welcome back, {investor.name}!
              </Text>
              <Text style={styles.welcomeEmail}>
                Investor · {investor.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.investBtn}
            onPress={onInvestNow}
            activeOpacity={0.85}>
            <Icon name="leaf" size={14} color={Colors.textInverse} />
            <Text style={styles.investBtnText}>Invest Now</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stat Cards Grid ── */}
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.quickGrid}>
          {quickActions.map(qa => (
            <QuickAction
              key={qa.title}
              icon={qa.icon}
              iconColor={qa.iconColor}
              iconBg={qa.iconBg}
              title={qa.title}
              subtitle={qa.subtitle}
              onPress={() => onNavigate?.(qa.route)}
            />
          ))}
        </View>

        {/* ── Member Benefits ── */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Text style={styles.benefitsHeaderIcon}>🎁</Text>
            <Text style={styles.benefitsTitle}>Your Member Benefits</Text>
          </View>
          <View style={styles.benefitsGrid}>
            {benefits.map(b => (
              <BenefitItem key={b.title} {...b} />
            ))}
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
  hamburger: {
    padding: Spacing.xs,
  },
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  topBarTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: -0.3,
  },
  avatarBtn: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },

  scroll: {flex: 1},
  scrollContent: {padding: Spacing.md},

  // Welcome banner
  welcomeBanner: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    ...Shadow.subtle,
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  welcomeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeAvatarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
  },
  welcomeText: {flex: 1},
  welcomeTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 2,
  },
  welcomeEmail: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
  },
  investBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentGreen,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Shadow.subtle,
  },
  investBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCardWrap: {
    width: '47.5%',
  },
  statCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.subtle,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
  },

  // Section title
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },

  // Quick actions
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '47.5%',
    ...Shadow.subtle,
  },
  quickIconBg: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {flex: 1},
  quickTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 1,
  },
  quickSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
  },

  // Benefits
  benefitsCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.subtle,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  benefitsHeaderIcon: {
    fontSize: 20,
  },
  benefitsTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },
  benefitsGrid: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  benefitIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  benefitText: {flex: 1},
  benefitTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    marginBottom: 1,
  },
  benefitSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
  },
});

// Platform import
import {Platform} from 'react-native';

export default DashboardScreen;