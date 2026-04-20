import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerItem } from '@/types/DrawerItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Radius, Spacing, Typography } from '@theme/index';

type Props = DrawerContentComponentProps & {
    drawerItems: DrawerItem[];
    headerTitle?: string;
    footerContent?: React.ReactNode;
};

// ─── Icon Resolver ────────────────────────────────────────────────────────────

function DrawerIcon({ iconName, isActive }: { iconName: string; isActive: boolean }) {
    return (
        <Ionicons
            name={iconName as any}
            size={20}
            color={isActive ? Colors.accentGreen : Colors.textMuted}
        />
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomDrawerContent({
    drawerItems,
    headerTitle,
    footerContent,
    ...props
}: Props) {
    const { state, navigation } = props;
    const activeIndex = state.index;

    return (
        <SafeAreaView style={styles.drawerRoot}>
            {/* Header */}
            <View style={styles.drawerHeader}>
                <View style={styles.logoMark}>
                    <Text style={styles.logoText}>{headerTitle?.[0]?.toUpperCase() ?? '◈'}</Text>
                </View>
                <Text style={styles.drawerTitle}>{headerTitle ?? 'Menu'}</Text>
                <View style={styles.accentLine} />
            </View>

            {/* Nav Items */}
            <DrawerContentScrollView
                {...props}
                scrollEnabled={false}
                contentContainerStyle={styles.scrollContent}
            >
                {drawerItems.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => navigation.navigate(item.name)}
                            activeOpacity={0.7}
                            style={[styles.drawerItem, isActive && styles.drawerItemActive]}
                        >
                            {isActive && <View style={styles.activeBar} />}

                            <View style={styles.iconWrap}>
                                <DrawerIcon iconName={item.iconName} isActive={isActive} />
                            </View>

                            <Text
                                style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}
                            >
                                {item.label}
                            </Text>

                            {isActive && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    );
                })}
            </DrawerContentScrollView>

            {/* Footer */}
            {footerContent && <View style={styles.drawerFooter}>{footerContent}</View>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    drawer: {
        width: 280,
        backgroundColor: Colors.bgCard,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
    },
    drawerRoot: {
        flex: 1,
        backgroundColor: Colors.bgCard,
    },

    // Header
    drawerHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.lg,
        gap: Spacing.xs,
    },
    logoMark: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: Colors.accentGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    logoText: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },
    drawerTitle: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        letterSpacing: Typography.letterSpacingWide,
        textTransform: 'uppercase',
    },
    accentLine: {
        marginTop: Spacing.md,
        height: 1,
        backgroundColor: Colors.accentMuted,
        width: '100%',
    },

    // Scroll area
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        gap: Spacing.xs,
    },

    // Nav item
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.md,
        gap: Spacing.md,
        position: 'relative',
        overflow: 'hidden',
    },
    drawerItemActive: {
        backgroundColor: Colors.bgElevated,
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 3,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentGreen,
    },
    iconWrap: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerLabel: {
        flex: 1,
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightMedium,
        color: Colors.textMuted,
        letterSpacing: Typography.letterSpacingNormal,
    },
    drawerLabelActive: {
        color: Colors.textPrimary,
        fontWeight: Typography.fontWeightSemiBold,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: Radius.full,
        backgroundColor: Colors.accentGreen,
    },

    // Footer
    drawerFooter: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
});
