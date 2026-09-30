import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { PiggyBank, ArrowDownLeft, Calendar, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { SparklineChart } from '../components/charts/SparklineChart';
import { formatPHP } from '../utils/calculations';
import { getThemeColors } from '../utils/theme';

export const SavingsScreen: React.FC = () => {
  const { deposits, projects, totalSavedAcrossAll, allowance, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');

  const dailyExcess = Math.max(0, allowance.dailyBaon - allowance.dailyExpenses);
  const weeklyCapacity = dailyExcess * allowance.allowanceDaysPerWeek;

  const projectMap = new Map(projects.map((p) => [p.id, p.title]));

  // Build sparkline trend from deposits
  const sparklineTrend = deposits.length >= 2
    ? [...deposits].reverse().map((d) => d.amount)
    : [100, 200, 450, 750, 1200, 2100, 3450];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>SAVINGS & LEDGER</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Financial Growth</Text>
        </View>

        {/* Analytics Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>ALL-TIME SAVINGS</Text>
              <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>{formatPHP(totalSavedAcrossAll)}</Text>
            </View>
            <View style={styles.sparkCol}>
              <SparklineChart data={sparklineTrend} width={110} height={46} color={colors.accentEmerald} />
            </View>
          </View>

          <View style={[styles.metricsRow, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Daily Excess</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatPHP(dailyExcess)}/day</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Weekly Power</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatPHP(weeklyCapacity)}/wk</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Deposits</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{deposits.length}</Text>
            </View>
          </View>
        </View>

        {/* Transaction History Ledger */}
        <View style={styles.ledgerSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transaction History</Text>

          {deposits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No deposits recorded yet.</Text>
            </View>
          ) : (
            deposits.map((dep) => {
              const projectTitle = projectMap.get(dep.projectId) || 'Unknown Goal';
              const dateStr = new Date(dep.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <View
                  key={dep.id}
                  style={[
                    styles.ledgerCard,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.depositIconCircle, { backgroundColor: isDark ? 'rgba(134, 239, 172, 0.12)' : 'rgba(5, 150, 105, 0.12)' }]}>
                    <ArrowDownLeft size={16} color={colors.accentEmerald} />
                  </View>
                  <View style={styles.ledgerInfo}>
                    <Text style={[styles.ledgerProjectTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {projectTitle}
                    </Text>
                    <Text style={[styles.ledgerNote, { color: colors.textSecondary }]} numberOfLines={1}>
                      {dep.note || 'Savings Deposit'}
                    </Text>
                  </View>
                  <View style={styles.ledgerRight}>
                    <Text style={[styles.ledgerAmount, { color: colors.accentEmerald }]}>+{formatPHP(dep.amount)}</Text>
                    <Text style={[styles.ledgerDate, { color: colors.textMuted }]}>{dateStr}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07130F',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#0D211B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 18,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
  },
  sparkCol: {
    alignItems: 'flex-end',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#102820',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#142F26',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#142F26',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#86EFAC',
    marginTop: 2,
  },
  ledgerSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D211B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 14,
    gap: 12,
  },
  depositIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerInfo: {
    flex: 1,
  },
  ledgerProjectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  ledgerNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  ledgerRight: {
    alignItems: 'flex-end',
  },
  ledgerAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#86EFAC',
  },
  ledgerDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
