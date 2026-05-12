import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '@theme/index';
import { useGetWallet } from '@/features/wallet/hooks/useGetWallet';
import { useGetRerrals } from '@/features/referral/hooks/useGetRerrals';
import { useGetMyInvestment } from '@/features/investments/hooks/useGetMyInvestment';

// ─── Local display type ───────────────────────────────────────────────────────

type EarningCategory = 'reward_points' | 'referral_bonus' | 'cashback' | 'investment_return';

interface EarningEntry {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    amount: number;
    unit: 'pts' | 'inr';
    category: EarningCategory;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
    return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function categoryIcon(cat: EarningCategory): string {
    switch (cat) {
        case 'reward_points':
            return 'star-outline';
        case 'referral_bonus':
            return 'people-outline';
        case 'cashback':
            return 'gift-outline';
        case 'investment_return':
            return 'trending-up-outline';
    }
}

function categoryIconColor(cat: EarningCategory): string {
    switch (cat) {
        case 'reward_points':
            return '#F5C242';
        case 'referral_bonus':
            return '#C27AF5';
        case 'cashback':
            return Colors.accentGreen;
        case 'investment_return':
            return Colors.accentLime ?? '#A8E063';
    }
}

function categoryIconBg(cat: EarningCategory): string {
    switch (cat) {
        case 'reward_points':
            return '#2A2000';
        case 'referral_bonus':
            return '#1E1030';
        case 'cashback':
            return '#0F3A1A';
        case 'investment_return':
            return '#0F2A0F';
    }
}

// ─── Synthesise entries from API data ────────────────────────────────────────

function buildEarnings(investments: any[] = [], referrals: any[] = []): EarningEntry[] {
    const entries: EarningEntry[] = [];

    investments.forEach(inv => {
        if (inv.rewardPointsEarned > 0) {
            entries.push({
                id: `rp-${inv._id}`,
                title: `Reward points from ${inv.planName}`,
                subtitle: inv.planType,
                date: inv.createdAt,
                amount: inv.rewardPointsEarned,
                unit: 'pts',
                category: 'reward_points',
            });
        }
    });

    referrals.forEach(ref => {
        const name: string = ref.referred?.name ?? 'Referred user';
        const date: string = ref.createdAt;

        entries.push({
            id: `ref-signup-${ref._id}`,
            title: 'Referral signup bonus',
            subtitle: name,
            date,
            amount: 100,
            unit: 'pts',
            category: 'referral_bonus',
        });

        if (ref.status === 'active') {
            entries.push({
                id: `ref-invest-${ref._id}`,
                title: 'Referral investment bonus',
                subtitle: name,
                date,
                amount: 200,
                unit: 'pts',
                category: 'referral_bonus',
            });
        }
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Earnings History</Text>
                <Text style={styles.headerSubtitle}>
                    Track all your rewards, cashback, and referral earnings
                </Text>
            </View>
        </View>
    );
}

function StatCard({
    icon,
    label,
    value,
    iconColor,
    bgColor,
}: {
    icon: string;
    label: string;
    value: string;
    iconColor: string;
    bgColor: string;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <View style={styles.statCardTop}>
                <Ionicons name={icon as any} size={18} color={iconColor} />
                <Ionicons name="arrow-up-outline" size={14} color={Colors.textMuted} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function EarningRow({ entry }: { entry: EarningEntry }) {
    const iconColor = categoryIconColor(entry.category);
    const iconBg = categoryIconBg(entry.category);
    const icon = categoryIcon(entry.category);
    const amountStr =
        entry.unit === 'pts' ? `+${entry.amount} pts` : `+${formatCurrency(entry.amount)}`;

    return (
        <View style={styles.txRow}>
            <View style={[styles.txIconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon as any} size={16} color={iconColor} />
            </View>
            <View style={styles.txLeft}>
                <Text style={styles.txTitle} numberOfLines={1}>
                    {entry.title}
                </Text>
                <View style={styles.txMeta}>
                    <Text style={styles.txSubtitle}>{entry.subtitle}</Text>
                    <Text style={styles.txDot}>•</Text>
                    <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
                    <Text style={styles.txDate}>{formatDate(entry.date)}</Text>
                </View>
            </View>
            <Text style={[styles.txAmount, { color: iconColor }]}>{amountStr}</Text>
        </View>
    );
}

function EmptyState() {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Your earnings history will appear here</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EarningsScreen({ navigation }: any) {
    const openDrawer = () => navigation.openDrawer();

    const { data: walletData } = useGetWallet();
    const { data: referralData } = useGetRerrals();
    const { data: investmentData } = useGetMyInvestment();

    const rewardPoints: number = walletData?.wallet?.rewardPoints ?? 0;
    const cashbackEarned: number = walletData?.wallet?.cashbackBalance ?? 0;
    const referralEarnings: number = referralData?.stats?.totalEarned ?? 0;
    const investmentReturns: number = investmentData?.summary?.totalProfit ?? 0;

    const earnings: EarningEntry[] = buildEarnings(
        investmentData?.investments,
        referralData?.referrals,
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* ── 2 × 2 Stat Grid ── */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="star-outline"
                        label="Reward Points"
                        value={`${rewardPoints.toLocaleString('en-IN')} pts`}
                        iconColor="#F5C242"
                        bgColor="#2A2000"
                    />
                    <StatCard
                        icon="gift-outline"
                        label="Cashback Earned"
                        value={formatCurrency(cashbackEarned)}
                        iconColor={Colors.accentGreen}
                        bgColor={Colors.bgElevated}
                    />
                    <StatCard
                        icon="people-outline"
                        label="Referral Earnings"
                        value={formatCurrency(referralEarnings)}
                        iconColor="#60AADF"
                        bgColor="#0A1A2A"
                    />
                    <StatCard
                        icon="trending-up-outline"
                        label="Investment Returns"
                        value={formatCurrency(investmentReturns)}
                        iconColor={Colors.accentLime}
                        bgColor={Colors.bgElevated}
                    />
                </View>

                {/* ── Transaction History ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transaction History</Text>
                        <Text style={styles.sectionMeta}>
                            {earnings.length} {earnings.length === 1 ? 'record' : 'records'}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        {earnings.length === 0 ? (
                            <EmptyState />
                        ) : (
                            earnings.map(entry => <EarningRow key={entry.id} entry={entry} />)
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDeep },
    scroll: { paddingBottom: Spacing.xxl },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    menuBtn: { marginTop: 2, padding: Spacing.xs },
    headerText: { flex: 1 },
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

    // ── 2×2 grid ──
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    statCard: {
        // Two cards per row with a gap between them
        width: '47.5%',
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.xs,
    },
    statCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    statValue: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
    },

    section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    sectionMeta: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },

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
    emptySubText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },

    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    txIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    txLeft: { flex: 1 },
    txTitle: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        marginBottom: 3,
    },
    txMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    txSubtitle: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        textTransform: 'capitalize',
    },
    txDot: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
    },
    txDate: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
    },
    txAmount: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        minWidth: 70,
        textAlign: 'right',
    },
});
