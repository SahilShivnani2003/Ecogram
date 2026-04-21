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
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { Resort } from '../types/Resort';
import { useGetAllResorts } from '../hooks/useGetAllResorts';

const CATEGORIES = ['All', 'luxury', 'eco', 'adventure', 'budget'] as const;
type Category = (typeof CATEGORIES)[number];

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

function SkeletonResortCard() {
    return (
        <View style={styles.resortCard}>
            <View style={[styles.resortImageWrap, { backgroundColor: Colors.bgElevated }]} />
            <View style={styles.resortBody}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '60%' }]} />
                <View style={[styles.skeletonLine, { width: '80%', marginTop: Spacing.xs }]} />
            </View>
        </View>
    );
}

function ResortCard({ resort, onBook }: { resort: Resort; onBook: (r: Resort) => void }) {
    const hasImage = resort.images && resort.images.length > 0;

    return (
        <View style={[styles.resortCard, !resort.isAvailable && styles.resortCardUnavailable]}>
            {/* Image */}
            <View style={styles.resortImageWrap}>
                {hasImage ? (
                    <Image
                        source={{ uri: resort.images[0] }}
                        style={styles.resortImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.resortImagePlaceholder}>
                        <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                    </View>
                )}

                {/* Featured badge */}
                {resort.featured && (
                    <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                    </View>
                )}

                {/* Category badge */}
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                        {resort.category.charAt(0).toUpperCase() + resort.category.slice(1)}
                    </Text>
                </View>

                {/* Unavailable overlay */}
                {!resort.isAvailable && (
                    <View style={styles.unavailableOverlay}>
                        <Text style={styles.unavailableText}>Currently Unavailable</Text>
                    </View>
                )}

                {/* Location overlay */}
                <View style={styles.locationOverlay}>
                    <Ionicons name="location-outline" size={12} color={Colors.textPrimary} />
                    <Text style={styles.locationText}>
                        {resort.location.city}, {resort.location.state}
                    </Text>
                </View>
            </View>

            <View style={styles.resortBody}>
                {/* Name + Rating */}
                <View style={styles.resortNameRow}>
                    <Text style={styles.resortName} numberOfLines={1}>
                        {resort.name}
                    </Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color={Colors.warning} />
                        <Text style={styles.ratingText}>{resort.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewCount}>({resort.totalReviews})</Text>
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
                        <Text style={styles.detailText}>{resort.rooms} Rooms</Text>
                    </View>
                    {resort.facilities.parking && (
                        <View style={styles.detailItem}>
                            <Ionicons name="car-outline" size={13} color={Colors.textMuted} />
                            <Text style={styles.detailText}>Parking</Text>
                        </View>
                    )}
                    {resort.facilities.petFriendly && (
                        <View style={styles.detailItem}>
                            <Ionicons name="paw-outline" size={13} color={Colors.textMuted} />
                            <Text style={styles.detailText}>Pet Friendly</Text>
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

                {/* Check-in / Check-out */}
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
                        style={[styles.bookBtn, !resort.isAvailable && styles.bookBtnDisabled]}
                        onPress={() => resort.isAvailable && onBook(resort)}
                        activeOpacity={resort.isAvailable ? 0.85 : 1}
                        disabled={!resort.isAvailable}
                    >
                        <Ionicons name="calendar-outline" size={14} color={Colors.textInverse} />
                        <Text style={styles.bookBtnText}>
                            {resort.isAvailable ? 'Book' : 'Unavailable'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResortsScreen({ navigation }: any) {
    const { data: allResorts, isLoading, refetch, isRefetching } = useGetAllResorts();

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('All');

    const openDrawer = () => navigation.openDrawer();

    const resorts: Resort[] = allResorts ?? [];

    const filtered = resorts.filter(r => {
        const q = search.toLowerCase();
        const matchSearch =
            !search ||
            r.location.city.toLowerCase().includes(q) ||
            r.location.state.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q);
        const matchCat = activeCategory === 'All' || r.category === activeCategory;
        return matchSearch && matchCat;
    });

    const isLoadingAny = isLoading || isRefetching;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} />

                {/* Search */}
                <View style={styles.searchRow}>
                    <View style={styles.searchWrap}>
                        <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or city..."
                            placeholderTextColor={Colors.textMuted}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category filter */}
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
                    {isLoadingAny ? (
                        <>
                            <SkeletonResortCard />
                            <SkeletonResortCard />
                            <SkeletonResortCard />
                        </>
                    ) : filtered.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="business-outline" size={36} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No resorts found</Text>
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Text style={styles.clearSearchText}>Clear search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        filtered.map(resort => (
                            <ResortCard
                                key={resort._id}
                                resort={resort}
                                onBook={r => navigation.navigate('Bookings', { resortId: r._id })}
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

    skeletonLine: {
        height: 14,
        borderRadius: Radius.sm,
        backgroundColor: Colors.bgElevated,
        width: '90%',
        marginBottom: Spacing.sm,
    },

    resortCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
    },
    resortCardUnavailable: {
        opacity: 0.7,
    },

    resortImageWrap: {
        height: 180,
        position: 'relative',
    },
    resortImage: {
        width: '100%',
        height: '100%',
    },
    resortImagePlaceholder: {
        flex: 1,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },

    featuredBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    featuredBadgeText: {
        fontSize: Typography.fontSizeXS,
        color: '#FFD700',
        fontWeight: Typography.fontWeightBold,
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

    unavailableOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
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
        gap: Spacing.sm,
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
    reviewCount: {
        fontSize: Typography.fontSizeXS,
        color: Colors.textMuted,
    },
    resortDesc: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        lineHeight: 19,
    },

    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    bookBtnDisabled: {
        backgroundColor: Colors.bgElevated,
        opacity: 0.6,
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
    clearSearchText: {
        fontSize: Typography.fontSizeSM,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
        marginTop: Spacing.xs,
    },
});
