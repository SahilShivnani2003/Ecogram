import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { Resort } from '../types/Resort';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockResorts: Resort[] = [
    {
        _id: '1',
        name: 'Green Valley Eco Lodge',
        description: 'A serene eco-lodge nestled in the hills with stunning valley views.',
        location: {
            address: '12 Hill Road',
            city: 'Coorg',
            state: 'Karnataka',
            pincode: '571201',
        },
        pricePerNight: 3500,
        images: [],
        amenities: ['WiFi', 'Breakfast', 'Pool'],
        facilities: {
            roomFeatures: ['AC', 'TV'],
            propertyFeatures: ['Pool', 'Gym'],
            parking: true,
            petFriendly: false,
        },
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        policies: {
            cancellation: 'Free cancellation 48hrs before',
            childPolicy: 'Children allowed',
            extraBedPolicy: 'Extra bed on request',
        },
        maxGuests: 2,
        rooms: 1,
        isAvailable: true,
        rating: 4.5,
        totalReviews: 32,
        featured: true,
        category: 'eco',
    },
    {
        _id: '2',
        name: 'Luxury Mountain Retreat',
        description: 'Experience luxury with panoramic mountain views and world-class amenities.',
        location: {
            address: 'Meadow Lane',
            city: 'Manali',
            state: 'Himachal Pradesh',
            pincode: '175131',
        },
        pricePerNight: 8000,
        images: [],
        amenities: ['WiFi', 'Spa', 'Pool', 'Restaurant'],
        facilities: {
            roomFeatures: ['AC', 'TV', 'Minibar'],
            propertyFeatures: ['Pool', 'Spa', 'Gym', 'Restaurant'],
            parking: true,
            petFriendly: true,
        },
        checkIn: '3:00 PM',
        checkOut: '12:00 PM',
        policies: {
            cancellation: 'Free cancellation 72hrs before',
            childPolicy: 'Children above 5 allowed',
            extraBedPolicy: 'Extra bed available at ₹500/night',
        },
        maxGuests: 4,
        rooms: 2,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 87,
        featured: true,
        category: 'luxury',
    },
];

const CATEGORIES = ['All', 'luxury', 'eco', 'adventure', 'budget'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Luxury Resorts</Text>
                <Text style={styles.headerSubtitle}>
                    Book your complimentary stays as an investor
                </Text>
            </View>
        </View>
    );
}

function ResortCard({ resort, onBook }: { resort: Resort; onBook: (r: Resort) => void }) {
    return (
        <View style={styles.resortCard}>
            {/* Image placeholder */}
            <View style={styles.resortImageWrap}>
                <View style={styles.resortImagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                        {resort.category.charAt(0).toUpperCase() + resort.category.slice(1)}
                    </Text>
                </View>
                {/* Location overlay */}
                <View style={styles.locationOverlay}>
                    <Ionicons name="location-outline" size={12} color={Colors.textPrimary} />
                    <Text style={styles.locationText}>
                        {resort.location.city}, {resort.location.state}
                    </Text>
                </View>
            </View>

            <View style={styles.resortBody}>
                <View style={styles.resortNameRow}>
                    <Text style={styles.resortName}>{resort.name}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={Colors.warning} />
                        <Text style={styles.ratingText}>{resort.rating}</Text>
                    </View>
                </View>
                <Text style={styles.resortDesc} numberOfLines={2}>
                    {resort.description}
                </Text>

                {/* Details row */}
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.detailText}>{resort.maxGuests} Guests</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="bed-outline" size={13} color={Colors.textMuted} />
                        <Text style={styles.detailText}>{resort.rooms} Room</Text>
                    </View>
                    {resort.facilities.parking && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailText}>P Parking</Text>
                        </View>
                    )}
                </View>

                {/* Amenity chips */}
                {resort.amenities && resort.amenities.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {resort.amenities.slice(0, 5).map(a => (
                            <View key={a} style={styles.chip}>
                                <Text style={styles.chipText}>{a}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Timing */}
                <Text style={styles.timingText}>
                    Check-in: <Text style={styles.timingValue}>{resort.checkIn}</Text>
                    {'   '}Check-out: <Text style={styles.timingValue}>{resort.checkOut}</Text>
                </Text>

                {/* Price + Book */}
                <View style={styles.priceBookRow}>
                    <View>
                        <Text style={styles.priceText}>
                            ₹{resort.pricePerNight.toLocaleString()}
                            <Text style={styles.perNight}>/night</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => onBook(resort)}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="calendar-outline" size={14} color={Colors.textInverse} />
                        <Text style={styles.bookBtnText}>Book</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResortsScreen({ navigation }: any) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const openDrawer = () => navigation.openDrawer();

    const filtered = mockResorts.filter(r => {
        const matchSearch =
            !search ||
            r.location.city.toLowerCase().includes(search.toLowerCase()) ||
            r.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === 'All' || r.category === activeCategory;
        return matchSearch && matchCat;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* Search + Filter */}
                <View style={styles.searchRow}>
                    <View style={styles.searchWrap}>
                        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by city..."
                            placeholderTextColor={Colors.textMuted}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryRow}
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            style={[
                                styles.categoryChip,
                                activeCategory === cat && styles.categoryChipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    activeCategory === cat && styles.categoryChipTextActive,
                                ]}
                            >
                                {cat === 'All'
                                    ? 'All Categories'
                                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Resort list */}
                <View style={styles.listContainer}>
                    {filtered.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="business-outline" size={36} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No resorts found</Text>
                        </View>
                    ) : (
                        filtered.map(resort => (
                            <ResortCard
                                key={resort._id}
                                resort={resort}
                                onBook={r => navigation.navigate('Bookings')}
                            />
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

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
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

    searchRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.fontSizeSM,
        color: Colors.textPrimary,
    },

    categoryRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryChipActive: {
        backgroundColor: Colors.bgElevated,
        borderColor: Colors.accentGreen,
    },
    categoryChipText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textMuted,
    },
    categoryChipTextActive: {
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    listContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

    resortCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },

    resortImageWrap: {
        height: 180,
        position: 'relative',
    },
    resortImagePlaceholder: {
        flex: 1,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    categoryBadgeText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },
    locationOverlay: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    locationText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textPrimary,
    },

    resortBody: { padding: Spacing.md, gap: Spacing.sm },
    resortNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    resortName: {
        flex: 1,
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    ratingText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textPrimary,
        fontWeight: Typography.fontWeightBold,
    },
    resortDesc: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        lineHeight: 19,
    },

    detailsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
    },

    chipsRow: { gap: Spacing.xs },
    chip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.accentMuted,
        backgroundColor: Colors.bgElevated,
    },
    chipText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
    },

    timingText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
    },
    timingValue: {
        color: Colors.textPrimary,
        fontWeight: Typography.fontWeightMedium,
    },

    priceBookRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    priceText: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    perNight: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightRegular,
        color: Colors.textMuted,
    },
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
    },
    bookBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },

    emptyCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.xxl,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeightMedium,
    },
});
