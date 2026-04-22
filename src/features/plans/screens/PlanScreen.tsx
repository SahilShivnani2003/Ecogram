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
import { Plan } from '../types/Plan';
import { useGetPlans } from '../hooks/useGetPlans';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_FILTERS: Array<'All' | Plan['planType']> = ['All', 'land', 'cow'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compact rupee formatter:  150000 → ₹1.5L  |  5000 → ₹5K  |  500 → ₹500 */
function formatAmount(n: number): string {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
    return `₹${n}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Investment Plans</Text>
                <Text style={styles.headerSubtitle}>Choose a plan to start earning</Text>
            </View>
        </View>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <View style={styles.statItem}>
            <Text style={styles.statItemValue}>{value}</Text>
            <Text style={styles.statItemLabel}>{label}</Text>
        </View>
    );
}

// ── Land-specific details ────────────────────────────────────────────────────
function LandDetails({ plan }: { plan: Plan }) {
    if (plan.planType !== 'land') return null;
    const hasSqft = plan.pricePerSqft != null;
    const hasSizes = plan.sizes && plan.sizes.length > 0;
    if (!hasSqft && !hasSizes) return null;

    return (
        <View style={styles.extraDetails}>
            {hasSqft && (
                <View style={styles.extraRow}>
                    <Ionicons name="grid-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.extraText}>
                        Price per sqft: <Text style={styles.extraValue}>₹{plan.pricePerSqft}</Text>
                    </Text>
                </View>
            )}
            {hasSizes && (
                <View style={styles.extraRow}>
                    <Ionicons name="resize-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.extraText}>
                        Available sizes:{' '}
                        <Text style={styles.extraValue}>{plan.sizes!.join(', ')} sqft</Text>
                    </Text>
                </View>
            )}
        </View>
    );
}

// ── Cow-specific details ─────────────────────────────────────────────────────
function CowDetails({ plan }: { plan: Plan }) {
    if (plan.planType !== 'cow') return null;

    const rows: { icon: string; label: string; value: string }[] = [];

    if (plan.cowPriceMin != null && plan.cowPriceMax != null) {
        rows.push({
            icon: 'pricetag-outline',
            label: 'Cow price range',
            value: `${formatAmount(plan.cowPriceMin)} – ${formatAmount(plan.cowPriceMax)}`,
        });
    }
    if (plan.milkCapacityMin != null && plan.milkCapacityMax != null) {
        rows.push({
            icon: 'water-outline',
            label: 'Milk capacity',
            value: `${plan.milkCapacityMin}–${plan.milkCapacityMax} L/day`,
        });
    }
    if (plan.ratePerLitre != null) {
        rows.push({
            icon: 'cash-outline',
            label: 'Rate per litre',
            value: `₹${plan.ratePerLitre}`,
        });
    }
    if (plan.lactationMonths != null) {
        rows.push({
            icon: 'calendar-outline',
            label: 'Lactation period',
            value: `${plan.lactationMonths} months`,
        });
    }
    if (plan.maxCowsPerPerson != null) {
        rows.push({
            icon: 'people-outline',
            label: 'Max cows/person',
            value: String(plan.maxCowsPerPerson),
        });
    }

    if (rows.length === 0) return null;

    return (
        <View style={styles.extraDetails}>
            {rows.map(r => (
                <View key={r.label} style={styles.extraRow}>
                    <Ionicons name={r.icon as any} size={13} color={Colors.textMuted} />
                    <Text style={styles.extraText}>
                        {r.label}: <Text style={styles.extraValue}>{r.value}</Text>
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ── Shared meta: guaranteed income, profit sharing, renewal, buyback ─────────
function PlanMeta({ plan }: { plan: Plan }) {
    const rows: { icon: string; text: string }[] = [];

    if (plan.guaranteedDailyIncome != null) {
        rows.push({
            icon: 'trending-up-outline',
            text: `Guaranteed daily income: ₹${plan.guaranteedDailyIncome}`,
        });
    }
    if (plan.profitSharingFrequency) {
        rows.push({
            icon: 'refresh-outline',
            text: `Profit sharing: ${plan.profitSharingFrequency}`,
        });
    }
    if (plan.renewalAvailable) {
        rows.push({ icon: 'checkmark-done-outline', text: 'Renewal available' });
    }
    if (plan.buyBackOption) {
        rows.push({ icon: 'swap-horizontal-outline', text: `Buy-back: ${plan.buyBackOption}` });
    }

    if (rows.length === 0) return null;

    return (
        <View style={styles.metaSection}>
            {rows.map(r => (
                <View key={r.text} style={styles.metaRow}>
                    <Ionicons name={r.icon as any} size={13} color={Colors.accentGreen} />
                    <Text style={styles.metaText}>{r.text}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Full plan card ────────────────────────────────────────────────────────────
function PlanCard({ plan, onInvest }: { plan: Plan; onInvest: (p: Plan) => void }) {
    const isLand = plan.planType === 'land';
    const isInactive = !plan.isActive;

    return (
        <View style={[styles.planCard, isInactive && styles.planCardInactive]}>
            {/* Top row */}
            <View style={styles.planCardTop}>
                <View style={styles.planCardTopLeft}>
                    <View
                        style={[
                            styles.planTypeBadge,
                            { backgroundColor: isLand ? Colors.accentMuted : '#1A2A00' },
                        ]}
                    >
                        <Ionicons
                            name={isLand ? 'leaf-outline' : 'paw-outline'}
                            size={12}
                            color={isLand ? Colors.accentGreen : Colors.accentLime}
                        />
                        <Text
                            style={[
                                styles.planTypeBadgeText,
                                { color: isLand ? Colors.accentGreen : Colors.accentLime },
                            ]}
                        >
                            {plan.planType.toUpperCase()}
                        </Text>
                    </View>

                    {isInactive && (
                        <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
                        </View>
                    )}
                </View>

                <View style={styles.returnBadge}>
                    <Text style={styles.returnBadgeText}>{plan.returnRate}% p.a.</Text>
                </View>
            </View>

            {/* Name & description */}
            <Text style={[styles.planName, isInactive && styles.textDimmed]}>{plan.name}</Text>
            {plan.description ? <Text style={styles.planDesc}>{plan.description}</Text> : null}

            {/* Stats grid row 1: investment basics */}
            <View style={styles.statsGrid}>
                <StatItem value={formatAmount(plan.minAmount)} label="Min. Invest" />
                <View style={styles.statDivider} />
                <StatItem value={`${plan.durationMonths}M`} label="Duration" />
                <View style={styles.statDivider} />
                <StatItem value={`${plan.cashbackPercentage}%`} label="Cashback" />
                <View style={styles.statDivider} />
                <StatItem value={String(plan.luxuryStaysPerYear)} label="Stays/yr" />
            </View>

            {/* Stats grid row 2: profit split */}
            <View style={styles.splitRow}>
                <StatItem value={`${plan.investorPercentage}%`} label="Investor" />
                <View style={styles.statDivider} />
                <StatItem value={`${plan.companyPercentage}%`} label="Company" />
                <View style={styles.statDivider} />
                <StatItem value={String(plan.rewardPoints)} label="Rewards" />
                <View style={styles.statDivider} />
                <StatItem value={`${plan.referralIncentive}%`} label="Referral" />
            </View>

            {/* Guaranteed income, renewal, buyback, profit freq */}
            <PlanMeta plan={plan} />

            {/* Type-specific details */}
            <LandDetails plan={plan} />
            <CowDetails plan={plan} />

            {/* Feature checklist */}
            {plan.features && plan.features.length > 0 && (
                <View style={styles.features}>
                    {plan.features.map((f, i) => (
                        <View key={i} style={styles.featureItem}>
                            <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={Colors.accentGreen}
                            />
                            <Text style={styles.featureText}>{f}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* CTA */}
            <TouchableOpacity
                style={[styles.investBtn, isInactive && styles.investBtnDisabled]}
                onPress={() => onInvest(plan)}
                disabled={isInactive}
                activeOpacity={0.85}
            >
                <Text style={styles.investBtnText}>
                    {isInactive ? 'Plan Unavailable' : 'Invest Now'}
                </Text>
                {!isInactive && (
                    <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
                )}
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PlansScreen({ navigation }: any) {
    const { data: plans, isLoading, isError, isRefetching, refetch } = useGetPlans();
    debugger;
    const [activeType, setActiveType] = useState<'All' | Plan['planType']>('All');

    const openDrawer = () => navigation.openDrawer();

    // Null-safe derived list
    const allPlans: Plan[] = plans ?? [];
    const filtered =
        activeType === 'All' ? allPlans : allPlans.filter(p => p.planType === activeType);

    const handleInvest = (plan: Plan) => {
        navigation.navigate('Investments', { plan });
    };

    // ── Loading ────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.accentGreen} />
                    <Text style={styles.loadingText}>Fetching investment plans…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────
    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
                <ScreenHeader onMenuPress={openDrawer} />
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
                    <Text style={styles.errorText}>Failed to load plans.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main ───────────────────────────────────────────────────────────────
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

                {/* Type filter */}
                <View style={styles.filterRow}>
                    {TYPE_FILTERS.map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setActiveType(t)}
                            style={[styles.filterTab, activeType === t && styles.filterTabActive]}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    activeType === t && styles.filterTabTextActive,
                                ]}
                            >
                                {t === 'All'
                                    ? 'All Plans'
                                    : `${t.charAt(0).toUpperCase() + t.slice(1)} Plans`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cards */}
                <View style={styles.cardsContainer}>
                    {filtered.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-outline" size={36} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No plans available.</Text>
                        </View>
                    ) : (
                        filtered.map(plan => (
                            <PlanCard key={plan._id} plan={plan} onInvest={handleInvest} />
                        ))
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
    headerSubtitle: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, marginTop: 2 },

    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    filterTab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    filterTabActive: { backgroundColor: Colors.accentGreen, borderColor: Colors.accentGreen },
    filterTabText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
    filterTabTextActive: { color: Colors.textInverse, fontWeight: Typography.fontWeightBold },

    cardsContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    emptyText: { fontSize: Typography.fontSizeMD, color: Colors.textMuted },

    // Card
    planCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadow.card,
    },
    planCardInactive: { opacity: 0.55 },
    planCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },

    planTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    planTypeBadgeText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightBold,
        letterSpacing: Typography.letterSpacingWide,
    },

    inactiveBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    inactiveBadgeText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.error,
        fontWeight: Typography.fontWeightBold,
        letterSpacing: Typography.letterSpacingWide,
    },

    returnBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.accentGreen,
    },
    returnBadgeText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    planName: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    textDimmed: { color: Colors.textMuted },
    planDesc: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 20 },

    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm,
        marginVertical: Spacing.xs,
    },
    splitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statItemValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statItemLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        marginTop: 2,
        textAlign: 'center',
    },
    statDivider: { width: 1, height: 28, backgroundColor: Colors.border },

    metaSection: { gap: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },

    extraDetails: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        gap: 5,
    },
    extraRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    extraText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    extraValue: { color: Colors.textPrimary, fontWeight: Typography.fontWeightSemiBold },

    features: { gap: 6 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featureText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },

    investBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 2,
        marginTop: Spacing.xs,
    },
    investBtnDisabled: { backgroundColor: Colors.bgElevated },
    investBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },
});
