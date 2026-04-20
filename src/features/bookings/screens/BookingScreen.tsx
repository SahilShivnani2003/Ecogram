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
import { Booking } from '../types/Booking';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockBookings: Booking[] = [];

const STATUS_FILTERS = ['All', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.breadcrumb}>
                    <Ionicons name="arrow-back-outline" size={14} color={Colors.accentGreen} />
                    <Text style={styles.breadcrumbText}>Dashboard</Text>
                </View>
            </View>
            <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
    );
}

function BookingCard({ booking }: { booking: Booking }) {
    const statusColors: Record<string, string> = {
        confirmed: Colors.success,
        pending: Colors.warning,
        cancelled: Colors.error,
        completed: Colors.textMuted,
    };
    const color = statusColors[booking.status] ?? Colors.textMuted;

    const nights = booking.totalNights;
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <View style={styles.bookingCard}>
            <View style={styles.bookingCardTop}>
                <View style={styles.resortIconWrap}>
                    <Ionicons name="business-outline" size={20} color={Colors.accentGreen} />
                </View>
                <View style={styles.bookingMeta}>
                    <Text style={styles.bookingResortId} numberOfLines={1}>
                        Booking #{booking._id?.slice(-6).toUpperCase()}
                    </Text>
                    <Text style={styles.bookingDates}>
                        {checkInDate} → {checkOutDate}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: color }]}>
                    <Text style={[styles.statusText, { color }]}>{booking.status}</Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Guests</Text>
                    <Text style={styles.bookingDetailValue}>{booking.guests}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Nights</Text>
                    <Text style={styles.bookingDetailValue}>{nights}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Total</Text>
                    <Text style={[styles.bookingDetailValue, { color: Colors.accentGreen }]}>
                        ₹{booking.totalAmount.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.bookingDetailItem}>
                    <Text style={styles.bookingDetailLabel}>Payment</Text>
                    <Text
                        style={[
                            styles.bookingDetailValue,
                            {
                                color:
                                    booking.paymentStatus === 'paid'
                                        ? Colors.success
                                        : Colors.warning,
                            },
                        ]}
                    >
                        {booking.paymentStatus}
                    </Text>
                </View>
            </View>

            {booking.specialRequests ? (
                <Text style={styles.specialReq} numberOfLines={1}>
                    📝 {booking.specialRequests}
                </Text>
            ) : null}
        </View>
    );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <TouchableOpacity onPress={onBrowse} style={styles.browseLink}>
                <Text style={styles.browseLinkText}>Browse resorts →</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingsScreen({ navigation }: any) {
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const openDrawer = () => navigation.openDrawer();

    const filtered =
        activeFilter === 'All' ? mockBookings : mockBookings.filter(b => b.status === activeFilter);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* Stats strip */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsStrip}
                >
                    {[
                        { label: 'Total', value: mockBookings.length, icon: 'calendar' },
                        {
                            label: 'Confirmed',
                            value: mockBookings.filter(b => b.status === 'confirmed').length,
                            icon: 'checkmark-circle',
                        },
                        {
                            label: 'Pending',
                            value: mockBookings.filter(b => b.status === 'pending').length,
                            icon: 'time-outline',
                        },
                        {
                            label: 'Completed',
                            value: mockBookings.filter(b => b.status === 'completed').length,
                            icon: 'trophy-outline',
                        },
                    ].map(stat => (
                        <View key={stat.label} style={styles.statPill}>
                            <Ionicons
                                name={stat.icon as any}
                                size={13}
                                color={Colors.accentGreen}
                            />
                            <Text style={styles.statPillValue}>{stat.value}</Text>
                            <Text style={styles.statPillLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                >
                    {STATUS_FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            style={[
                                styles.filterChip,
                                activeFilter === f && styles.filterChipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    activeFilter === f && styles.filterChipTextActive,
                                ]}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Booking list / empty */}
                <View style={styles.listContainer}>
                    {filtered.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <EmptyState onBrowse={() => navigation.navigate('Resorts')} />
                        </View>
                    ) : (
                        filtered.map(b => <BookingCard key={b._id} booking={b} />)
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
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        gap: Spacing.xs,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    menuBtn: { padding: Spacing.xs },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    breadcrumbText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightMedium,
    },
    headerTitle: {
        fontSize: Typography.fontSize2XL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },

    statsStrip: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    statPillValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    statPillLabel: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
    },

    filterRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
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
    filterChipText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
    filterChipTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },

    listContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

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
    browseLink: { paddingVertical: Spacing.xs },
    browseLinkText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    bookingCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadow.subtle,
    },
    bookingCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    resortIconWrap: {
        width: 40,
        height: 40,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookingMeta: { flex: 1 },
    bookingResortId: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    bookingDates: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    statusText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },

    bookingDetails: {
        flexDirection: 'row',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
    },
    bookingDetailItem: { flex: 1, alignItems: 'center', gap: 2 },
    bookingDetailLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
    bookingDetailValue: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    detailDivider: {
        width: 1,
        backgroundColor: Colors.border,
        marginVertical: 2,
    },

    specialReq: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
});
