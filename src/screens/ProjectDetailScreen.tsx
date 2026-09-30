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
import { getThemeColors, KansyaDesign } from '../utils/theme';
import { KANSYA_MOCKUP_PROJECTS } from '../store/defaultData';

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

  const project =
    projects.find((p) => p.id === projectId) ||
    KANSYA_MOCKUP_PROJECTS.find((p) => p.id === projectId) ||
    projects[0] ||
    KANSYA_MOCKUP_PROJECTS[0];

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

  // Suggested daily savings calculation for an actionable smart pace target
  const targetDays = Math.min(180, Math.max(30, pace.daysRemaining || 60));
  const suggestedDaily = Math.max(25, Math.ceil(remaining / targetDays));
  const targetDateStr = pace.projectedDate
    ? new Date(pace.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'September 30, 2026';

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.kansyaBg || colors.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.kansyaBg || colors.background,
            borderBottomColor: colors.border || '#142F26',
            paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6,
          },
        ]}
      >
        <TactilePressable
          style={[styles.iconCircleBtn, { backgroundColor: '#102820', borderColor: '#142F26' }]}
          onPress={onBack}
          activeScale={0.97}
          haptic
        >
          <ArrowLeft size={18} color="#F4F7F3" />
        </TactilePressable>

        <Text style={[styles.headerBarTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {project.title}
        </Text>

        <View style={styles.headerActions}>
          <TactilePressable
            style={[styles.iconCircleBtn, { backgroundColor: '#102820', borderColor: '#142F26' }]}
            onPress={() => setEditModalVisible(true)}
            activeScale={0.97}
            haptic
          >
            <Edit2 size={16} color="#9AAFA5" />
          </TactilePressable>
          <TactilePressable
            style={[styles.iconCircleBtn, { backgroundColor: '#102820', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
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
        {/* Main Progress Visualization Card */}
        <View style={[styles.heroDonutCard, { backgroundColor: colors.surfaceCard, borderColor: '#142F26' }]}>
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

          {/* Goal Information Grid (Saved, Target, Remaining, Estimated) */}
          <View style={[styles.goalInfoGrid, { backgroundColor: '#102820', borderColor: '#142F26' }]}>
            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>SAVED</Text>
              <Text style={[styles.goalInfoCellValue, { color: '#55D99A' }]}>
                {formatPHP(project.currentAmount)}
              </Text>
            </View>

            <View style={[styles.goalInfoDivider, { backgroundColor: '#142F26' }]} />

            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>TARGET</Text>
              <Text style={[styles.goalInfoCellValue, { color: colors.textPrimary }]}>
                {formatPHP(project.targetPrice)}
              </Text>
            </View>

            <View style={[styles.goalInfoDivider, { backgroundColor: '#142F26' }]} />

            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>REMAINING</Text>
              <Text style={[styles.goalInfoCellValue, { color: colors.textPrimary }]}>
                {formatPHP(remaining)}
              </Text>
            </View>

            <View style={[styles.goalInfoDivider, { backgroundColor: '#142F26' }]} />

            <View style={styles.goalInfoCell}>
              <Text style={[styles.goalInfoCellLabel, { color: colors.textMuted }]}>ESTIMATED</Text>
              <Text style={[styles.goalInfoCellValue, { color: '#EBCB72' }]}>
                {pace.projectedDate
                  ? new Date(pace.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Achieved'}
              </Text>
            </View>
          </View>

          {isCompleted ? (
            <View style={styles.blessingBanner}>
              <CheckCircle2 size={16} color="#EBCB72" />
              <Text style={styles.blessingBannerText}>
                Goal complete! You made it happen.
              </Text>
            </View>
          ) : (
            <TactilePressable
              style={[styles.depositHeroBtn, { backgroundColor: '#55D99A' }]}
              onPress={() => setDepositModalVisible(true)}
              activeScale={0.97}
              haptic
            >
              <Text style={styles.depositHeroBtnText}>+ Add Deposit</Text>
            </TactilePressable>
          )}
        </View>

        {/* Smart Pace Forecast Box */}
        <View style={[styles.forecastCard, { backgroundColor: colors.surfaceCard, borderColor: '#142F26' }]}>
          <View style={styles.forecastHeader}>
            <Sparkles size={16} color="#55D99A" />
            <Text style={[styles.forecastHeaderTitle, { color: '#55D99A' }]}>Smart pace</Text>
          </View>

          <View style={styles.forecastSimpleContent}>
            <Text style={[styles.forecastPaceLine, { color: colors.textPrimary }]}>
              At your current pace:{' '}
              <Text style={{ color: '#55D99A', fontWeight: '700' }}>
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

            {remaining > 0 && (
              <View style={[styles.forecastActionableBox, { backgroundColor: '#102820', borderColor: '#142F26' }]}>
                <Text style={[styles.forecastActionableText, { color: colors.textSecondary }]}>
                  To reach this goal by {targetDateStr}: save about{' '}
                  <Text style={{ color: '#55D99A', fontWeight: '700' }}>
                    {formatPHP(suggestedDaily)}/day
                  </Text>
                  .
                </Text>
                <Text style={[styles.forecastSubtext, { color: colors.textMuted }]}>
                  Estimated based on your current savings pace.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Deposit Ledger History */}
        <View style={styles.ledgerSection}>
          <Text style={[styles.ledgerSectionTitle, { color: colors.textPrimary }]}>
            Deposit History ({projectDeposits.length})
          </Text>

          {projectDeposits.length === 0 ? (
            <View style={[styles.emptyLedger, { backgroundColor: '#0D211B', borderColor: '#142F26' }]}>
              <Text style={[styles.emptyLedgerText, { color: colors.textMuted }]}>
                No deposits recorded for this goal yet.
              </Text>
            </View>
          ) : (
            projectDeposits.map((dep) => (
              <View key={dep.id} style={[styles.ledgerItem, { backgroundColor: '#0D211B', borderColor: '#142F26' }]}>
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
                <Text style={[styles.ledgerAmount, { color: '#55D99A' }]}>+{formatPHP(dep.amount)}</Text>
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
    backgroundColor: '#07130F',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#142F26',
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F4F7F3',
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
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
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
  heroDonutCard: {
    backgroundColor: '#0D211B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#142F26',
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
    borderColor: '#142F26',
    backgroundColor: '#102820',
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
    backgroundColor: '#142F26',
  },
  goalInfoCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  goalInfoCellValue: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 3,
  },
  depositHeroBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#55D99A',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  depositHeroBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#07130F',
    letterSpacing: 0.5,
  },
  blessingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(235, 203, 114, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'center',
  },
  blessingBannerText: {
    color: '#EBCB72',
    fontWeight: '700',
    fontSize: 13,
  },
  forecastCard: {
    backgroundColor: '#0D211B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#142F26',
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
    color: '#55D99A',
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
    borderColor: '#142F26',
    backgroundColor: '#102820',
    padding: 12,
    marginTop: 6,
  },
  forecastActionableText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  forecastSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
  ledgerSection: {
    gap: 10,
  },
  ledgerSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4F7F3',
    marginBottom: 4,
  },
  emptyLedger: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#0D211B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#142F26',
  },
  emptyLedgerText: {
    fontSize: 12,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D211B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 14,
  },
  ledgerNote: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F7F3',
  },
  ledgerDate: {
    fontSize: 10,
    marginTop: 2,
  },
  ledgerAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#55D99A',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  missingText: {
    color: '#9AAFA5',
    fontSize: 16,
    marginBottom: 16,
  },
  backBtnAction: {
    backgroundColor: '#55D99A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#07130F',
    fontWeight: '800',
    fontSize: 13,
  },
});
