import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '@theme/index';
import { ExitRequest, BankDetails } from '../../../types/ExitRequest';
import { Investment } from '@features/investments/types/Investment';
import { useGetMyInvestment } from '@/features/investments/hooks/useGetMyInvestment';
import { useGetExitRequest } from '../hooks/useGetExitRequest';

const REASONS = [
    { value: 'personal', label: 'Personal Reasons' },
    { value: 'financial', label: 'Financial Emergency' },
    { value: 'missed_payouts', label: 'Missed Payouts' },
    { value: 'other', label: 'Other' },
] as const;

type ReasonValue = (typeof REASONS)[number]['value'];

// ─── Eligibility helpers ──────────────────────────────────────────────────────

const LOCK_IN_MONTHS = 6;

/** Months elapsed since investment start date (0 if startDate missing) */
function getMonthsElapsed(startDate?: Date): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

/** Whether the 6-month lock-in has been completed */
function isLockInCompleted(investment: Investment): boolean {
    return getMonthsElapsed(investment.startDate) >= LOCK_IN_MONTHS;
}

/**
 * Earned income to date = principal × (returnRate / 100) × (monthsElapsed / 12)
 * Simple pro-rata on annual rate.
 */
function computeEarnedToDate(investment: Investment): number {
    const months = Math.min(getMonthsElapsed(investment.startDate), investment.durationMonths);
    return Math.round(investment.investedAmount * (investment.returnRate / 100) * (months / 12));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Exit Request</Text>
                <Text style={styles.headerSubtitle}>Request early exit from your investments</Text>
            </View>
        </View>
    );
}

function PolicyCard() {
    return (
        <View style={styles.policyCard}>
            <View style={styles.policyIconWrap}>
                <Ionicons name="information-circle-outline" size={22} color="#60AADF" />
            </View>
            <View style={styles.policyContent}>
                <Text style={styles.policyTitle}>Exit Policy</Text>
                {[
                    { bold: true, text: 'Minimum 6 months lock-in period required' },
                    { bold: false, text: 'OR 2 consecutive missed payouts allows early exit' },
                    { bold: false, text: 'Refund includes principal + earned income till date' },
                    { bold: false, text: 'Admin review required (typically 2-3 business days)' },
                    { bold: false, text: 'Funds will be transferred to your bank account' },
                ].map((item, i) => (
                    <View key={i} style={styles.policyItem}>
                        <Text style={styles.policyBullet}>•</Text>
                        <Text style={[styles.policyText, item.bold && styles.policyTextBold]}>
                            {item.text}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function EligibilityBadge({ investment }: { investment: Investment }) {
    const eligible = isLockInCompleted(investment);
    const monthsElapsed = getMonthsElapsed(investment.startDate);
    const monthsRemaining = Math.max(0, LOCK_IN_MONTHS - monthsElapsed);

    return (
        <View
            style={[
                styles.eligibilityBadge,
                { borderColor: eligible ? Colors.accentGreen : Colors.warning },
            ]}
        >
            <Ionicons
                name={eligible ? 'checkmark-circle-outline' : 'time-outline'}
                size={14}
                color={eligible ? Colors.accentGreen : Colors.warning}
            />
            <Text
                style={[
                    styles.eligibilityText,
                    { color: eligible ? Colors.accentGreen : Colors.warning },
                ]}
            >
                {eligible ? 'Eligible for Exit' : `${monthsRemaining}mo lock-in remaining`}
            </Text>
        </View>
    );
}

function InvestmentSelectCard({
    investment,
    selected,
    onSelect,
}: {
    investment: Investment;
    selected: boolean;
    onSelect: () => void;
}) {
    const eligible = isLockInCompleted(investment);

    return (
        <TouchableOpacity
            style={[
                styles.invSelectCard,
                selected && styles.invSelectCardActive,
                !eligible && styles.invSelectCardDisabled,
            ]}
            onPress={eligible ? onSelect : undefined}
            activeOpacity={eligible ? 0.8 : 1}
        >
            <View style={styles.invSelectLeft}>
                <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                    {selected && <View style={styles.radioInner} />}
                </View>
                <View style={{ gap: 4 }}>
                    <Text style={styles.invSelectName}>{investment.planName}</Text>
                    <Text style={styles.invSelectMeta}>
                        ₹{investment.investedAmount.toLocaleString()} • {investment.planType} •{' '}
                        <Text
                            style={{
                                color:
                                    investment.status === 'active'
                                        ? Colors.success
                                        : Colors.warning,
                            }}
                        >
                            {investment.status}
                        </Text>
                    </Text>
                    <EligibilityBadge investment={investment} />
                </View>
            </View>
            <View style={styles.invSelectRight}>
                <Text style={styles.invSelectReturn}>{investment.returnRate}% p.a.</Text>
            </View>
        </TouchableOpacity>
    );
}

function SkeletonCard() {
    return (
        <View style={styles.emptyCard}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, styles.skeletonLineSm]} />
        </View>
    );
}

function ExitRequestCard({ req }: { req: ExitRequest }) {
    const statusColor: Record<string, string> = {
        pending: Colors.warning,
        approved: Colors.success,
        rejected: Colors.error,
        processed: Colors.accentGreen,
    };
    const color = statusColor[req.status] ?? Colors.textMuted;

    return (
        <View style={styles.reqCard}>
            <View style={styles.reqCardTop}>
                <View>
                    <Text style={styles.reqId}>#{req._id?.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.reqDate}>
                        {req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : '—'}
                    </Text>
                </View>
                <View style={[styles.reqStatusBadge, { borderColor: color }]}>
                    <Text style={[styles.reqStatusText, { color }]}>{req.status}</Text>
                </View>
            </View>
            <View style={styles.reqAmounts}>
                <View style={styles.reqAmount}>
                    <Text style={styles.reqAmountLabel}>Principal</Text>
                    <Text style={styles.reqAmountValue}>
                        ₹{req.principalAmount.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.reqAmount}>
                    <Text style={styles.reqAmountLabel}>Earned</Text>
                    <Text style={[styles.reqAmountValue, { color: Colors.accentGreen }]}>
                        ₹{req.earnedAmount.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.reqAmount}>
                    <Text style={styles.reqAmountLabel}>Total</Text>
                    <Text style={[styles.reqAmountValue, { color: Colors.accentGreen }]}>
                        ₹{req.requestedAmount.toLocaleString()}
                    </Text>
                </View>
            </View>
            {req.adminNotes ? (
                <Text style={styles.reqAdminNote}>Admin: {req.adminNotes}</Text>
            ) : null}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExitRequestScreen({ navigation }: any) {
    const {
        data: investmentData,
        isLoading: loadingInvestments,
        refetch: refetchInvestments,
        isRefetching: refetchingInvestments,
    } = useGetMyInvestment();

    const {
        data: exitRequestData,
        isLoading: loadingExitRequests,
        isRefetching: refetchingExitRequests,
        refetch: refetchExitRequests,
    } = useGetExitRequest();

    const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
    const [reason, setReason] = useState<ReasonValue>('personal');
    const [reasonDetails, setReasonDetails] = useState('');
    const [bankDetails, setBankDetails] = useState<BankDetails>({});
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openDrawer = () => navigation.openDrawer();

    // Real data from hooks
    const investments: Investment[] = investmentData ?? [];
    const exitRequests: ExitRequest[] = exitRequestData ?? [];

    const activeInvestments = investments.filter(i => ['active', 'pending'].includes(i.status));
    const selectedInv = investments.find(i => i._id === selectedInvId);

    // Validate bank details before submission
    const isBankDetailsValid = () => {
        const { accountHolderName, accountNumber, ifscCode, bankName } = bankDetails;
        return (
            accountHolderName?.trim() &&
            accountNumber?.trim() &&
            ifscCode?.trim() &&
            bankName?.trim()
        );
    };

    const handleSubmit = async () => {
        if (!selectedInv) return;

        if (!isBankDetailsValid()) {
            Alert.alert('Missing Details', 'Please fill in all bank details before submitting.');
            return;
        }

        try {
            setIsSubmitting(true);
            // TODO: replace with your actual API call, e.g.:
            // await submitExitRequest({
            //     investment: selectedInv._id!,
            //     reason,
            //     reasonDetails,
            //     bankDetails,
            // });
            Alert.alert(
                'Request Submitted',
                'Your exit request has been submitted. It will be reviewed within 2-3 business days.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setShowForm(false);
                            setSelectedInvId(null);
                            setReasonDetails('');
                            setBankDetails({});
                            setReason('personal');
                            refetchExitRequests();
                        },
                    },
                ],
            );
        } catch (error: any) {
            Alert.alert(
                'Submission Failed',
                error?.message ?? 'Something went wrong. Please try again.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                <View style={styles.body}>
                    <PolicyCard />

                    {/* Select Investment */}
                    <View>
                        <Text style={styles.sectionTitle}>Select Investment to Exit</Text>

                        {loadingInvestments || refetchingInvestments ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : activeInvestments.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="wallet-outline"
                                    size={32}
                                    color={Colors.textMuted}
                                />
                                <Text style={styles.emptyStateText}>
                                    No active investments found
                                </Text>
                            </View>
                        ) : (
                            activeInvestments.map(inv => (
                                <InvestmentSelectCard
                                    key={inv._id}
                                    investment={inv}
                                    selected={selectedInvId === inv._id}
                                    onSelect={() => {
                                        setSelectedInvId(inv._id ?? null);
                                        setShowForm(true);
                                    }}
                                />
                            ))
                        )}
                    </View>

                    {/* Exit form — shown once investment selected */}
                    {showForm && selectedInv && (
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Exit Details</Text>

                            {/* Reason */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Reason for Exit</Text>
                                <View style={styles.reasonGrid}>
                                    {REASONS.map(r => (
                                        <TouchableOpacity
                                            key={r.value}
                                            onPress={() => setReason(r.value)}
                                            style={[
                                                styles.reasonChip,
                                                reason === r.value && styles.reasonChipActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.reasonChipText,
                                                    reason === r.value &&
                                                        styles.reasonChipTextActive,
                                                ]}
                                            >
                                                {r.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Details */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Additional Details (optional)</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Describe your reason..."
                                    placeholderTextColor={Colors.textMuted}
                                    multiline
                                    numberOfLines={3}
                                    value={reasonDetails}
                                    onChangeText={setReasonDetails}
                                />
                            </View>

                            {/* Bank Details */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Bank Details for Refund</Text>
                                {(
                                    [
                                        {
                                            key: 'accountHolderName',
                                            label: 'Account Holder Name',
                                            placeholder: 'Full name',
                                        },
                                        {
                                            key: 'accountNumber',
                                            label: 'Account Number',
                                            placeholder: 'Enter account number',
                                        },
                                        {
                                            key: 'ifscCode',
                                            label: 'IFSC Code',
                                            placeholder: 'e.g. SBIN0001234',
                                        },
                                        {
                                            key: 'bankName',
                                            label: 'Bank Name',
                                            placeholder: 'e.g. State Bank of India',
                                        },
                                    ] as const
                                ).map(field => (
                                    <View key={field.key} style={styles.inputWrap}>
                                        <Text style={styles.inputLabel}>{field.label}</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={field.placeholder}
                                            placeholderTextColor={Colors.textMuted}
                                            value={(bankDetails as any)[field.key] ?? ''}
                                            onChangeText={v =>
                                                setBankDetails(prev => ({
                                                    ...prev,
                                                    [field.key]: v,
                                                }))
                                            }
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Summary */}
                            {(() => {
                                const earned = computeEarnedToDate(selectedInv);
                                const total = selectedInv.investedAmount + earned;
                                return (
                                    <View style={styles.summaryBox}>
                                        <Text style={styles.summaryTitle}>Refund Estimate</Text>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Invested Amount</Text>
                                            <Text style={styles.summaryValue}>
                                                ₹{selectedInv.investedAmount.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Earned to Date</Text>
                                            <Text
                                                style={[
                                                    styles.summaryValue,
                                                    { color: Colors.accentGreen },
                                                ]}
                                            >
                                                ₹{earned.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                                            <Text style={styles.summaryTotalLabel}>
                                                Estimated Total
                                            </Text>
                                            <Text style={styles.summaryTotalValue}>
                                                ₹{total.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })()}

                            {/* Eligibility warning if lock-in not completed */}
                            {!isLockInCompleted(selectedInv) && (
                                <View style={styles.warningBox}>
                                    <Ionicons
                                        name="warning-outline"
                                        size={16}
                                        color={Colors.warning}
                                    />
                                    <Text style={styles.warningText}>
                                        This investment has not completed the 6-month lock-in period
                                        ({getMonthsElapsed(selectedInv.startDate)} of{' '}
                                        {LOCK_IN_MONTHS} months done). Your request may be rejected.
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                onPress={handleSubmit}
                                activeOpacity={0.85}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color={Colors.textPrimary} />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="log-out-outline"
                                            size={16}
                                            color={Colors.textInverse}
                                        />
                                        <Text style={styles.submitBtnText}>
                                            Submit Exit Request
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Past Requests */}
                    {loadingExitRequests || refetchingExitRequests ? (
                        <SkeletonCard />
                    ) : exitRequests.length > 0 ? (
                        <View>
                            <Text style={styles.sectionTitle}>Previous Exit Requests</Text>
                            {exitRequests.map(req => (
                                <ExitRequestCard key={req._id} req={req} />
                            ))}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDeep },
    scroll: { paddingBottom: Spacing.xxl },
    body: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    menuBtn: { marginTop: 2, padding: Spacing.xs },
    headerTitle: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    policyCard: {
        flexDirection: 'row',
        gap: Spacing.md,
        backgroundColor: '#0A1A2A',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: '#1A3A5A',
        padding: Spacing.md,
    },
    policyIconWrap: { paddingTop: 2 },
    policyContent: { flex: 1, gap: 5 },
    policyTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    policyItem: { flexDirection: 'row', gap: 6 },
    policyBullet: { color: Colors.textSecondary, marginTop: 1 },
    policyText: {
        flex: 1,
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        lineHeight: 19,
    },
    policyTextBold: { fontWeight: Typography.fontWeightSemiBold, color: Colors.textPrimary },

    sectionTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },

    emptyCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    skeletonLine: {
        height: 14,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        width: '60%',
    },
    skeletonLineSm: { width: '80%' },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    emptyStateText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
    },

    eligibilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    eligibilityText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
    },

    invSelectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    invSelectCardActive: {
        borderColor: Colors.accentGreen,
        backgroundColor: Colors.bgElevated,
    },
    invSelectCardDisabled: {
        opacity: 0.55,
    },
    invSelectLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: Radius.full,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: { borderColor: Colors.accentGreen },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentGreen,
    },
    invSelectName: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    invSelectMeta: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    invSelectRight: {},
    invSelectReturn: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },

    formCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    formTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    formField: { gap: Spacing.sm },
    formLabel: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightMedium,
        color: Colors.textSecondary,
    },
    reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    reasonChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bgElevated,
    },
    reasonChipActive: {
        backgroundColor: Colors.accentGreen,
        borderColor: Colors.accentGreen,
    },
    reasonChipText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
    reasonChipTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },
    textArea: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        padding: Spacing.md,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputWrap: { gap: 4, marginBottom: Spacing.sm },
    inputLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    input: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },

    summaryBox: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryTitle: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
    summaryValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.sm,
        marginTop: Spacing.xs,
    },
    summaryTotalLabel: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    summaryTotalValue: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },

    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: '#2A1A00',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.warning,
        padding: Spacing.md,
    },
    warningText: {
        flex: 1,
        fontSize: Typography.fontSizeXS,
        color: Colors.warning,
        lineHeight: 18,
    },

    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.error,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },

    reqCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    reqCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    reqId: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    reqDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    reqStatusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    reqStatusText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    reqAmounts: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
    },
    reqAmount: { flex: 1, alignItems: 'center', gap: 2 },
    reqAmountLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    reqAmountValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    reqAdminNote: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
});
