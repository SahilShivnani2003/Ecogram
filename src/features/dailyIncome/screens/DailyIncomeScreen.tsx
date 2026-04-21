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
import { Colors, Radius, Spacing, Typography } from '@theme/index';
import { DailyIncome } from '@/features/dailyIncome/types/DailyIncome';
import { useGetDailyIncome } from '../hooks/useGetDailyIncome';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: Array<'All types' | DailyIncome['incomeType']> = [
    'All types',
    'cow',
    'land',
    'referral',
    'reward',
    'cashback',
];

/** Icon per income type */
function incomeIcon(type: DailyIncome['incomeType']): string {
    switch (type) {
        case 'cow':
            return 'leaf-outline';
        case 'land':
            return 'business-outline';
        case 'referral':
            return 'people-outline';
        case 'reward':
            return 'star-outline';
        case 'cashback':
            return 'gift-outline';
        default:
            return 'cash-outline';
    }
}

function formatDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Daily Income Tracker</Text>
                <Text style={styles.headerSubtitle}>
                    Your earnings history from active investments
                </Text>
            </View>
        </View>
    );
}

function TotalCard({ total, count }: { total: number; count: number }) {
    return (
        <View style={styles.totalCard}>
            <View style={styles.totalIconWrap}>
                <Ionicons name="trending-up-outline" size={20} color={Colors.accentGreen} />
            </View>
            <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Total Daily Income Earned</Text>
                <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
                <Text style={styles.totalCount}>{count} income entries recorded</Text>
            </View>
        </View>
    );
}

function EmptyState() {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="logo-usd" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No income records yet.</Text>
            <Text style={styles.emptySubText}>Invest in a plan to start earning daily.</Text>
        </View>
    );
}

function IncomeRow({ income }: { income: DailyIncome }) {
    return (
        <View style={styles.incomeRow}>
            <View style={styles.incomeIconWrap}>
                <Ionicons
                    name={incomeIcon(income.incomeType)}
                    size={16}
                    color={Colors.accentGreen}
                />
            </View>

            <View style={styles.incomeInfo}>
                <Text style={styles.incomeType}>{income.incomeType}</Text>
                {/* description is optional in the interface */}
                {income.description ? (
                    <Text style={styles.incomeDesc}>{income.description}</Text>
                ) : null}
                {/* Always show the date from the DailyIncome record */}
                <Text style={styles.incomeDate}>{formatDate(income.date)}</Text>
            </View>

            <View style={styles.incomeRight}>
                <Text style={styles.incomeAmount}>+₹{income.amount.toLocaleString('en-IN')}</Text>
                <Text
                    style={[
                        styles.incomeStatus,
                        income.status === 'credited' ? styles.statusCredited : styles.statusPending,
                    ]}
                >
                    {income.status}
                </Text>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DailyIncomeScreen({ navigation }: any) {
    const { data: dailyIncome, isLoading, isError, refetch, isRefetching } = useGetDailyIncome();

    const [filter, setFilter] = useState<'All types' | DailyIncome['incomeType']>('All types');

    const openDrawer = () => navigation.openDrawer();

    // ── Safely derive display list ────────────────────────────────────────────
    const records: DailyIncome[] = dailyIncome ?? [];

    const filtered =
        filter === 'All types' ? records : records.filter(i => i.incomeType === filter);

    const total = filtered.reduce((sum, i) => sum + i.amount, 0);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.accentGreen} />
                    <Text style={styles.loadingText}>Loading income records…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
                    <Text style={styles.errorText}>Failed to load income records.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
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
                <ScreenHeader onMenuPress={openDrawer} />

                <View style={styles.body}>
                    <TotalCard total={total} count={filtered.length} />

                    {/* ── Filter row ── */}
                    <View style={styles.filterRow}>
                        <Text style={styles.entryCount}>{filtered.length} entries shown</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScroll}
                        >
                            {FILTER_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => setFilter(opt)}
                                    style={[
                                        styles.filterChip,
                                        filter === opt && styles.filterChipActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            filter === opt && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Records ── */}
                    <View style={styles.card}>
                        {filtered.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filtered.map(income => <IncomeRow key={income._id} income={income} />)
                        )}
                    </View>
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

    // Centered placeholder (loading / error)
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        padding: Spacing.xl,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        marginTop: Spacing.sm,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.fontSizeMD,
        textAlign: 'center',
    },
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

    totalCard: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    totalIconWrap: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: Colors.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalInfo: { flex: 1 },
    totalLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: Typography.letterSpacingWide,
    },
    totalValue: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    totalCount: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        marginTop: 2,
    },

    filterRow: { gap: Spacing.sm },
    entryCount: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
    },
    filterScroll: { gap: Spacing.sm },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bgCard,
    },
    filterChipActive: {
        backgroundColor: Colors.accentGreen,
        borderColor: Colors.accentGreen,
    },
    filterChipText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
    },
    filterChipTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightSemiBold,
    },

    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
    emptySubText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
    },

    incomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    incomeIconWrap: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    incomeInfo: { flex: 1 },
    incomeType: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    incomeDesc: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        marginTop: 1,
    },
    incomeDate: {
        // ← new: shows record.date
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        marginTop: 2,
    },
    incomeRight: { alignItems: 'flex-end', gap: 2 },
    incomeAmount: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },
    incomeStatus: {
        fontSize: Typography.fontSizeXS,
        textTransform: 'capitalize',
        fontWeight: Typography.fontWeightMedium,
    },
    statusCredited: { color: Colors.success },
    statusPending: { color: Colors.warning },
});
