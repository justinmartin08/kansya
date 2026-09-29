import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Settings,
  User,
  Zap,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Eye,
  Trophy,
  Sun,
  Moon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { MountainSunset } from '../components/illustrations/MountainSunset';
import { PlantSprout } from '../components/illustrations/PlantSprout';
import { SparklineSvg } from '../components/illustrations/SparklineSvg';
import { ProgressiveCoin } from '../components/illustrations/ProgressiveCoin';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TactilePressable } from '../components/ui/TactilePressable';
import { FloatingNumbers } from '../components/hud/FloatingNumbers';
import { QuickDepositModal } from '../components/modals/QuickDepositModal';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { AllowanceModal } from '../components/modals/AllowanceModal';
import { TrophyRoomModal } from '../components/modals/TrophyRoomModal';
import { MilestoneModal } from '../components/modals/MilestoneModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { AvatarBadge } from '../utils/avatars';
import { getThemeColors } from '../utils/theme';
import { formatPHP, getProjectProgress } from '../utils/calculations';
import { WishlistProject } from '../types';

const CARD_WIDTH = 270;
const CARD_SPACING = 14;

interface HomeScreenProps {
  onOpenProjectDetail: (projectId: string) => void;
  onNavigateTab?: (tab: 'home' | 'goals' | 'savings' | 'settings') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenProjectDetail,
  onNavigateTab,
}) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    allowance,
    updateAllowance,
    addDeposit,
    totalSavedAcrossAll,
    milestoneCelebration,
    closeMilestoneModal,
    floatingDeposit,
    clearFloatingDeposit,
    resetToSampleData,
    trophies,
    currentUser,
    theme,
    isDark,
    toggleTheme,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  // Find earbuds project or default to index 1 to match Image 2 perfectly
  const initialIndex = Math.max(
    0,
    projects.findIndex((p) => p.title.toLowerCase().includes('earbuds'))
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [targetDepositProject, setTargetDepositProject] = useState<WishlistProject | null>(null);
  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [allowanceModalVisible, setAllowanceModalVisible] = useState(false);
  const [trophyModalVisible, setTrophyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const carouselRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initial scroll to center active project (Earbuds) to match Image 2
    if (initialIndex > 0) {
      setTimeout(() => {
        carouselRef.current?.scrollTo({
          x: initialIndex * (CARD_WIDTH + CARD_SPACING),
          animated: false,
        });
      }, 50);
    }
  }, []);

  const activeProject = projects[activeIndex] || projects[0];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (index >= 0 && index < projects.length && index !== activeIndex) {
      setActiveIndex(index);
      setActiveProjectId(projects[index].id);
    }
  };

  const handleOpenDeposit = (project: WishlistProject) => {
    setTargetDepositProject(project);
    setDepositModalVisible(true);
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. TOP NAVIGATION BAR (Zero Emojis, Dual-Leaf Sprout Logo) */}
        <View style={[styles.topNav, { paddingTop: Math.max(insets.top, statusBarHeight, 10) + 6 }]}>
          <View style={styles.brandRow}>
            <PlantSprout size={24} color="#86EFAC" style={styles.brandSproutLogo} />
            <View style={styles.brandTextCol}>
              <View style={styles.brandNameRow}>
                <Text style={[styles.brandName, { color: colors.textPrimary }]}>KANSYA</Text>
                <Text style={[styles.brandSparkle, { color: colors.accentEmerald }]}>✦</Text>
              </View>
              <View style={styles.brandSubtitleRow}>
                <View style={[styles.brandRule, { backgroundColor: isDark ? '#334155' : colors.border }]} />
                <Text style={styles.brandSubtitle}>SAVINGS ENGINE</Text>
                <View style={[styles.brandRule, { backgroundColor: isDark ? '#334155' : colors.border }]} />
              </View>
            </View>
          </View>

          <View style={styles.topNavActions}>
            {/* Action 1: Theme Toggle (Sun / Moon) */}
            <TactilePressable
              style={[
                styles.circleBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={toggleTheme}
              activeScale={0.97}
              haptic
              accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={16} color="#FBBF24" />
              ) : (
                <Moon size={16} color="#6366F1" />
              )}
            </TactilePressable>

            {/* Action 2: Trophies & Milestones (True Trophy Icon) */}
            <TactilePressable
              style={[
                styles.circleBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setTrophyModalVisible(true)}
              activeScale={0.97}
              haptic
              accessibilityLabel="Achievements and Trophies"
            >
              <Trophy size={16} color={colors.textPrimary} />
              {trophies.some((t) => !!t.unlockedAt) && (
                <View style={styles.profileNotificationDot} />
              )}
            </TactilePressable>

            {/* Action 3: Profile & Identity Customization */}
            <TactilePressable
              style={[
                styles.circleBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setProfileModalVisible(true)}
              activeScale={0.97}
              haptic
              accessibilityLabel="User Profile and Identity"
            >
              {currentUser?.avatarId ? (
                <AvatarBadge avatarId={currentUser.avatarId} size={24} showBorder={false} />
              ) : (
                <User size={16} color={colors.textPrimary} />
              )}
            </TactilePressable>

            {/* Action 4: Settings (Baon & Allowance) */}
            <TactilePressable
              style={[
                styles.circleBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setAllowanceModalVisible(true)}
              activeScale={0.97}
              haptic
              accessibilityLabel="Allowance Engine Settings"
            >
              <Settings size={16} color={colors.textPrimary} />
            </TactilePressable>
          </View>
        </View>

        {/* 2. MOUNTAIN SUNSET GREETING HEADER */}
        <View style={styles.greetingSection}>
          <MountainSunset width="100%" height={95} theme={theme} />
          <View style={styles.greetingOverlay}>
            <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
              Good to see you again,
            </Text>
            <View style={styles.saverRow}>
              <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>
                {currentUser?.fullName ? `${currentUser.fullName.split(' ')[0]}! ` : 'Saver! '}
              </Text>
              <PlantSprout size={20} color={colors.accentEmerald} />
            </View>
            <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>
              Small steps. Big dreams.
            </Text>
          </View>
        </View>

        {/* 3. TOTAL SAVINGS HERO CARD (Clean Single Currency Amount) */}
        <View
          style={[
            styles.totalCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.totalCardHeaderRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>TOTAL SAVINGS</Text>
          </View>

          <View style={styles.totalCardContentRow}>
            <View style={styles.totalAmountCol}>
              <View style={styles.amountNumberRow}>
                <AnimatedCounter
                  value={totalSavedAcrossAll}
                  prefix="₱"
                  style={[styles.amountCounterText, { color: colors.textPrimary }]}
                />
              </View>

              <View style={styles.encouragementRow}>
                <TrendingUp size={13} color={colors.accentEmerald} />
                <Text style={[styles.encouragementText, { color: colors.accentEmerald }]}>
                  Keep going! You're doing great!
                </Text>
              </View>
            </View>

            {/* Sparkline Curve */}
            <View style={styles.sparklineCol}>
              <SparklineSvg width={115} height={46} strokeColor={colors.accentEmerald} />
            </View>
          </View>
        </View>

        {/* 4. ACTIVE WISHLIST SECTION HEADER */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>Active Wishlist</Text>
          <TactilePressable
            style={styles.viewAllBtn}
            onPress={() => (onNavigateTab ? onNavigateTab('goals') : setNewProjectModalVisible(true))}
            activeScale={0.97}
            haptic
          >
            <Text style={styles.viewAllText}>View All &gt;</Text>
          </TactilePressable>
        </View>

        {/* 5. ACTIVE WISHLIST CAROUSEL (Featuring Dynamic Progressive Coin) */}
        {projects.length === 0 ? (
          <View style={[styles.emptyCarouselCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#162234' : colors.surfaceSubtle, borderColor: colors.border }]}>
              <PlantSprout size={28} color={colors.accentEmerald} />
            </View>
            <Text style={[styles.emptyCarouselTitle, { color: colors.textPrimary }]}>No Goals Added Yet</Text>
            <Text style={[styles.emptyCarouselSubtitle, { color: colors.textSecondary }]}>
              Clean slate! Set your first goal to begin your savings journey.
            </Text>
            <TactilePressable
              style={[styles.emptyAddGoalBtn, { backgroundColor: colors.accentEmerald }]}
              onPress={() => setNewProjectModalVisible(true)}
              activeScale={0.97}
              haptic
            >
              <Text style={[styles.emptyAddGoalBtnText, { color: isDark ? '#0B111E' : '#FFFFFF' }]}>+ Create First Goal</Text>
            </TactilePressable>
          </View>
        ) : (
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={handleScroll}
          >
            {projects.map((proj, idx) => {
            const isActive = idx === activeIndex;
            const { clampedPercent, isCompleted } = getProjectProgress(
              proj.currentAmount,
              proj.targetPrice
            );

            return (
              <View
                key={proj.id}
                style={[
                  styles.goalCard,
                  isActive ? styles.goalCardActive : styles.goalCardInactive,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: isActive ? colors.accentEmerald : colors.border,
                  },
                ]}
              >
                {/* Goal Title & Subtitle */}
                <Text style={[styles.goalCardTitle, { color: colors.textPrimary }]}>
                  {proj.title}
                </Text>
                <Text style={[styles.goalCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {proj.subtitle || (isCompleted ? 'Goal fully acquired and blessed!' : 'Clear sound. Bigger moments.')}
                </Text>

                {/* Progressive Dynamic Coin (Dull Slate -> Liquid 3D Gold Fill) */}
                <View style={styles.cardCoinContainer}>
                  <ProgressiveCoin
                    currentAmount={proj.currentAmount}
                    targetPrice={proj.targetPrice}
                    size={128}
                  />
                </View>

                {/* Progress Stats */}
                <View style={styles.goalStatsRow}>
                  <Text style={[styles.currentAmountText, { color: colors.textPrimary }]}>{formatPHP(proj.currentAmount)}</Text>
                  <Text style={[styles.targetAmountText, { color: colors.textSecondary }]}>
                    Goal: {formatPHP(proj.targetPrice)} ({clampedPercent}%)
                  </Text>
                </View>

                {/* Sleek Horizontal Progress Bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${clampedPercent}%` },
                      isCompleted && styles.progressBarFillComplete,
                    ]}
                  />
                </View>

                {/* Status Indicator */}
                <View style={styles.statusRow}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={13} color={colors.accentEmerald} />
                      <Text style={[styles.statusCompleteText, { color: colors.accentEmerald }]}>
                        Goal fully acquired and blessed!
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.statusFundingText, { color: colors.textMuted }]}>
                      ₱{(proj.targetPrice - proj.currentAmount).toLocaleString()} remaining to fund
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                {isActive ? (
                  <TactilePressable
                    style={[styles.viewDetailsBtn, { backgroundColor: isDark ? '#86EFAC' : '#059669' }]}
                    onPress={() => onOpenProjectDetail(proj.id)}
                    activeScale={0.97}
                    haptic
                  >
                    <Text style={[styles.viewDetailsBtnText, { color: isDark ? '#0B111E' : '#FFFFFF' }]}>View Details &gt;</Text>
                  </TactilePressable>
                ) : (
                  <TactilePressable
                    style={[styles.inspectBtn, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                    onPress={() => onOpenProjectDetail(proj.id)}
                    activeScale={0.97}
                    haptic
                  >
                    <View style={styles.inspectBtnContent}>
                      <Eye size={13} color={colors.textSecondary} />
                      <Text style={[styles.inspectBtnText, { color: colors.textSecondary }]}>Inspect</Text>
                    </View>
                  </TactilePressable>
                )}
              </View>
            );
          })}
        </ScrollView>
        )}

        {/* 6. QUICK ACTIONS BANNER (Matching Image 2) */}
        <TactilePressable
          style={[
            styles.quickActionsCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setNewProjectModalVisible(true)}
          activeScale={0.97}
          haptic
        >
          <View style={styles.quickActionIconCircle}>
            <Zap size={16} color={colors.accentEmerald} fill={colors.accentEmerald} />
          </View>
          <View style={styles.quickActionTextCol}>
            <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
            <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
              Manage your savings and wishlist easily.
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TactilePressable>
      </ScrollView>

      {/* Floating RPG Numbers on deposit */}
      {floatingDeposit && floatingDeposit.visible && (
        <FloatingNumbers
          amount={floatingDeposit.amount}
          triggerKey={floatingDeposit.key}
          onAnimationEnd={clearFloatingDeposit}
        />
      )}

      {/* Quick Deposit Modal */}
      {targetDepositProject && (
        <QuickDepositModal
          visible={depositModalVisible}
          project={targetDepositProject}
          onClose={() => setDepositModalVisible(false)}
          onDeposit={async (amount, note) => {
            await addDeposit(targetDepositProject.id, amount, note);
            setDepositModalVisible(false);
          }}
        />
      )}

      {/* New Project Modal */}
      <NewProjectModal
        visible={newProjectModalVisible}
        onClose={() => setNewProjectModalVisible(false)}
      />

      {/* Allowance / Baon Settings Modal */}
      <AllowanceModal
        visible={allowanceModalVisible}
        allowance={allowance}
        onClose={() => setAllowanceModalVisible(false)}
        onSave={async (newAllowance) => {
          await updateAllowance(newAllowance);
          setAllowanceModalVisible(false);
        }}
      />

      {/* Trophy Room Modal */}
      <TrophyRoomModal
        visible={trophyModalVisible}
        onClose={() => setTrophyModalVisible(false)}
      />

      {/* Profile & Customization Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Milestone Celebration Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* 1. TOP NAV */
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandSproutLogo: {
    marginRight: 10,
  },
  brandTextCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4.5,
  },
  brandSparkle: {
    fontSize: 14,
    color: '#F8FAFC',
    marginLeft: 3,
    top: -4,
    fontWeight: '700',
  },
  brandSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 3.5,
    marginHorizontal: 8,
  },
  brandRule: {
    width: 20,
    height: 1.5,
    backgroundColor: '#334155',
  },
  topNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#25334A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileNotificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F59E0B',
  },

  /* 2. GREETING */
  greetingSection: {
    position: 'relative',
    height: 95,
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 18,
    overflow: 'hidden',
  },
  greetingOverlay: {
    position: 'absolute',
    left: 16,
    top: 14,
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  saverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '400',
  },

  /* 3. TOTAL SAVINGS CARD */
  totalCard: {
    backgroundColor: '#111927',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  totalCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  totalCardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalAmountCol: {
    flex: 1,
  },
  amountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  amountCounterText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  encouragementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  encouragementText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
  },
  sparklineCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  /* 4. ACTIVE PLOTS HEADER */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },

  /* 5. CAROUSEL & GOAL CARDS (Symmetrical Side Peeking) */
  carouselContent: {
    paddingHorizontal: 60,
    gap: 14,
  },
  goalCard: {
    width: CARD_WIDTH,
    backgroundColor: '#111927',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  goalCardActive: {
    borderColor: '#86EFAC',
    borderWidth: 2,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  goalCardInactive: {
    opacity: 0.75,
  },
  goalCardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  goalCardSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 10,
  },
  cardCoinContainer: {
    width: '100%',
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  goalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  currentAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#86EFAC',
  },
  targetAmountText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 3,
  },
  progressBarFillComplete: {
    backgroundColor: '#86EFAC',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  statusCompleteText: {
    fontSize: 11,
    color: '#86EFAC',
    fontWeight: '600',
  },
  statusFundingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  viewDetailsBtn: {
    marginTop: 10,
    height: 40,
    backgroundColor: '#86EFAC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B111E',
  },
  inspectBtn: {
    marginTop: 10,
    height: 40,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  inspectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },

  /* 6. QUICK ACTIONS */
  quickActionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111927',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
  },
  quickActionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickActionTextCol: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  emptyCarouselCard: {
    backgroundColor: '#121B2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#162234',
    borderWidth: 1,
    borderColor: '#22324B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyCarouselTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptyCarouselSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  emptyAddGoalBtn: {
    backgroundColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyAddGoalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B111E',
  },
});
