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
    Alert,
    Clipboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { User, UserAddress, UpdateUser } from '../types/User';
import { useAuthStore } from '@/store/useAuthStore';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { InvestorDrawerParamList } from '@/types/InvestorDrawerParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
        </View>
    );
}

function AvatarSection({ user }: { user: User }) {
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <TouchableOpacity style={styles.avatarEdit}>
                    <Ionicons name="camera-outline" size={14} color={Colors.textInverse} />
                </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark-outline" size={12} color={Colors.accentGreen} />
                <Text style={styles.roleText}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
            </View>
        </View>
    );
}

function StatsStrip({ user }: { user: User }) {
    const joined = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
          })
        : '—';

    return (
        <View style={styles.statsStrip}>
            <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{user.rewardPoints}</Text>
                <Text style={styles.statItemLabel}>Reward Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statItemValue}>
                    {user.cashbackReceived ? 'Received' : 'Pending'}
                </Text>
                <Text style={styles.statItemLabel}>Cashback</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{joined}</Text>
                <Text style={styles.statItemLabel}>Member Since</Text>
            </View>
        </View>
    );
}

function EditableField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    editable = true,
}: {
    label: string;
    value: string;
    onChangeText?: (v: string) => void;
    placeholder?: string;
    keyboardType?: any;
    editable?: boolean;
}) {
    return (
        <View style={styles.editField}>
            <Text style={styles.editFieldLabel}>{label}</Text>
            <TextInput
                style={[styles.editFieldInput, !editable && styles.editFieldInputDisabled]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder ?? label}
                placeholderTextColor={Colors.textMuted}
                keyboardType={keyboardType}
                editable={editable}
            />
        </View>
    );
}

function SectionCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
                <Ionicons name={icon as any} size={16} color={Colors.accentGreen} />
                <Text style={styles.sectionCardTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type profileScreenProps = DrawerScreenProps<InvestorDrawerParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: profileScreenProps) {
    const { user: userData, removeAuth } = useAuthStore();
    const { mutate: updateUser, isPending: isSaving } = useUpdateUser();

    // Guard: if no user in store yet, render nothing meaningful
    if (!userData) return null;

    const [phone, setPhone] = useState(userData.phone ?? '');
    const [address, setAddress] = useState<UserAddress>(userData.address ?? {});
    const [editing, setEditing] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const openDrawer = () => navigation.openDrawer();

    const handleCopyCode = () => {
        if (!userData.referralCode) return;
        Clipboard.setString(userData.referralCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleCancel = () => {
        // Reset editable fields back to the original store values
        setPhone(userData.phone ?? '');
        setAddress(userData.address ?? {});
        setEditing(false);
    };

    const handleSave = () => {
        const payload: UpdateUser = {
            email: userData.email,
            name: userData.name,
            phone,
        };

        updateUser(payload, {
            onSuccess: () => {
                setEditing(false);
                Alert.alert('Saved', 'Profile updated successfully.');
            },
            onError: (err: any) => {
                Alert.alert(
                    'Update Failed',
                    err?.message ?? 'Something went wrong. Please try again.',
                );
            },
        });
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    removeAuth();
                    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>().reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                <AvatarSection user={userData} />
                <StatsStrip user={userData} />

                <View style={styles.body}>
                    {/* Personal Info */}
                    <SectionCard title="Personal Information" icon="person-outline">
                        {/* Name and email are read-only — not part of UpdateUser payload */}
                        <EditableField label="Full Name" value={userData.name} editable={false} />
                        <EditableField label="Email" value={userData.email} editable={false} />
                        <EditableField
                            label="Phone"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={editing}
                        />
                    </SectionCard>

                    {/* Address — display only, not in UpdateUser */}
                    <SectionCard title="Address" icon="location-outline">
                        <EditableField
                            label="Street"
                            value={address.street ?? ''}
                            onChangeText={v => setAddress(p => ({ ...p, street: v }))}
                            editable={editing}
                        />
                        <EditableField
                            label="City"
                            value={address.city ?? ''}
                            onChangeText={v => setAddress(p => ({ ...p, city: v }))}
                            editable={editing}
                        />
                        <EditableField
                            label="State"
                            value={address.state ?? ''}
                            onChangeText={v => setAddress(p => ({ ...p, state: v }))}
                            editable={editing}
                        />
                        <EditableField
                            label="Pincode"
                            value={address.pincode ?? ''}
                            onChangeText={v => setAddress(p => ({ ...p, pincode: v }))}
                            keyboardType="numeric"
                            editable={editing}
                        />
                    </SectionCard>

                    {/* Referral */}
                    <SectionCard title="Referral Code" icon="share-social-outline">
                        <View style={styles.referralRow}>
                            <View style={styles.referralCodeBox}>
                                <Text style={styles.referralCode}>
                                    {userData.referralCode ?? '—'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.referralCopyBtn,
                                    codeCopied && styles.referralCopyBtnCopied,
                                ]}
                                onPress={handleCopyCode}
                                disabled={!userData.referralCode}
                            >
                                <Ionicons
                                    name={codeCopied ? 'checkmark' : 'copy-outline'}
                                    size={16}
                                    color={Colors.accentGreen}
                                />
                                <Text style={styles.referralCopyText}>
                                    {codeCopied ? 'Copied!' : 'Copy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.referralHint}>
                            Share your code and earn 1% monthly on every active referral.
                        </Text>
                    </SectionCard>

                    {/* Account Status */}
                    <SectionCard title="Account" icon="shield-outline">
                        <View style={styles.accountRow}>
                            <Ionicons
                                name={userData.isActive ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={userData.isActive ? Colors.success : Colors.error}
                            />
                            <Text style={styles.accountStatusText}>
                                Account is{' '}
                                <Text
                                    style={{
                                        color: userData.isActive ? Colors.success : Colors.error,
                                        fontWeight: Typography.fontWeightSemiBold,
                                    }}
                                >
                                    {userData.isActive ? 'Active' : 'Inactive'}
                                </Text>
                            </Text>
                        </View>
                        <View style={styles.accountRow}>
                            <Ionicons name="id-card-outline" size={16} color={Colors.textMuted} />
                            <Text style={styles.accountStatusText}>
                                Role:{' '}
                                <Text
                                    style={{
                                        color: Colors.accentGreen,
                                        fontWeight: Typography.fontWeightSemiBold,
                                    }}
                                >
                                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                                </Text>
                            </Text>
                        </View>
                    </SectionCard>

                    {/* Edit / Save / Cancel */}
                    {!editing ? (
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setEditing(true)}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="create-outline" size={16} color={Colors.textInverse} />
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={handleCancel}
                                activeOpacity={0.85}
                                disabled={isSaving}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                                onPress={handleSave}
                                activeOpacity={0.85}
                                disabled={isSaving}
                            >
                                <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                                <Text style={styles.saveBtnText}>
                                    {isSaving ? 'Saving…' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="log-out-outline" size={16} color={Colors.error} />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
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
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    menuBtn: { padding: Spacing.xs },
    headerTitle: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },

    avatarSection: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentMuted,
        borderWidth: 3,
        borderColor: Colors.accentGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
    },
    avatarEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentGreen,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.bgDeep,
    },
    userName: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    userEmail: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.accentMuted,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    roleText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    statsStrip: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 3 },
    statItemValue: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statItemLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 2 },

    body: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

    sectionCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sectionCardTitle: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },

    editField: { gap: 4 },
    editFieldLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    editFieldInput: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    editFieldInputDisabled: {
        opacity: 0.6,
    },

    referralRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    referralCodeBox: {
        flex: 1,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.accentMuted,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    referralCode: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.accentGreen,
        letterSpacing: Typography.letterSpacingWide,
    },
    referralCopyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.accentGreen,
    },
    referralCopyBtnCopied: {
        borderColor: Colors.accentMuted,
        opacity: 0.7,
    },
    referralCopyText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },
    referralHint: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        lineHeight: 17,
    },

    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: 3,
    },
    accountStatusText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
    },

    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
    },
    editBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },

    actionRow: { flexDirection: 'row', gap: Spacing.sm },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.sm + 4,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bgCard,
    },
    cancelBtnText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.textSecondary,
        fontWeight: Typography.fontWeightSemiBold,
    },
    saveBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
    },
    logoutBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.error,
    },
});
