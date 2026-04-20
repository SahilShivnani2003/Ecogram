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
import { Transaction } from '@/features/Earnings/types/Transaction';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockTransactions: Transaction[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenHeader({ onMenuPress }: { onMenuPress: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
        <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <View>
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
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader onMenuPress={openDrawer} />

        {/* Stat Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard
            icon="link-outline"
            label="Reward Points"
            value="0 pts"
            iconColor="#F5C242"
            bgColor="#2A2000"
          />
          <StatCard
            icon="gift-outline"
            label="Cashback Earned"
            value="₹0"
            iconColor={Colors.accentGreen}
            bgColor={Colors.bgElevated}
          />
          <StatCard
            icon="people-outline"
            label="Referral Earnings"
            value="₹0"
            iconColor="#60AADF"
            bgColor="#0A1A2A"
          />
          <StatCard
            icon="trending-up-outline"
            label="Investment Returns"
            value="₹0"
            iconColor={Colors.accentLime}
            bgColor={Colors.bgElevated}
          />
        </ScrollView>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.sectionMeta}>0 records</Text>
          </View>

          <View style={styles.card}>
            {mockTransactions.length === 0 ? (
              <EmptyState />
            ) : (
              mockTransactions.map((tx) => (
                <View key={tx._id} style={styles.txRow}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txAmount}>₹{tx.amount}</Text>
                </View>
              ))
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
  menuBtn: {
    marginTop: 2,
    padding: Spacing.xs,
  },
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
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  statCard: {
    width: 160,
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
    fontSize: Typography.fontSizeXL,
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
  sectionMeta: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
  },

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
  emptySubText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
  },

  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  txDesc: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM },
  txAmount: { color: Colors.accentGreen, fontWeight: Typography.fontWeightSemiBold },
});