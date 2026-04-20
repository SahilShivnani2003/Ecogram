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
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { ExitRequest, BankDetails } from '../../../types/ExitRequest';
import { Investment } from '@features/investments/types/Investment';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockInvestments: Investment[] = [];
const mockExitRequests: ExitRequest[] = [];

const REASONS = [
    { value: 'personal', label: 'Personal Reasons' },
    { value: 'financial', label: 'Financial Emergency' },
    { value: 'missed_payouts', label: 'Missed Payouts' },
    { value: 'other', label: 'Other' },
] as const;

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

function InvestmentSelectCard({
    investment,
    selected,
    onSelect,
}: {
    investment: Investment;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.invSelectCard, selected && styles.invSelectCardActive]}
            onPress={onSelect}
            activeOpacity={0.8}
        >
            <View style={styles.invSelectLeft}>
                <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                    {selected && <View style={styles.radioInner} />}
                </View>
                <View>
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
                </View>
            </View>
            <View style={styles.invSelectRight}>
                <Text style={styles.invSelectReturn}>{investment.returnRate}% p.a.</Text>
            </View>
        </TouchableOpacity>
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
    const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
    const [reason, setReason] = useState<string>('personal');
    const [reasonDetails, setReasonDetails] = useState('');
    const [bankDetails, setBankDetails] = useState<BankDetails>({});
    const [showForm, setShowForm] = useState(false);

    const openDrawer = () => navigation.openDrawer();

    const selectedInv = mockInvestments.find(i => i._id === selectedInvId);

    const handleSubmit = () => {
        // submit logic here
        setShowForm(false);
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
                        {mockInvestments.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <View style={styles.skeletonLine} />
                                <View style={[styles.skeletonLine, styles.skeletonLineSm]} />
                            </View>
                        ) : (
                            mockInvestments
                                .filter(i => ['active', 'pending'].includes(i.status))
                                .map(inv => (
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
                                        style={[styles.summaryValue, { color: Colors.accentGreen }]}
                                    >
                                        ₹0
                                    </Text>
                                </View>
                                <View style={[styles.summaryRow, styles.summaryTotal]}>
                                    <Text style={styles.summaryTotalLabel}>Estimated Total</Text>
                                    <Text style={styles.summaryTotalValue}>
                                        ₹{selectedInv.investedAmount.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmit}
                                activeOpacity={0.85}
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={16}
                                    color={Colors.textInverse}
                                />
                                <Text style={styles.submitBtnText}>Submit Exit Request</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Past Requests */}
                    {mockExitRequests.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Previous Exit Requests</Text>
                            {mockExitRequests.map(req => (
                                <ExitRequestCard key={req._id} req={req} />
                            ))}
                        </View>
                    )}
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
    },
    skeletonLine: {
        height: 14,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        width: '60%',
    },
    skeletonLineSm: { width: '80%' },

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

    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.error,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
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
