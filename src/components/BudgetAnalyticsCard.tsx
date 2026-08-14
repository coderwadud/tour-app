import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trip } from '../types';
import { formatCents } from '../utils/settlement';
import { AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react-native';

interface BudgetAnalyticsCardProps {
  trip: Trip;
}

export const BudgetAnalyticsCard: React.FC<BudgetAnalyticsCardProps> = ({ trip }) => {
  const targetBudget = trip.budget || 0;
  const targetBudgetCents = targetBudget * 100;
  if (targetBudgetCents <= 0) return null;

  const currency = trip.currency || 'BDT ';
  const totalSpentCents = trip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const remainingCents = targetBudgetCents - totalSpentCents;
  const isOverBudget = totalSpentCents > targetBudgetCents;

  const pct = Math.round((totalSpentCents / targetBudgetCents) * 100);

  let greenSharePct = 100;
  let overBudgetPct = 0;

  if (isOverBudget) {
    greenSharePct = Math.round((targetBudgetCents / totalSpentCents) * 100);
    overBudgetPct = pct - 100;
  } else {
    greenSharePct = pct;
  }

  return (
    <View style={[styles.card, isOverBudget ? styles.cardOverBudget : styles.cardOnTrack]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <BarChart2 size={16} color="#334155" />
          <Text style={styles.headerTitle}>TARGET BUDGET CONTROL</Text>
        </View>
        <View style={[styles.badge, isOverBudget ? styles.badgeOverBudget : styles.badgeOnTrack]}>
          {isOverBudget ? <AlertTriangle size={13} color="#DC2626" /> : <CheckCircle2 size={13} color="#059669" />}
          <Text style={[styles.badgeText, isOverBudget ? styles.badgeTextOver : styles.badgeTextTrack]}>
            {isOverBudget ? `OVER BUDGET (${pct}%)` : `ON TRACK (${pct}%)`}
          </Text>
        </View>
      </View>

      {/* 3 Metric Tiles */}
      <View style={styles.grid}>
        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Target Budget</Text>
          <Text style={[styles.tileValue, { color: '#0F172A' }]}>
            {currency}{formatCents(targetBudgetCents)}
          </Text>
        </View>

        <View style={styles.tile}>
          <Text style={styles.tileLabel}>Total Spent</Text>
          <Text style={[styles.tileValue, { color: '#2563EB' }]}>
            {currency}{formatCents(totalSpentCents)}
          </Text>
        </View>

        <View style={[styles.tile, isOverBudget ? styles.tileOverBudget : styles.tileOnTrack]}>
          <Text style={styles.tileLabel}>{isOverBudget ? 'Budget Deficit / Over' : 'Remaining Savings'}</Text>
          <Text style={[styles.tileValue, { color: isOverBudget ? '#DC2626' : '#059669' }]}>
            {isOverBudget ? `-${currency}${formatCents(-remainingCents)}` : `+${currency}${formatCents(remainingCents)}`}
          </Text>
        </View>
      </View>

      {/* Bar Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendGreen}>
          Target Budget: {greenSharePct}% ({currency}{formatCents(targetBudgetCents)})
        </Text>
        {isOverBudget && (
          <Text style={styles.legendRed}>
            Exceeded: +{overBudgetPct}% (+{currency}{formatCents(-remainingCents)})
          </Text>
        )}
      </View>

      {/* Dual-Color Proportional Split Progress Bar Track */}
      <View style={styles.progressTrack}>
        {isOverBudget ? (
          <View style={styles.splitBarContainer}>
            <View style={[styles.barSegmentGreen, { width: `${greenSharePct}%` }]} />
            <View style={[styles.barSegmentRed, { width: `${100 - greenSharePct}%` }]} />
          </View>
        ) : (
          <View style={[styles.barSegmentGreen, { width: `${Math.min(pct, 100)}%` }]} />
        )}
      </View>

      {/* Dynamic Insight Footer */}
      <View style={[styles.footer, isOverBudget ? styles.footerOverBudget : styles.footerOnTrack]}>
        <Text style={[styles.footerText, isOverBudget ? styles.footerTextOver : styles.footerTextTrack]}>
          {isOverBudget
            ? `Warning: Total expenses have exceeded target budget by ${currency}${formatCents(-remainingCents)}.`
            : `Insight: ${100 - pct}% of target budget remains available for upcoming tour activities.`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cardOverBudget: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5'
  },
  cardOnTrack: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#334155'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  badgeOnTrack: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7'
  },
  badgeOverBudget: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  badgeTextTrack: {
    color: '#059669'
  },
  badgeTextOver: {
    color: '#DC2626'
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap'
  },
  tile: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tileOnTrack: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  tileOverBudget: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4
  },
  tileValue: {
    fontSize: 15,
    fontWeight: '800'
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  legendGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857'
  },
  legendRed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C'
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  splitBarContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%'
  },
  barSegmentGreen: {
    height: '100%',
    backgroundColor: '#10B981'
  },
  barSegmentRed: {
    height: '100%',
    backgroundColor: '#EF4444'
  },
  footer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10
  },
  footerOnTrack: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  footerOverBudget: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600'
  },
  footerTextTrack: {
    color: '#065F46'
  },
  footerTextOver: {
    color: '#991B1B'
  }
});
