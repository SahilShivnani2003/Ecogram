import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { Investment } from '../types/Investment';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockInvestments: Investment[] = [];

const TABS = ['All Plans', 'Land', 'Cow'] as const;
type Tab = (typeof TABS)[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress, onNew }: { onMenuPress: () => void; onNew: () => void }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>My Investments</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.newBtn} onPress={onNew} activeOpacity={0.85}>
                <Ionicons name="add" size={16} color={Colors.textInverse} />
                <Text style={styles.newBtnText}>New Investment</Text>
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

function InvestmentCard({ inv }: { inv: Investment }) {
    const statusColor =
        inv.status === 'active'
            ? Colors.success
            : inv.status === 'pending'
            ? Colors.warning
            : Colors.error;

    return (
        <View style={styles.invCard}>
            <View style={styles.invCardTop}>
                <View style={styles.invTypeBadge}>
                    <Ionicons
                        name={inv.planType === 'land' ? 'leaf-outline' : 'logo-usd'}
                        size={12}
                        color={Colors.accentGreen}
                    />
                    <Text style={styles.invTypeText}>{inv.planType}</Text>
                </View>
                <View style={[styles.invStatusBadge, { borderColor: statusColor }]}>
                    <Text style={[styles.invStatusText, { color: statusColor }]}>{inv.status}</Text>
                </View>
            </View>
            <Text style={styles.invPlanName}>{inv.planName}</Text>
            <View style={styles.invStats}>
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Invested</Text>
                    <Text style={styles.invStatValue}>₹{inv.investedAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Return</Text>
                    <Text style={[styles.invStatValue, { color: Colors.accentGreen }]}>
                        ₹{inv.returnAmount.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.invStat}>
                    <Text style={styles.invStatLabel}>Rate</Text>
                    <Text style={styles.invStatValue}>{inv.returnRate}%</Text>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InvestmentsScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState<Tab>('All Plans');
    const openDrawer = () => navigation.openDrawer();

    const filtered = mockInvestments.filter(inv => {
        if (activeTab === 'All Plans') return true;
        return inv.planType === activeTab.toLowerCase();
    });

    const topUpsUsed = mockInvestments.length;
    const luxuryStaysRemaining = 0;
    const activeLandPlots = mockInvestments.filter(
        i => i.planType === 'land' && i.status === 'active',
    ).length;
    const activeCows = mockInvestments.filter(
        i => i.planType === 'cow' && i.status === 'active',
    ).length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} onNew={() => navigation.navigate('Plans')} />

                {/* Summary Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.summaryRow}
                >
                    <SummaryCard
                        icon="trending-up-outline"
                        label="Top-ups Used"
                        value={`${topUpsUsed}/10`}
                        sub="FY 2026-27"
                    />
                    <SummaryCard
                        icon="gift-outline"
                        label="Luxury Stays"
                        value={`${luxuryStaysRemaining}/0`}
                        sub="Remaining this year"
                    />
                    <SummaryCard
                        icon="leaf-outline"
                        label="Land Plans"
                        value={`${activeLandPlots}`}
                        sub="Active plots"
                    />
                    <SummaryCard
                        icon="logo-usd"
                        label="Cow Plans"
                        value={`${activeCows}`}
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
                                    name={tab === 'Land' ? 'leaf-outline' : 'logo-usd'}
                                    size={13}
                                    color={
                                        activeTab === tab ? Colors.textInverse : Colors.textMuted
                                    }
                                />
                            )}
                            <Text
                                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                            >
                                {tab} (
                                {tab === 'All Plans'
                                    ? mockInvestments.length
                                    : mockInvestments.filter(i => i.planType === tab.toLowerCase())
                                          .length}
                                )
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
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

    summaryRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
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
    tabTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },

    content: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },

    emptyCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.md,
    },
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

    invCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    invCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    invStatusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    invStatusText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    invPlanName: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    invStats: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
        gap: Spacing.sm,
    },
    invStat: { flex: 1, alignItems: 'center' },
    invStatLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    invStatValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
});
