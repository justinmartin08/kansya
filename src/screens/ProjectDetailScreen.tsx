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
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { AnimatedDonutChart } from '../components/charts/AnimatedDonutChart';
import { ProgressiveCoin } from '../components/illustrations/ProgressiveCoin';
import { QuickDepositModal } from '../components/modals/QuickDepositModal';
import { MilestoneModal } from '../components/modals/MilestoneModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { FloatingNumbers } from '../components/hud/FloatingNumbers';
import { TactilePressable } from '../components/ui/TactilePressable';
import {
  formatPHP,
  getProjectProgress,
  calculatePace,
} from '../utils/calculations';
import { confirmAction } from '../utils/dialog';
import { getThemeColors } from '../utils/theme';

interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
  onBack,
}) => {
  const {
    projects,
    deposits,
    allowance,
    addDeposit,
    deleteProject,
    milestoneCelebration,
    closeMilestoneModal,
    floatingDeposit,
    clearFloatingDeposit,
    theme,
    isDark,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const project = projects.find((p) => p.id === projectId) || projects[0];

  if (!project) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: Math.max(insets.top, statusBarHeight) }]}>
        <View style={styles.centerContainer}>
          <Text style={styles.missingText}>Goal Not Found</Text>
          <TouchableOpacity style={styles.backBtnAction} onPress={onBack}>
            <Text style={styles.backBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { clampedPercent, isCompleted, remaining } = getProjectProgress(
    project.currentAmount,
    project.targetPrice
  );
  const pace = calculatePace(project, allowance);
  const projectDeposits = deposits.filter((d) => d.projectId === project.id);

  const handleDelete = () => {
    confirmAction(
      `Delete "${project.title}"?`,
      'This will remove this goal and its savings history permanently.',
      async () => {
        await deleteProject(project.id);
        onBack();
      }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderSubtle,
            paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6,
          },
        ]}
      >
        <TactilePressable
          style={[styles.iconCircleBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
          onPress={onBack}
          activeScale={0.97}
          haptic
        >
          <ArrowLeft size={18} color={colors.textSecondary} />
        </TactilePressable>

        <Text style={[styles.headerBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {project.title}
        </Text>

        <View style={styles.headerActions}>
          <TactilePressable
            style={[styles.iconCircleBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
            onPress={() => setEditModalVisible(true)}
            activeScale={0.97}
            haptic
          >
            <Edit2 size={16} color={colors.textSecondary} />
          </TactilePressable>
          <TactilePressable
            style={[styles.iconCircleBtn, { backgroundColor: colors.surfaceCard, borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={handleDelete}
            activeScale={0.97}
            haptic
          >
            <Trash2 size={16} color="#EF4444" />
          </TactilePressable>
        </View>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dynamic Progressive Coin Banner */}
        <View style={[styles.coinBannerCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <ProgressiveCoin
            currentAmount={project.currentAmount}
            targetPrice={project.targetPrice}
            size={140}
          />
        </View>

        {/* Hero Donut Card */}
        <View style={[styles.heroDonutCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.donutContainer}>
            <AnimatedDonutChart
              currentAmount={project.currentAmount}
              targetPrice={project.targetPrice}
              size={160}
              strokeWidth={8}
            />
          </View>

          <View style={styles.ringInfoSummary}>
            <Text style={[styles.ringSummarySaved, { color: colors.textPrimary }]}>
              {formatPHP(project.currentAmount)} saved
            </Text>
            <Text style={[styles.ringSummaryTarget, { color: colors.textSecondary }]}>
              of {formatPHP(project.targetPrice)}
            </Text>
          </View>

          {/* Goal Information Grid */}
          <View style={[styles.goalInfoGrid, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>SAVED</Text>
              <Text style={[styles.goalInfoCellValue, { color: colors.accentEmerald }]}>
                {formatPHP(project.currentAmount)}
              </Text>
            </View>

            <View style={[styles.goalInfoDivider, { backgroundColor: colors.border }]} />

            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>TARGET</Text>
              <Text style={[styles.goalInfoCellValue, { color: colors.textPrimary }]}>
                {formatPHP(project.targetPrice)}
              </Text>
            </View>

            <View style={[styles.goalInfoDivider, { backgroundColor: colors.border }]} />

            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>REMAINING</Text>
              <Text style={[styles.goalInfoCellValue, { color: colors.textPrimary }]}>
                {formatPHP(remaining)}
              </Text>
            </View>
          </View>

          {isCompleted ? (
            <View style={styles.blessingBanner}>
              <CheckCircle2 size={16} color="#FFB800" />
              <Text style={styles.blessingBannerText}>
                Goal complete! You made it happen.
              </Text>
            </View>
          ) : (
            <TactilePressable
              style={[styles.depositHeroBtn, { backgroundColor: colors.accentEmerald }]}
              onPress={() => setDepositModalVisible(true)}
              activeScale={0.97}
              haptic
            >
              <Text style={[styles.depositHeroBtnText, { color: isDark ? '#0B111E' : '#FFFFFF' }]}>+ Add Deposit</Text>
            </TactilePressable>
          )}
        </View>

        {/* Smart Pace Forecast Box */}
        <View style={[styles.forecastCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <View style={styles.forecastHeader}>
            <Sparkles size={16} color={colors.accentEmerald} />
            <Text style={[styles.forecastHeaderTitle, { color: colors.accentEmerald }]}>Smart pace</Text>
          </View>

          <View style={styles.forecastSimpleContent}>
            <Text style={[styles.forecastPaceLine, { color: colors.textPrimary }]}>
              At your current pace:{' '}
              <Text style={{ color: colors.accentEmerald, fontWeight: '700' }}>
                {formatPHP(pace.dailyRate)}/day
              </Text>
            </Text>

            <Text style={[styles.forecastDateLine, { color: colors.textSecondary }]}>
              Estimated completion:{' '}
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {pace.projectedDate
                  ? new Date(pace.projectedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Achieved!'}
              </Text>
            </Text>

            {pace.daysRemaining > 0 && (
              <View style={[styles.forecastActionableBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                <Text style={[styles.forecastActionableText, { color: colors.textSecondary }]}>
                  Based on your current pace, saving about{' '}
                  <Text style={{ color: colors.accentEmerald, fontWeight: '700' }}>
                    {formatPHP(Math.max(25, Math.ceil(remaining / Math.min(180, Math.max(30, pace.daysRemaining)))))}/day
                  </Text>{' '}
                  keeps your dream on track.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Deposit Ledger History */}
        <View style={styles.ledgerSection}>
          <Text style={[styles.ledgerSectionTitle, { color: colors.textPrimary }]}>Deposit History ({projectDeposits.length})</Text>

          {projectDeposits.length === 0 ? (
            <View style={[styles.emptyLedger, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
              <Text style={[styles.emptyLedgerText, { color: colors.textMuted }]}>No deposits recorded for this goal yet.</Text>
            </View>
          ) : (
            projectDeposits.map((dep) => (
              <View key={dep.id} style={[styles.ledgerItem, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.ledgerNote, { color: colors.textPrimary }]}>{dep.note || 'Savings Deposit'}</Text>
                  <Text style={[styles.ledgerDate, { color: colors.textMuted }]}>
                    {new Date(dep.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={[styles.ledgerAmount, { color: colors.accentEmerald }]}>+{formatPHP(dep.amount)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Numbers FX */}
      {floatingDeposit && floatingDeposit.visible && (
        <FloatingNumbers
          amount={floatingDeposit.amount}
          triggerKey={floatingDeposit.key}
          onAnimationEnd={clearFloatingDeposit}
        />
      )}

      {/* Modals */}
      <QuickDepositModal
        visible={depositModalVisible}
        project={project}
        onClose={() => setDepositModalVisible(false)}
        onDeposit={async (amt, note) => {
          await addDeposit(project.id, amt, note);
        }}
      />

      <EditProjectModal
        visible={editModalVisible}
        project={project}
        onClose={() => setEditModalVisible(false)}
      />

      {milestoneCelebration && (
        <MilestoneModal
          visible={milestoneCelebration.visible}
          project={milestoneCelebration.project}
          phase={milestoneCelebration.phase}
          isCompletion={milestoneCelebration.isCompletion}
          onClose={closeMilestoneModal}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2333',
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    maxWidth: 200,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 16,
  },
  coinBannerCard: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroDonutCard: {
    backgroundColor: '#121B2A',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    alignItems: 'center',
  },
  donutContainer: {
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInfoSummary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ringSummarySaved: {
    fontSize: 18,
    fontWeight: '800',
  },
  ringSummaryTarget: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  goalInfoGrid: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  goalInfoCell: {
    flex: 1,
    alignItems: 'center',
  },
  goalInfoDivider: {
    width: 1,
  },
  goalInfoCellLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  goalInfoCellValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  depositHeroBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#86EFAC',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  depositHeroBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B111E',
    letterSpacing: 0.5,
  },
  blessingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'center',
  },
  blessingBannerText: {
    color: '#FFB800',
    fontWeight: '700',
    fontSize: 13,
  },
  forecastCard: {
    backgroundColor: '#121B2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    gap: 10,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forecastHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86EFAC',
  },
  forecastSimpleContent: {
    gap: 6,
  },
  forecastPaceLine: {
    fontSize: 14,
    fontWeight: '500',
  },
  forecastDateLine: {
    fontSize: 13,
    fontWeight: '400',
  },
  forecastActionableBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
  },
  forecastActionableText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  ledgerSection: {
    gap: 10,
  },
  ledgerSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyLedger: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyLedgerText: {
    color: '#64748B',
    fontSize: 12,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121B2A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  ledgerNote: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  ledgerDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  ledgerAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#86EFAC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  missingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 16,
  },
  backBtnAction: {
    backgroundColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#0B111E',
    fontWeight: '800',
    fontSize: 13,
  },
});
