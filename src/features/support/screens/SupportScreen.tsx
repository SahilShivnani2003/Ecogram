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
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme/index';
import { SupportTicket } from '../types/Support';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockTickets: SupportTicket[] = [];

const CATEGORIES = [
    { value: 'investment', label: 'Investment', icon: 'trending-up-outline' },
    { value: 'booking', label: 'Booking', icon: 'calendar-outline' },
    { value: 'payment', label: 'Payment', icon: 'card-outline' },
    { value: 'account', label: 'Account', icon: 'person-outline' },
    { value: 'technical', label: 'Technical', icon: 'construct-outline' },
    { value: 'other', label: 'Other', icon: 'help-circle-outline' },
] as const;

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

const STATUS_FILTERS = ['All', 'open', 'in-progress', 'resolved', 'closed'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress, onNew }: { onMenuPress: () => void; onNew: () => void }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                    <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support Tickets</Text>
            </View>
            <TouchableOpacity style={styles.newBtn} onPress={onNew} activeOpacity={0.85}>
                <Text style={styles.newBtnText}>Create New Ticket</Text>
            </TouchableOpacity>
        </View>
    );
}

function TicketCard({ ticket }: { ticket: SupportTicket }) {
    const statusColors: Record<string, string> = {
        open: Colors.accentGreen,
        'in-progress': Colors.warning,
        resolved: '#60AADF',
        closed: Colors.textMuted,
    };
    const priorityColors: Record<string, string> = {
        low: Colors.textMuted,
        medium: Colors.warning,
        high: Colors.error,
        urgent: '#FF4444',
    };

    const statusColor = statusColors[ticket.status] ?? Colors.textMuted;
    const priorityColor = priorityColors[ticket.priority] ?? Colors.textMuted;

    return (
        <View style={styles.ticketCard}>
            <View style={styles.ticketTop}>
                <View style={styles.ticketMeta}>
                    <View style={styles.categoryPill}>
                        <Ionicons
                            name={
                                (CATEGORIES.find(c => c.value === ticket.category)?.icon ??
                                    'help-circle-outline') as any
                            }
                            size={11}
                            color={Colors.accentGreen}
                        />
                        <Text style={styles.categoryPillText}>{ticket.category}</Text>
                    </View>
                    <View style={[styles.priorityPill, { borderColor: priorityColor }]}>
                        <Text style={[styles.priorityPillText, { color: priorityColor }]}>
                            {ticket.priority}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {ticket.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <Text style={styles.ticketDesc} numberOfLines={2}>
                {ticket.description}
            </Text>

            {ticket.adminResponse ? (
                <View style={styles.adminReply}>
                    <Ionicons name="chatbubble-outline" size={13} color={Colors.accentGreen} />
                    <Text style={styles.adminReplyText} numberOfLines={2}>
                        {ticket.adminResponse}
                    </Text>
                </View>
            ) : null}

            <Text style={styles.ticketDate}>
                {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                      })
                    : '—'}
            </Text>
        </View>
    );
}

function NewTicketModal({
    visible,
    onClose,
    onSubmit,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (ticket: Partial<SupportTicket>) => void;
}) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<SupportTicket['category']>('investment');
    const [priority, setPriority] = useState<SupportTicket['priority']>('medium');

    const handleSubmit = () => {
        if (!subject.trim() || !description.trim()) return;
        onSubmit({ subject, description, category, priority });
        setSubject('');
        setDescription('');
        setCategory('investment');
        setPriority('medium');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>New Support Ticket</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                            <Ionicons name="close" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.modalScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Category */}
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryRow}
                            >
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        onPress={() => setCategory(cat.value)}
                                        style={[
                                            styles.categoryChip,
                                            category === cat.value && styles.categoryChipActive,
                                        ]}
                                    >
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={13}
                                            color={
                                                category === cat.value
                                                    ? Colors.textInverse
                                                    : Colors.textMuted
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                category === cat.value &&
                                                    styles.categoryChipTextActive,
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Priority */}
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Priority</Text>
                            <View style={styles.priorityRow}>
                                {PRIORITIES.map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => setPriority(p)}
                                        style={[
                                            styles.priorityChip,
                                            priority === p && styles.priorityChipActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.priorityChipText,
                                                priority === p && styles.priorityChipTextActive,
                                            ]}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Subject */}
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Brief summary of your issue"
                                placeholderTextColor={Colors.textMuted}
                                value={subject}
                                onChangeText={setSubject}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.formField}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe your issue in detail..."
                                placeholderTextColor={Colors.textMuted}
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                (!subject.trim() || !description.trim()) &&
                                    styles.submitBtnDisabled,
                            ]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="send-outline" size={16} color={Colors.textInverse} />
                            <Text style={styles.submitBtnText}>Submit Ticket</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SupportScreen({ navigation }: any) {
    const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [showModal, setShowModal] = useState(false);

    const openDrawer = () => navigation.openDrawer();

    const filtered =
        statusFilter === 'All' ? tickets : tickets.filter(t => t.status === statusFilter);

    const handleSubmit = (data: Partial<SupportTicket>) => {
        const newTicket: SupportTicket = {
            _id: Date.now().toString(),
            subject: data.subject ?? '',
            description: data.description ?? '',
            category: data.category ?? 'other',
            priority: data.priority ?? 'medium',
            status: 'open',
            adminResponse: '',
            isGuest: false,
            createdAt: new Date(),
        };
        setTickets(prev => [newTicket, ...prev]);
        setShowModal(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader onMenuPress={openDrawer} onNew={() => setShowModal(true)} />

                {/* Stats strip */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsStrip}
                >
                    {[
                        { label: 'Total', value: tickets.length, icon: 'ticket-outline' },
                        {
                            label: 'Open',
                            value: tickets.filter(t => t.status === 'open').length,
                            icon: 'alert-circle-outline',
                        },
                        {
                            label: 'In Progress',
                            value: tickets.filter(t => t.status === 'in-progress').length,
                            icon: 'time-outline',
                        },
                        {
                            label: 'Resolved',
                            value: tickets.filter(t => t.status === 'resolved').length,
                            icon: 'checkmark-circle-outline',
                        },
                    ].map(s => (
                        <View key={s.label} style={styles.statPill}>
                            <Ionicons name={s.icon as any} size={13} color={Colors.accentGreen} />
                            <Text style={styles.statPillValue}>{s.value}</Text>
                            <Text style={styles.statPillLabel}>{s.label}</Text>
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
                            onPress={() => setStatusFilter(f)}
                            style={[
                                styles.filterChip,
                                statusFilter === f && styles.filterChipActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    statusFilter === f && styles.filterChipTextActive,
                                ]}
                            >
                                {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Ticket list */}
                <View style={styles.listContainer}>
                    {filtered.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="headset-outline" size={36} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>
                                {tickets.length === 0
                                    ? 'No support tickets yet. Create one if you need help!'
                                    : 'No tickets match this filter.'}
                            </Text>
                        </View>
                    ) : (
                        filtered.map(t => <TicketCard key={t._id} ticket={t} />)
                    )}
                </View>
            </ScrollView>

            <NewTicketModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            />
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
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    menuBtn: { padding: Spacing.xs },
    headerTitle: {
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    newBtn: {
        backgroundColor: Colors.accentGreen,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
    },
    newBtnText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
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
    statPillLabel: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },

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
        padding: Spacing.xxl,
        alignItems: 'center',
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.fontSizeMD,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },

    ticketCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.sm,
        ...Shadow.subtle,
    },
    ticketTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketMeta: { flexDirection: 'row', gap: Spacing.sm },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.bgElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    categoryPillText: {
        fontSize: Typography.fontSizeXS,
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    priorityPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    priorityPillText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: {
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        textTransform: 'capitalize',
    },
    ticketSubject: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightSemiBold,
        color: Colors.textPrimary,
    },
    ticketDesc: {
        fontSize: Typography.fontSizeSM,
        color: Colors.textSecondary,
        lineHeight: 19,
    },
    adminReply: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderLeftWidth: 2,
        borderLeftColor: Colors.accentGreen,
        padding: Spacing.sm,
    },
    adminReplyText: {
        flex: 1,
        fontSize: Typography.fontSizeXS,
        color: Colors.textSecondary,
        lineHeight: 17,
    },
    ticketDate: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalSheet: {
        backgroundColor: Colors.bgCard,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        maxHeight: '90%',
    },
    modalHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.border,
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textPrimary,
    },
    modalClose: { padding: Spacing.xs },
    modalScroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },

    formField: { gap: Spacing.sm },
    formLabel: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightMedium,
        color: Colors.textSecondary,
    },

    categoryRow: { gap: Spacing.sm },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bgElevated,
    },
    categoryChipActive: {
        backgroundColor: Colors.accentGreen,
        borderColor: Colors.accentGreen,
    },
    categoryChipText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
    categoryChipTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },

    priorityRow: { flexDirection: 'row', gap: Spacing.sm },
    priorityChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.bgElevated,
    },
    priorityChipActive: {
        backgroundColor: Colors.accentGreen,
        borderColor: Colors.accentGreen,
    },
    priorityChipText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
    priorityChipTextActive: {
        color: Colors.textInverse,
        fontWeight: Typography.fontWeightBold,
    },

    input: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    textArea: {
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
        padding: Spacing.md,
        minHeight: 100,
        textAlignVertical: 'top',
    },

    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
        marginTop: Spacing.sm,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText: {
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        color: Colors.textInverse,
    },
});
