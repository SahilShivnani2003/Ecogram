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
import { Plan } from '../types/Plan';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockPlans: Plan[] = [
    {
        _id: '1',
        name: 'Green Land Basic',
        description: 'Invest in fertile agricultural land plots with guaranteed daily returns.',
        isActive: true,
        planType: 'land',
        returnRate: 12,
        durationMonths: 24,
        minAmount: 50000,
        pricePerSqft: 500,
        sizes: [100, 200, 500],
        investorPercentage: 80,
        companyPercentage: 20,
        paymentMode: 'wallet',
        topUpLimit: 10,
        referralIncentive: 5,
        cashbackPercentage: 2,
        rewardPoints: 100,
        luxuryStaysPerYear: 2,
        guaranteedDailyIncome: 150,
        renewalAvailable: true,
        features: ['Guaranteed returns', 'Land ownership docs', '2 luxury stays/yr'],
    },
    {
        _id: '2',
        name: 'Premium Cow Plan',
        description: 'Invest in high-yield dairy cows and earn from milk production daily.',
        isActive: true,
        planType: 'cow',
        returnRate: 18,
        durationMonths: 12,
        minAmount: 25000,
        investorPercentage: 70,
        companyPercentage: 30,
        cowPriceMin: 25000,
        cowPriceMax: 45000,
        maxCowsPerPerson: 5,
        milkCapacityMin: 10,
        milkCapacityMax: 20,
        ratePerLitre: 45,
        lactationMonths: 10,
        paymentMode: 'wallet',
        topUpLimit: 5,
        referralIncentive: 3,
        cashbackPercentage: 1.5,
        rewardPoints: 50,
        luxuryStaysPerYear: 1,
        renewalAvailable: true,
        features: ['Daily milk income', 'Vet care included', 'Exit option'],
    },
];

const TYPE_FILTERS = ['All', 'land', 'cow'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Investment Plans</Text>
                <Text style={styles.headerSubtitle}>Choose a plan to start earning</Text>
            </View>
        </View>
    );
}

function PlanCard({ plan, onInvest }: { plan: Plan; onInvest: (p: Plan) => void }) {
    const isLand = plan.planType === 'land';
    return (
        <View style={styles.planCard}>
            {/* Badge */}
            <View style={styles.planCardTop}>
                <View
                    style={[
                        styles.planTypeBadge,
                        { backgroundColor: isLand ? Colors.accentMuted : '#1A2A00' },
                    ]}
                >
                    <Ionicons
                        name={isLand ? 'leaf-outline' : 'logo-usd'}
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
                <View style={styles.returnBadge}>
                    <Text style={styles.returnBadgeText}>{plan.returnRate}% p.a.</Text>
                </View>
            </View>

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description}</Text>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>
                        ₹{(plan.minAmount / 1000).toFixed(0)}K+
                    </Text>
                    <Text style={styles.statItemLabel}>Min. Invest</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{plan.durationMonths}M</Text>
                    <Text style={styles.statItemLabel}>Duration</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{plan.luxuryStaysPerYear}</Text>
                    <Text style={styles.statItemLabel}>Stays/yr</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{plan.cashbackPercentage}%</Text>
                    <Text style={styles.statItemLabel}>Cashback</Text>
                </View>
            </View>

            {/* Features */}
            {plan.features && (
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

            <TouchableOpacity
                style={styles.investBtn}
                onPress={() => onInvest(plan)}
                activeOpacity={0.85}
            >
                <Text style={styles.investBtnText}>Invest Now</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PlansScreen({ navigation }: any) {
    const [activeType, setActiveType] = useState('All');
    const openDrawer = () => navigation.openDrawer();

    const filtered =
        activeType === 'All' ? mockPlans : mockPlans.filter(p => p.planType === activeType);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* Type Filter */}
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

                {/* Plan cards */}
                <View style={styles.cardsContainer}>
                    {filtered.map(plan => (
                        <PlanCard
                            key={plan._id}
                            plan={plan}
                            onInvest={p => navigation.navigate('Investments')}
                        />
                    ))}
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
    filterTabActive: {
        backgroundColor: Colors.accentGreen,
        borderColor: Colors.accentGreen,
    },
    filterTabText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
    filterTabTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },

    cardsContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },

    planCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadow.card,
    },
    planCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
    planDesc: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm,
        marginVertical: Spacing.xs,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statItemValue: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statItemLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
    },

    features: { gap: 6 },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
    },

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
    investBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },
});
