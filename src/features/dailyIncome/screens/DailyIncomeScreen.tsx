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
import { Colors, Typography, Spacing, Radius } from '@theme/index';
import { DailyIncome } from '@/features/dailyIncome/types/DailyIncome';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockIncome: DailyIncome[] = [];

const FILTER_OPTIONS = ['All types', 'cow', 'land', 'referral', 'reward', 'cashback'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
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
                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DailyIncomeScreen({ navigation }: any) {
    const [filter, setFilter] = useState('All types');

    const openDrawer = () => navigation.openDrawer();

    const filtered =
        filter === 'All types' ? mockIncome : mockIncome.filter(i => i.incomeType === filter);

    const total = filtered.reduce((sum, i) => sum + i.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                <View style={styles.body}>
                    <TotalCard total={total} count={filtered.length} />

                    {/* Filter row */}
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

                    {/* Records */}
                    <View style={styles.card}>
                        {filtered.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filtered.map(income => (
                                <View key={income._id} style={styles.incomeRow}>
                                    <View style={styles.incomeIconWrap}>
                                        <Ionicons
                                            name={
                                                income.incomeType === 'cow'
                                                    ? 'leaf-outline'
                                                    : income.incomeType === 'land'
                                                    ? 'business-outline'
                                                    : 'cash-outline'
                                            }
                                            size={16}
                                            color={Colors.accentGreen}
                                        />
                                    </View>
                                    <View style={styles.incomeInfo}>
                                        <Text style={styles.incomeType}>{income.incomeType}</Text>
                                        <Text style={styles.incomeDesc}>{income.description}</Text>
                                    </View>
                                    <View style={styles.incomeRight}>
                                        <Text style={styles.incomeAmount}>+₹{income.amount}</Text>
                                        <Text
                                            style={[
                                                styles.incomeStatus,
                                                income.status === 'credited'
                                                    ? styles.statusCredited
                                                    : styles.statusPending,
                                            ]}
                                        >
                                            {income.status}
                                        </Text>
                                    </View>
                                </View>
                            ))
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
    incomeDesc: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
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
