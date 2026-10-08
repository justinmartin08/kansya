import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Target,
  Bookmark,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
} from 'lucide-react-native';
import {
  Sun,
  Moon,
  Trophy,
  User,
  Settings,
} from '../components/illustrations/CustomIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { ProgressiveAlkansya } from '../components/illustrations/ProgressiveAlkansya';
import { PlusCoinIcon } from '../components/illustrations/PlusCoinIcon';
import { TargetCoinIcon, WishlistCoinIcon, HistoryCoinIcon } from '../components/illustrations/QuickActionIcons';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TactilePressable } from '../components/ui/TactilePressable';
import { FloatingNumbers } from '../components/hud/FloatingNumbers';
import { QuickDepositModal } from '../components/modals/QuickDepositModal';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { AllowanceModal } from '../components/modals/AllowanceModal';
import { TrophyRoomModal } from '../components/modals/TrophyRoomModal';
import { MilestoneModal } from '../components/modals/MilestoneModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { HistoryModal } from '../components/modals/HistoryModal';
import { AvatarBadge } from '../utils/avatars';
import { getThemeColors, KansyaDesign } from '../utils/theme';
import { formatPHP, getProjectProgress } from '../utils/calculations';
import { WishlistProject } from '../types';
import { PROJECT_IMAGES, getProjectImage } from '../utils/projectImages';
import { KANSYA_MOCKUP_PROJECTS } from '../store/defaultData';
import { KProgressBar } from '../components/design/DesignSystem';

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
    deposits,
    totalSavedAcrossAll,
    milestoneCelebration,
    closeMilestoneModal,
    floatingDeposit,
    clearFloatingDeposit,
    trophies,
    currentUser,
    theme,
    isDark,
    toggleTheme,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [targetDepositProject, setTargetDepositProject] = useState<WishlistProject | null>(null);
  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [allowanceModalVisible, setAllowanceModalVisible] = useState(false);
  const [trophyModalVisible, setTrophyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Active display projects: real user projects only
  const displayProjects = projects;

  // Primary active goal for Hero Subcard
  const activeGoal = projects.find((p) => p.id === activeProjectId) || (projects.length > 0 ? projects[0] : null);
  const activeProg = activeGoal
    ? getProjectProgress(activeGoal.currentAmount, activeGoal.targetPrice)
    : null;

  // Calculate today's savings for the badge (real data only)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayDepositsAmount = deposits
    .filter((d) => new Date(d.timestamp).getTime() >= todayStart)
    .reduce((sum, d) => sum + d.amount, 0);

  const displayTodaySavings = todayDepositsAmount;

  const handleOpenDeposit = (project: WishlistProject) => {
    setTargetDepositProject(project);
    setDepositModalVisible(true);
  };

  const projectMap = new Map(displayProjects.map((p) => [p.id, p.title]));

  // Real recent activity items only
  const recentActivities = deposits.slice(0, 4).map((d) => ({
    id: d.id,
    title: projectMap.get(d.projectId) ? `Goal: ${projectMap.get(d.projectId)}` : 'Quick deposit',
    timestamp: new Date(d.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    amount: d.amount,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.kansyaBg || colors.background }]}>
      <ScrollView
        style={[styles.scrollArea, { backgroundColor: colors.kansyaBg || colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6 },
        ]}
      >
        {/* ================================================================ */}
        {/* 1. HEADER (Mascot Avatar, Kansya title, Supportive subtitle, Actions) */}
        {/* ================================================================ */}
        <View style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Image
              source={PROJECT_IMAGES.mascot_avatar}
              style={styles.headerMascotAvatar}
            />
            <View style={styles.brandTextCol}>
              <Text style={[styles.headerBrandTitle, { color: colors.textPrimary }]}>
                Kansya
              </Text>
              <Text style={[styles.headerBrandSubtitle, { color: colors.textSecondary }]}>
                Small steps, bigger dreams.
              </Text>
            </View>
          </View>

          {/* Top Nav Actions ordered strictly for test verification */}
          <View style={styles.topNavActions}>
            {/* Action 1: Theme Toggle (Sun / Moon) */}
            <TactilePressable
              style={[
                styles.navIconBtn,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
              onPress={toggleTheme}
              activeScale={0.96}
              haptic
              accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={15} color="#EBCB72" />
              ) : (
                <Moon size={15} color="#55D99A" />
              )}
            </TactilePressable>

            {/* Action 2: Trophies & Milestones */}
            <TactilePressable
              style={[
                styles.navIconBtn,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
              onPress={() => setTrophyModalVisible(true)}
              activeScale={0.96}
              haptic
              accessibilityLabel="Achievements and Trophies"
            >
              <Trophy size={16} color={colors.textPrimary} />
              {trophies.some((t) => !!t.unlockedAt) && (
                <View style={styles.navGoldDot} />
              )}
            </TactilePressable>

            {/* Action 3: Profile & Identity Customization */}
            <TactilePressable
              style={[
                styles.navIconBtn,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
              onPress={() => setProfileModalVisible(true)}
              activeScale={0.96}
              haptic
              accessibilityLabel="User Profile and Identity"
            >
              {currentUser?.avatarId ? (
                <AvatarBadge avatarId={currentUser.avatarId} size={22} showBorder={false} />
              ) : (
                <User size={15} color={colors.textPrimary} />
              )}
            </TactilePressable>

            {/* Action 4: Settings (Baon & Allowance) */}
            <TactilePressable
              style={[
                styles.navIconBtn,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
              onPress={() => setAllowanceModalVisible(true)}
              activeScale={0.96}
              haptic
              accessibilityLabel="Allowance Engine Settings"
            >
              <Settings size={15} color={colors.textPrimary} />
            </TactilePressable>
          </View>
        </View>

        {/* ================================================================ */}
        {/* 2. TOTAL SAVINGS HERO CARD (Mascot Meadow & Current Goal Subcard) */}
        {/* ================================================================ */}
        <View style={styles.heroCardContainer}>
          <View
            style={[
              styles.heroAtmosphereCard,
              { backgroundColor: colors.surfaceCard, borderColor: colors.border },
            ]}
          >
            {/* Piggy Mascot Artwork on Right */}
            <View style={styles.piggyContainer}>
              <Image
                source={PROJECT_IMAGES.home_hero_piggy}
                style={styles.heroPiggyArtwork}
              />
            </View>

            {/* Balance Details */}
            <View style={styles.heroBalanceSection}>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
                Total Savings
              </Text>

              <View style={styles.heroAmountRow}>
                {isBalanceHidden ? (
                  <Text style={[styles.heroAmountHidden, { color: colors.textPrimary }]}>
                    ••••••
                  </Text>
                ) : (
                  <AnimatedCounter
                    value={totalSavedAcrossAll}
                    prefix="₱"
                    style={[styles.heroAmountText, { color: colors.textPrimary }]}
                  />
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                  style={styles.eyeToggleBtn}
                  accessibilityLabel={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                >
                  <Eye size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Today Badge */}
              <View style={[styles.todayPillBadge, { backgroundColor: isDark ? 'rgba(85, 217, 154, 0.12)' : 'rgba(5, 150, 105, 0.12)' }]}>
                {displayTodaySavings > 0 ? (
                  <>
                    <ArrowUpRight size={12} color={colors.accentEmerald} strokeWidth={2.5} />
                    <Text style={[styles.todayPillText, { color: colors.accentEmerald }]}>
                      +{formatPHP(displayTodaySavings)} today
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.todayPillText, { color: colors.textSecondary }]}>
                    ₱0 saved today
                  </Text>
                )}
              </View>
            </View>

            {/* Current Goal Sub-Card inside Hero */}
            {activeGoal && activeProg ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onOpenProjectDetail(activeGoal.id)}
                style={[
                  styles.currentGoalSubCard,
                  {
                    backgroundColor: isDark ? '#0D211A' : '#F1F8F4',
                    borderColor: isDark ? '#163B2B' : '#D1E8D9',
                  },
                ]}
              >
                <View style={styles.currentGoalHeader}>
                  <View style={[styles.currentGoalDot, { backgroundColor: colors.accentEmerald }]} />
                  <Text style={[styles.currentGoalLabel, { color: isDark ? '#9FC7A9' : colors.textSecondary }]}>Current Goal</Text>
                </View>

                <View style={styles.currentGoalBody}>
                  <View style={[styles.currentGoalIconBox, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                    <ProgressiveAlkansya
                      currentAmount={activeGoal.currentAmount}
                      targetPrice={activeGoal.targetPrice}
                      size={44}
                    />
                  </View>

                  <View style={styles.currentGoalInfo}>
                    <View style={styles.currentGoalTopLine}>
                      <Text style={[styles.currentGoalTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {activeGoal.title}
                      </Text>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </View>

                    <Text style={[styles.currentGoalAmounts, { color: colors.textSecondary }]}>
                      {formatPHP(activeGoal.currentAmount)} / {formatPHP(activeGoal.targetPrice)}
                    </Text>

                    <View style={styles.currentGoalProgressRow}>
                      <View style={styles.currentGoalProgressBarWrap}>
                        <KProgressBar
                          progress={activeProg.clampedPercent}
                          height={4}
                          color={colors.accentEmerald}
                        />
                      </View>
                      <Text style={[styles.currentGoalPercentText, { color: colors.accentEmerald }]}>
                        {activeProg.clampedPercent}%
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setNewProjectModalVisible(true)}
                style={[
                  styles.currentGoalSubCard,
                  {
                    backgroundColor: isDark ? '#0D211A' : '#F1F8F4',
                    borderColor: isDark ? '#163B2B' : '#D1E8D9',
                  },
                ]}
              >
                <View style={styles.currentGoalHeader}>
                  <View style={[styles.currentGoalDot, { backgroundColor: colors.accentEmerald }]} />
                  <Text style={[styles.currentGoalLabel, { color: isDark ? '#9FC7A9' : colors.textSecondary }]}>Get Started</Text>
                </View>

                <View style={styles.currentGoalBody}>
                  <View style={[styles.currentGoalIconBox, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                    <ProgressiveAlkansya
                      currentAmount={0}
                      targetPrice={100}
                      size={44}
                    />
                  </View>

                  <View style={styles.currentGoalInfo}>
                    <View style={styles.currentGoalTopLine}>
                      <Text style={[styles.currentGoalTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        Set Your First Goal
                      </Text>
                      <ChevronRight size={16} color={colors.accentEmerald} />
                    </View>

                    <Text style={[styles.currentGoalAmounts, { color: colors.textSecondary }]}>
                      Tap here to begin saving towards your dreams
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ================================================================ */}
        {/* 3. QUICK ACTIONS (4 Circular Buttons Matching Mockup) */}
        {/* ================================================================ */}
        <View style={styles.quickActionsContainer}>
          {/* Quick Action 1: Add Savings */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (activeGoal) {
                handleOpenDeposit(activeGoal);
              } else {
                setNewProjectModalVisible(true);
              }
            }}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <PlusCoinIcon size={20} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>
              Add Savings
            </Text>
          </TouchableOpacity>

          {/* Quick Action 2: New Goal */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNewProjectModalVisible(true)}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <TargetCoinIcon size={20} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>
              New Goal
            </Text>
          </TouchableOpacity>

          {/* Quick Action 3: Wishlist */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => (onNavigateTab ? onNavigateTab('savings') : null)}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <WishlistCoinIcon size={20} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>
              Wishlist
            </Text>
          </TouchableOpacity>

          {/* Quick Action 4: History */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setHistoryModalVisible(true)}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionCircle, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <HistoryCoinIcon size={20} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================================================ */}
        {/* 4. MY GOALS SECTION (Compact, scannable rows) */}
        {/* ================================================================ */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
              My Goals
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (onNavigateTab ? onNavigateTab('goals') : null)}
              style={styles.viewAllAction}
            >
              <Text style={styles.viewAllActionText}>View all</Text>
            </TouchableOpacity>
          </View>

          {/* Goals List Rows */}
          <View style={styles.goalsListContainer}>
            {displayProjects.length === 0 ? (
              <View style={[styles.emptyCardBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <View style={styles.emptyPiggyIconWrap}>
                  <ProgressiveAlkansya currentAmount={0} targetPrice={100} size={44} />
                </View>
                <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>No savings goals yet</Text>
                <Text style={[styles.emptyCardSubtitle, { color: colors.textSecondary }]}>
                  Set your first target and watch your alkansya fill up coin by coin!
                </Text>
                <TactilePressable
                  style={[styles.emptyCreateBtn, { backgroundColor: colors.accentEmerald }]}
                  onPress={() => setNewProjectModalVisible(true)}
                  activeScale={0.97}
                  haptic
                >
                  <Text style={[styles.emptyCreateBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>+ Create First Goal</Text>
                </TactilePressable>
              </View>
            ) : (
              displayProjects.slice(0, 3).map((item) => {
                const { clampedPercent } = getProjectProgress(item.currentAmount, item.targetPrice);
                const imgSource = getProjectImage(item.imageKey, item.category);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => onOpenProjectDetail(item.id)}
                    style={[
                      styles.goalRowCard,
                      { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.goalRowThumbContainer, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                      <ProgressiveAlkansya
                        currentAmount={item.currentAmount}
                        targetPrice={item.targetPrice}
                        size={38}
                      />
                    </View>

                    <View style={styles.goalRowInfoCol}>
                      <View style={styles.goalRowTop}>
                        <Text style={[styles.goalRowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <ChevronRight size={16} color={colors.textSecondary} />
                      </View>

                      <Text style={[styles.goalRowAmounts, { color: colors.textSecondary }]}>
                        {formatPHP(item.currentAmount)} / {formatPHP(item.targetPrice)}
                      </Text>

                      <View style={styles.goalRowProgressRow}>
                        <View style={styles.goalRowProgressBar}>
                          <KProgressBar
                            progress={clampedPercent}
                            height={4}
                            color={colors.accentEmerald}
                          />
                        </View>
                        <Text style={[styles.goalRowPercent, { color: colors.accentEmerald }]}>
                          {clampedPercent}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* ================================================================ */}
        {/* 5. RECENT ACTIVITY SECTION */}
        {/* ================================================================ */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.textPrimary }]}>
              Recent Activity
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setHistoryModalVisible(true)}
              style={styles.viewAllAction}
            >
              <Text style={[styles.viewAllActionText, { color: colors.accentEmerald }]}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivities.length === 0 ? (
              <View style={[styles.emptyCardBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>No recent activity</Text>
                <Text style={[styles.emptyCardSubtitle, { color: colors.textSecondary }]}>
                  Every peso counts. Make your first deposit to see your savings timeline here!
                </Text>
              </View>
            ) : (
              recentActivities.map((act) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityRow,
                    { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.activityIconCircle, { backgroundColor: isDark ? 'rgba(85, 217, 154, 0.12)' : 'rgba(5, 150, 105, 0.12)' }]}>
                    <ArrowDownLeft size={16} color={colors.accentEmerald} strokeWidth={2.4} />
                  </View>

                  <View style={styles.activityDetailsCol}>
                    <Text style={[styles.activityTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {act.title}
                    </Text>
                    <Text style={[styles.activityTimestamp, { color: colors.textMuted }]}>
                      {act.timestamp}
                    </Text>
                  </View>

                  <Text style={[styles.activityAmountPositive, { color: colors.accentEmerald }]}>
                    +{formatPHP(act.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Numbers FX on deposit */}
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

      {/* History Ledger Modal */}
      <HistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07130F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  /* 1. Header Bar */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerMascotAvatar: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  headerBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerBrandSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  topNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGoldDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EBCB72',
  },

  /* 2. Hero Atmosphere Card */
  heroCardContainer: {
    marginBottom: 20,
  },
  heroAtmosphereCard: {
    borderRadius: KansyaDesign.radius.lg,
    borderWidth: 1,
    padding: 18,
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#55D99A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  piggyContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 124,
    height: 110,
    zIndex: 2,
  },
  heroPiggyArtwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.98,
  },
  heroBalanceSection: {
    maxWidth: '62%',
    marginBottom: 20,
    minHeight: 124,
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroAmountText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  heroAmountHidden: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 2,
  },
  eyeToggleBtn: {
    padding: 4,
  },
  todayPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(85, 217, 154, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: KansyaDesign.radius.sm,
    gap: 4,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55D99A',
  },

  /* Current Goal Subcard inside Hero */
  currentGoalSubCard: {
    backgroundColor: 'rgba(7, 19, 15, 0.85)',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 47, 38, 0.9)',
    padding: 14,
    marginTop: 18,
    zIndex: 3,
    shadowColor: '#55D99A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyCardBox: {
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyPiggyIconWrap: {
    marginBottom: 4,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyCardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  emptyCreateBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: KansyaDesign.radius.sm,
  },
  emptyCreateBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  currentGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  currentGoalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#55D99A',
    shadowColor: '#55D99A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  currentGoalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9FC7A9',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  currentGoalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentGoalIconBox: {
    width: 44,
    height: 44,
    borderRadius: KansyaDesign.radius.sm,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  currentGoalThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  currentGoalInfo: {
    flex: 1,
  },
  currentGoalTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentGoalTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  currentGoalAmounts: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  currentGoalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentGoalProgressBarWrap: {
    flex: 1,
  },
  currentGoalPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55D99A',
    minWidth: 26,
    textAlign: 'right',
  },

  /* 3. Quick Actions */
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* 4. Section Common */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllAction: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  viewAllActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55D99A',
  },

  /* Goals List Rows */
  goalsListContainer: {
    gap: 10,
  },
  goalRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  goalRowThumbContainer: {
    width: 50,
    height: 50,
    borderRadius: KansyaDesign.radius.sm,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  goalRowThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  goalRowInfoCol: {
    flex: 1,
  },
  goalRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  goalRowAmounts: {
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 6,
  },
  goalRowProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalRowProgressBar: {
    flex: 1,
  },
  goalRowPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#55D99A',
    minWidth: 26,
    textAlign: 'right',
  },

  /* 5. Recent Activity List */
  activityList: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(85, 217, 154, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetailsCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  activityTimestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  activityAmountPositive: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#55D99A',
  },
});
