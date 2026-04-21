import React, { useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Radius, Shadow, Spacing, Typography } from '@theme/index';
import { Investment } from '../types/Investment';
import { useGetMyInvestment } from '../hooks/useGetMyInvestment';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['All Plans', 'Land', 'Cow'] as const;
type Tab = (typeof TABS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
    return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(d?: Date | string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function statusColor(s: Investment['status']): string {
    switch (s) {
        case 'active':
            return Colors.success;
        case 'pending':
            return Colors.warning;
        case 'matured':
            return Colors.accentGreen;
        case 'withdrawn':
            return Colors.accentGreen;
        default:
            return Colors.error; // cancelled | rejected
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress, onNew }: { onMenuPress: () => void; onNew: () => void }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Investments</Text>
            </View>
            <TouchableOpacity style={styles.newBtn} onPress={onNew} activeOpacity={0.85}>
                <Ionicons name="add" size={16} color={Colors.textInverse} />
                <Text style={styles.newBtnText}>New</Text>
            </TouchableOpacity>
        </View>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
                <Ionicons name={icon as any} size={16} color={Colors.accentGreen} />
            </View>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summarySub}>{sub}</Text>
        </View>
    );
}

function EmptyState({ onStart }: { onStart: () => void }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No investments yet</Text>
            <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>Start Investing</Text>
            </TouchableOpacity>
        </View>
    );
}

// ── Land-specific section ────────────────────────────────────────────────────
function LandDetailsSection({ d }: { d: Investment['landDetails'] }) {
    if (!d) return null;
    const rows: { label: string; value: string }[] = [];

    if (d.sqft != null) rows.push({ label: 'Area', value: `${d.sqft} sqft` });
    if (d.pricePerSqft != null) rows.push({ label: 'Price/sqft', value: `₹${d.pricePerSqft}` });
    if (d.totalValue != null)
        rows.push({ label: 'Plot value', value: formatCurrency(d.totalValue) });
    if (d.plotId) rows.push({ label: 'Plot ID', value: d.plotId });
    if (d.guaranteedDailyIncome != null)
        rows.push({ label: 'Daily income', value: `₹${d.guaranteedDailyIncome}/day` });

    if (rows.length === 0) return null;
    return <DetailGrid rows={rows} />;
}

// ── Cow-specific section ─────────────────────────────────────────────────────
function CowDetailsSection({ d }: { d: Investment['cowDetails'] }) {
    if (!d) return null;
    const rows: { label: string; value: string }[] = [];

    if (d.cowCount != null) rows.push({ label: 'Cows', value: String(d.cowCount) });
    if (d.cowPrice != null) rows.push({ label: 'Cow price', value: formatCurrency(d.cowPrice) });
    if (d.investorPercentage != null)
        rows.push({ label: 'Investor share', value: `${d.investorPercentage}%` });
    if (d.companyPercentage != null)
        rows.push({ label: 'Company share', value: `${d.companyPercentage}%` });
    if (d.investorContribution != null)
        rows.push({ label: 'Your contribution', value: formatCurrency(d.investorContribution) });
    if (d.milkCapacityMin != null && d.milkCapacityMax != null)
        rows.push({
            label: 'Milk capacity',
            value: `${d.milkCapacityMin}–${d.milkCapacityMax} L/day`,
        });
    if (d.ratePerLitre != null) rows.push({ label: 'Rate/litre', value: `₹${d.ratePerLitre}` });
    if (d.lactationStartDate)
        rows.push({ label: 'Lactation start', value: formatDate(d.lactationStartDate) });
    if (d.lactationEndDate)
        rows.push({ label: 'Lactation end', value: formatDate(d.lactationEndDate) });
    if (d.lactationMonthsRemaining != null)
        rows.push({ label: 'Months left', value: `${d.lactationMonthsRemaining}M` });
    if (d.renewalEligible)
        rows.push({ label: 'Renewal', value: d.renewalRequested ? 'Requested' : 'Eligible' });
    if (d.cowId) rows.push({ label: 'Cow ID', value: d.cowId });

    if (rows.length === 0) return null;
    return <DetailGrid rows={rows} />;
}

// ── Reusable 2-col key/value grid ────────────────────────────────────────────
function DetailGrid({ rows }: { rows: { label: string; value: string }[] }) {
    return (
        <View style={styles.detailGrid}>
            {rows.map(r => (
                <View key={r.label} style={styles.detailCell}>
                    <Text style={styles.detailLabel}>{r.label}</Text>
                    <Text style={styles.detailValue}>{r.value}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Investment card ──────────────────────────────────────────────────────────
function InvestmentCard({ inv }: { inv: Investment }) {
    const [expanded, setExpanded] = useState(false);
    const sc = statusColor(inv.status);
    const isLand = inv.planType === 'land';

    return (
        <View style={styles.invCard}>
            {/* Top row: type + status */}
            <View style={styles.invCardTop}>
                <View style={styles.invTypeBadge}>
                    <Ionicons
                        name={isLand ? 'leaf-outline' : 'paw-outline'}
                        size={12}
                        color={Colors.accentGreen}
                    />
                    <Text style={styles.invTypeText}>{inv.planType.toUpperCase()}</Text>
                </View>
                <View style={styles.invCardTopRight}>
                    <Text style={styles.invFY}>{inv.financialYear}</Text>
                    <View style={[styles.invStatusBadge, { borderColor: sc }]}>
                        <Text style={[styles.invStatusText, { color: sc }]}>
                            {inv.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Plan name + top-up number */}
            <View style={styles.invNameRow}>
                <Text style={styles.invPlanName}>{inv.planName}</Text>
                <View style={styles.topUpBadge}>
                    <Text style={styles.topUpBadgeText}>Top-up #{inv.topUpNumber}</Text>
                </View>
            </View>

            {/* Core stats grid */}
            <View style={styles.invStats}>
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Invested</Text>
                    <Text style={styles.invStatValue}>{formatCurrency(inv.investedAmount)}</Text>
                </View>
                <View style={styles.invStatDivider} />
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Profit</Text>
                    <Text style={[styles.invStatValue, { color: Colors.accentGreen }]}>
                        {formatCurrency(inv.profitAmount)}
                    </Text>
                </View>
                <View style={styles.invStatDivider} />
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Total Return</Text>
                    <Text style={styles.invStatValue}>{formatCurrency(inv.returnAmount)}</Text>
                </View>
                <View style={styles.invStatDivider} />
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Rate</Text>
                    <Text style={styles.invStatValue}>{inv.returnRate}% p.a.</Text>
                </View>
            </View>

            {/* Dates + payment */}
            <View style={styles.invMeta}>
                <View style={styles.invMetaItem}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.invMetaText}>
                        {formatDate(inv.startDate)} → {formatDate(inv.maturityDate)}
                    </Text>
                </View>
                <View style={styles.invMetaItem}>
                    <Ionicons name="wallet-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.invMetaText}>
                        {inv.paymentMode.charAt(0).toUpperCase() + inv.paymentMode.slice(1)} ·{' '}
                        {inv.durationMonths}M
                    </Text>
                </View>
            </View>

            {/* Rewards / cashback row */}
            {(inv.cashbackAmount > 0 || inv.rewardPointsEarned > 0) && (
                <View style={styles.rewardsRow}>
                    {inv.cashbackAmount > 0 && (
                        <View style={styles.rewardChip}>
                            <Ionicons name="gift-outline" size={11} color={Colors.accentGreen} />
                            <Text style={styles.rewardChipText}>
                                Cashback {formatCurrency(inv.cashbackAmount)}
                                {inv.cashbackReceived ? ' ✓' : ' (pending)'}
                            </Text>
                        </View>
                    )}
                    {inv.rewardPointsEarned > 0 && (
                        <View style={styles.rewardChip}>
                            <Ionicons name="star-outline" size={11} color={Colors.accentGreen} />
                            <Text style={styles.rewardChipText}>{inv.rewardPointsEarned} pts</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Expand toggle for type-specific details */}
            {(inv.landDetails || inv.cowDetails || inv.notes) && (
                <TouchableOpacity
                    style={styles.expandBtn}
                    onPress={() => setExpanded(e => !e)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.expandBtnText}>
                        {expanded ? 'Hide details' : 'Show details'}
                    </Text>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={Colors.accentGreen}
                    />
                </TouchableOpacity>
            )}

            {expanded && (
                <View style={styles.expandedSection}>
                    <LandDetailsSection d={inv.landDetails} />
                    <CowDetailsSection d={inv.cowDetails} />
                    {inv.notes ? (
                        <View style={styles.notesBox}>
                            <Ionicons
                                name="document-text-outline"
                                size={13}
                                color={Colors.textMuted}
                            />
                            <Text style={styles.notesText}>{inv.notes}</Text>
                        </View>
                    ) : null}
                </View>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InvestmentsScreen({ navigation }: any) {
    const {
        data: investmentsData,
        isLoading,
        isError,
        isRefetching,
        refetch,
    } = useGetMyInvestment();

    const [activeTab, setActiveTab] = useState<Tab>('All Plans');
    const openDrawer = () => navigation.openDrawer();

    // ── Null-safe derived data ────────────────────────────────────────────
    const allInvestments: Investment[] = investmentsData?.investments ?? [];

    const filtered = allInvestments.filter(inv => {
        if (activeTab === 'All Plans') return true;
        return inv.planType === activeTab.toLowerCase();
    });

    const tabCount = (tab: Tab) =>
        tab === 'All Plans'
            ? allInvestments.length
            : allInvestments.filter(i => i.planType === tab.toLowerCase()).length;

    // Summary stats
    const totalTopUps = allInvestments.length;
    const activeLandPlots = allInvestments.filter(
        i => i.planType === 'land' && i.status === 'active',
    ).length;
    const activeCows = allInvestments.filter(
        i => i.planType === 'cow' && i.status === 'active',
    ).length;
    const totalLuxuryStays = allInvestments.reduce(
        (s, i) => s + (i.landDetails?.sqft != null ? 0 : 0),
        0,
    );
    // totalEarned across all investments
    const totalProfit = allInvestments.reduce((s, i) => s + i.profitAmount, 0);

    // ── Loading ───────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} onNew={() => navigation.navigate('Plans')} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.accentGreen} />
                    <Text style={styles.loadingText}>Loading your investments…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────
    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} onNew={() => navigation.navigate('Plans')} />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
                    <Text style={styles.errorText}>Failed to load investments.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={Colors.accentGreen}
                        colors={[Colors.accentGreen]}
                    />
                }
            >
                <ScreenHeader onMenuPress={openDrawer} onNew={() => navigation.navigate('Plans')} />

                {/* Summary cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.summaryRow}
                >
                    <SummaryCard
                        icon="layers-outline"
                        label="Total Investments"
                        value={String(totalTopUps)}
                        sub="All time"
                    />
                    <SummaryCard
                        icon="trending-up-outline"
                        label="Total Profit"
                        value={formatCurrency(totalProfit)}
                        sub="Across all plans"
                    />
                    <SummaryCard
                        icon="leaf-outline"
                        label="Land Plans"
                        value={String(activeLandPlots)}
                        sub="Active plots"
                    />
                    <SummaryCard
                        icon="paw-outline"
                        label="Cow Plans"
                        value={String(activeCows)}
                        sub="Active cows"
                    />
                </ScrollView>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                        >
                            {tab !== 'All Plans' && (
                                <Ionicons
                                    name={tab === 'Land' ? 'leaf-outline' : 'paw-outline'}
                                    size={13}
                                    color={
                                        activeTab === tab ? Colors.textInverse : Colors.textMuted
                                    }
                                />
                            )}
                            <Text
                                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                            >
                                {tab} ({tabCount(tab)})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Investment cards */}
                <View style={styles.content}>
                    {filtered.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <EmptyState onStart={() => navigation.navigate('Plans')} />
                        </View>
                    ) : (
                        filtered.map(inv => <InvestmentCard key={inv._id} inv={inv} />)
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

    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
        gap: Spacing.md,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        marginTop: Spacing.sm,
    },
    errorText: { color: Colors.error, fontSize: Typography.fontSizeMD, textAlign: 'center' },
    retryBtn: {
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
    },
    retryBtnText: {
        color: Colors.textInverse,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    menuBtn: { padding: Spacing.xs },
    headerTitle: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    newBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
    },
    newBtnText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },

    // Summary
    summaryRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.md },
    summaryCard: {
        width: 150,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: 3,
    },
    summaryIconWrap: {
        width: 30,
        height: 30,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    summaryValue: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    summaryLabel: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        fontWeight: Typography.fontWeightMedium,
    },
    summarySub: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },

    // Tabs
    tabs: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 3,
        marginBottom: Spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
    },
    tabActive: { backgroundColor: Colors.accentGreen },
    tabText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
    tabTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightBold },

    content: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },

    // Empty
    emptyCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
    emptyText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
    startBtn: {
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full,
    },
    startBtnText: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
        fontSize: Typography.fontSizeMD,
    },

    // Investment card
    invCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadow.card,
    },
    invCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invCardTopRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    invTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    invTypeText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightBold,
    },
    invFY: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    invStatusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    invStatusText: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold },

    invNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    invPlanName: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        flex: 1,
    },
    topUpBadge: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    topUpBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },

    // Stats grid
    invStats: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        paddingVertical: Spacing.sm,
    },
    invStat: { flex: 1, alignItems: 'center' },
    invStatDivider: { width: 1, backgroundColor: Colors.border },
    invStatLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    invStatValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        marginTop: 2,
    },

    // Meta row (dates + payment)
    invMeta: { gap: 4 },
    invMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    invMetaText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },

    // Rewards
    rewardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    rewardChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.accentMuted,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
    },
    rewardChipText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightMedium,
    },

    // Expand toggle
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingTop: Spacing.xs,
    },
    expandBtnText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    // Expanded section
    expandedSection: {
        gap: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.sm,
    },

    // Detail grid (land / cow)
    detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    detailCell: {
        width: '48%',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
    },
    detailLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted, marginBottom: 2 },
    detailValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },

    // Notes
    notesBox: {
        flexDirection: 'row',
        gap: Spacing.xs,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
    },
    notesText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
        flex: 1,
        lineHeight: 18,
    },
});
