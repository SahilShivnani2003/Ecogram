import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Share,
    Clipboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { Referral } from '../types/Referal';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockReferrals: Referral[] = [];
const mockReferralCode = 'ABN-INV2024';
const mockReferralLink = `https://abnecogrm.com/ref/${mockReferralCode}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Referral Program</Text>
                <Text style={styles.headerSubtitle}>
                    Earn 1% monthly on every active account you refer
                </Text>
            </View>
        </View>
    );
}

function StatCard({
    icon,
    iconColor,
    bgColor,
    value,
    label,
}: {
    icon: string;
    iconColor: string;
    bgColor: string;
    value: string;
    label: string;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <Ionicons name={icon as any} size={22} color={iconColor} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function ReferralMemberRow({ referral }: { referral: Referral }) {
    const statusColor =
        referral.status === 'active'
            ? Colors.success
            : referral.status === 'pending'
            ? Colors.warning
            : Colors.textMuted;

    return (
        <View style={styles.memberRow}>
            <View style={styles.memberAvatar}>
                <Ionicons name="person-outline" size={16} color={Colors.accentGreen} />
            </View>
            <View style={styles.memberInfo}>
                <Text style={styles.memberId}>
                    {referral.referred?.slice(-8).toUpperCase() ?? 'UNKNOWN'}
                </Text>
                <Text style={styles.memberDate}>
                    {referral.createdAt
                        ? new Date(referral.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                          })
                        : '—'}
                </Text>
            </View>
            <View style={styles.memberRight}>
                <Text style={styles.memberEarned}>₹{referral.totalEarned}</Text>
                <View style={[styles.memberStatusBadge, { borderColor: statusColor }]}>
                    <Text style={[styles.memberStatusText, { color: statusColor }]}>
                        {referral.status}
                    </Text>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ReferralScreen({ navigation }: any) {
    const [copied, setCopied] = useState(false);
    const openDrawer = () => navigation.openDrawer();

    const handleCopy = () => {
        Clipboard.setString(mockReferralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        await Share.share({
            message: `Join ABN Ecogram using my referral link and start investing!\n${mockReferralLink}`,
        });
    };

    const totalReferred = mockReferrals.length;
    const activeAccounts = mockReferrals.filter(r => r.status === 'active').length;
    const totalEarned = mockReferrals.reduce((s, r) => s + r.totalEarned, 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* Stat Cards */}
                <View style={styles.statsRow}>
                    <StatCard
                        icon="people-outline"
                        iconColor="#60AADF"
                        bgColor="#0A1A2A"
                        value={`${totalReferred}`}
                        label="Total Referred"
                    />
                    <StatCard
                        icon="checkmark-outline"
                        iconColor={Colors.accentGreen}
                        bgColor={Colors.bgElevated}
                        value={`${activeAccounts}`}
                        label="Active Accounts"
                    />
                    <StatCard
                        icon="logo-usd"
                        iconColor={Colors.warning}
                        bgColor="#2A2000"
                        value={`₹${totalEarned}`}
                        label="Total Earned"
                    />
                </View>

                {/* Referral Link Card */}
                <View style={styles.section}>
                    <View style={styles.linkCard}>
                        <View style={styles.linkCardHeader}>
                            <Ionicons
                                name="share-social-outline"
                                size={18}
                                color={Colors.accentGreen}
                            />
                            <Text style={styles.linkCardTitle}>Your Referral Link</Text>
                        </View>

                        {/* Link row */}
                        <View style={styles.linkRow}>
                            <View style={styles.linkBox}>
                                <Ionicons name="link-outline" size={14} color={Colors.textMuted} />
                                <Text style={styles.linkText} numberOfLines={1}>
                                    {mockReferralLink}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.copyBtn, copied && styles.copyBtnCopied]}
                                onPress={handleCopy}
                                activeOpacity={0.85}
                            >
                                <Ionicons
                                    name={copied ? 'checkmark' : 'copy-outline'}
                                    size={14}
                                    color={Colors.textInverse}
                                />
                                <Text style={styles.copyBtnText}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Code + hint */}
                        <View style={styles.codeRow}>
                            <Text style={styles.codeLabel}>Your code:</Text>
                            <View style={styles.codeBadge}>
                                <Text style={styles.codeText}>{mockReferralCode}</Text>
                            </View>
                        </View>
                        <Text style={styles.hintText}>
                            Share this link — earn 1% monthly on their active investment,
                            auto-credited to your wallet.
                        </Text>

                        {/* Share button */}
                        <TouchableOpacity
                            style={styles.shareBtn}
                            onPress={handleShare}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="share-outline" size={16} color={Colors.accentGreen} />
                            <Text style={styles.shareBtnText}>Share with Friends</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* How it works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How it works</Text>
                    <View style={styles.stepsCard}>
                        {[
                            { step: '1', text: 'Share your referral link with friends' },
                            { step: '2', text: 'They sign up and make an investment' },
                            { step: '3', text: 'You earn 1% of their investment monthly' },
                            { step: '4', text: 'Earnings auto-credited to your wallet' },
                        ].map(item => (
                            <View key={item.step} style={styles.stepRow}>
                                <View style={styles.stepNum}>
                                    <Text style={styles.stepNumText}>{item.step}</Text>
                                </View>
                                <Text style={styles.stepText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* My Team */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Team</Text>
                        <Text style={styles.sectionMeta}>{totalReferred} members</Text>
                    </View>

                    <View style={styles.card}>
                        {mockReferrals.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="people-outline"
                                    size={36}
                                    color={Colors.textMuted}
                                />
                                <Text style={styles.emptyText}>No referrals yet.</Text>
                                <Text style={styles.emptySubText}>
                                    Share your link to start earning!
                                </Text>
                            </View>
                        ) : (
                            mockReferrals.map(r => <ReferralMemberRow key={r._id} referral={r} />)
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

    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
        textAlign: 'center',
    },

    section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    sectionMeta: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },

    linkCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    linkCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    linkCardTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    linkRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        alignItems: 'center',
    },
    linkBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
    },
    linkText: {
        flex: 1,
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.sm,
    },
    copyBtnCopied: { backgroundColor: Colors.accentMuted },
    copyBtnText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },

    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    codeLabel: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },
    codeBadge: {
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.accentMuted,
    },
    codeText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
        letterSpacing: Typography.letterSpacingWide,
    },
    hintText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        lineHeight: 17,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 2,
        marginTop: Spacing.xs,
    },
    shareBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.accentGreen,
    },

    stepsCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    stepNum: {
        width: 28,
        height: 28,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },
    stepText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.textSecondary },

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

    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    memberAvatar: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberInfo: { flex: 1 },
    memberId: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    memberDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    memberRight: { alignItems: 'flex-end', gap: 4 },
    memberEarned: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },
    memberStatusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    memberStatusText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
});
