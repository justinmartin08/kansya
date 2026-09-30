import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Plus,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Users,
  UserPlus,
  Send,
  X,
  CreditCard,
  Check,
  Plane,
  MapPin,
  Calendar,
  KeyRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { QuickDepositModal } from '../components/modals/QuickDepositModal';
import { JoinSquadModal } from '../components/modals/JoinSquadModal';
import { ProgressiveCoin } from '../components/illustrations/ProgressiveCoin';
import { TactilePressable } from '../components/ui/TactilePressable';
import { formatPHP, getProjectProgress } from '../utils/calculations';
import { WishlistProject, CollabGoal } from '../types';
import { getThemeColors } from '../utils/theme';

interface GoalsScreenProps {
  onOpenProjectDetail: (projectId: string) => void;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ onOpenProjectDetail }) => {
  const {
    projects,
    addDeposit,
    currentUser,
    allUsers,
    collabGoals,
    collabNotifications,
    activeCollabNotification,
    createCollabGoal,
    inviteToCollabGoal,
    respondToInvite,
    addCollabDeposit,
    dismissCollabNotification,
    joinCollabByCode,
    isCloudSyncActive,
    theme,
    isDark,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  // Segment: 'personal' | 'collab'
  const [activeSegment, setActiveSegment] = useState<'personal' | 'collab'>('personal');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [depositProject, setDepositProject] = useState<WishlistProject | null>(null);

  // Collab Squad Modals State
  const [newCollabModalVisible, setNewCollabModalVisible] = useState(false);
  const [joinSquadModalVisible, setJoinSquadModalVisible] = useState(false);
  const [collabTitle, setCollabTitle] = useState('');
  const [collabTargetStr, setCollabTargetStr] = useState('');
  const [inviteModalGoalId, setInviteModalGoalId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Collab Deposit Modal State
  const [collabDepositGoal, setCollabDepositGoal] = useState<CollabGoal | null>(null);
  const [collabDepositAmountStr, setCollabDepositAmountStr] = useState('500');
  const [collabDepositNote, setCollabDepositNote] = useState('');

  const currentUsername = currentUser?.username.toLowerCase() || 'saver';

  // Personal filtered projects
  const filteredProjects = projects.filter((p) => {
    const isCompleted = p.currentAmount >= p.targetPrice;
    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  // Pending invites for current user across all collab goals
  const myPendingInvites = collabGoals.flatMap((goal) =>
    goal.pendingInvites
      .filter((inv) => inv.username.toLowerCase() === currentUsername)
      .map((inv) => ({ goal, invite: inv }))
  );

  const handleCreateCollabGoal = async () => {
    const target = parseInt(collabTargetStr, 10);
    if (!collabTitle.trim() || !target || target <= 0) return;
    await createCollabGoal(collabTitle.trim(), target);
    setCollabTitle('');
    setCollabTargetStr('');
    setNewCollabModalVisible(false);
  };

  const handleSendInvite = async () => {
    if (!inviteModalGoalId || !inviteUsername.trim()) return;
    setInviteError('');
    setInviteSuccess('');
    const res = await inviteToCollabGoal(inviteModalGoalId, inviteUsername);
    if (!res.success) {
      setInviteError(res.error || 'Failed to send invite');
    } else {
      setInviteSuccess(`Invite sent to @${inviteUsername.trim().replace(/^@+/, '')}!`);
      setTimeout(() => {
        setInviteUsername('');
        setInviteSuccess('');
        setInviteModalGoalId(null);
      }, 1000);
    }
  };

  const handleConfirmCollabDeposit = async () => {
    if (!collabDepositGoal) return;
    const amount = parseInt(collabDepositAmountStr, 10);
    if (!amount || amount <= 0) return;
    await addCollabDeposit(collabDepositGoal.id, amount, collabDepositNote.trim() || undefined);
    setCollabDepositGoal(null);
    setCollabDepositNote('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6 }]}>
        {/* Top In-App Activity Notification Toast */}
        {activeCollabNotification && (
          <View style={styles.toastBanner}>
            <View style={styles.toastLeft}>
              <Sparkles size={16} color={colors.accentEmerald} />
              <View style={styles.toastTextCol}>
                <Text style={styles.toastTitle}>Squad Activity Alert</Text>
                <Text style={styles.toastMsg}>{activeCollabNotification.message}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={dismissCollabNotification} style={styles.toastCloseBtn}>
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Segmented Switcher (Personal Goals | Collab Squad) */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeSegment === 'personal' && [
                styles.segmentBtnActive,
                { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
              ],
            ]}
            onPress={() => setActiveSegment('personal')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeSegment === 'personal' && styles.segmentTextActive]}>
              Personal Goals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeSegment === 'collab' && [
                styles.segmentBtnActive,
                { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
              ],
            ]}
            onPress={() => setActiveSegment('collab')}
            activeOpacity={0.8}
          >
            <View style={styles.segmentCollabRow}>
              <Users size={14} color={activeSegment === 'collab' ? colors.accentEmerald : '#64748B'} />
              <Text style={[styles.segmentText, activeSegment === 'collab' && styles.segmentTextActive]}>
                Collab Squad
              </Text>
              {myPendingInvites.length > 0 && (
                <View style={styles.inviteBadge}>
                  <Text style={styles.inviteBadgeText}>{myPendingInvites.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ---------------- PERSONAL GOALS TAB ---------------- */}
        {activeSegment === 'personal' && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>WISHLIST CATALOG</Text>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Wishlist Goals</Text>
              </View>
              <TactilePressable
                style={styles.addBtn}
                onPress={() => setNewGoalModalVisible(true)}
                activeScale={0.97}
                haptic
              >
                <Plus size={15} color="#07130F" strokeWidth={3} />
                <Text style={styles.addBtnText}>New Goal</Text>
              </TactilePressable>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {(['all', 'active', 'completed'] as const).map((tab) => {
                const isSelected = filter === tab;
                return (
                  <TactilePressable
                    key={tab}
                    onPress={() => setFilter(tab)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? '#142F26' : '#E2E8F0')
                          : colors.surfaceCard,
                        borderColor: isSelected ? colors.accentEmerald : colors.border,
                      },
                    ]}
                    activeScale={0.97}
                    haptic
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isSelected
                            ? (isDark ? '#86EFAC' : '#059669')
                            : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                        tab === 'all'
                          ? projects.length
                          : tab === 'active'
                          ? projects.filter((p) => p.currentAmount < p.targetPrice).length
                          : projects.filter((p) => p.currentAmount >= p.targetPrice).length
                      })
                    </Text>
                  </TactilePressable>
                );
              })}
            </View>

            {/* Personal Goals List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {filteredProjects.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={[styles.emptyIconBox, { backgroundColor: isDark ? '#102820' : colors.surfaceSubtle, borderColor: colors.border }]}>
                    <Sparkles size={28} color={colors.accentEmerald} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Wishlist Goals Yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    {filter === 'all'
                      ? 'Clean slate! Tap "+ New Goal" to start saving for your dream items.'
                      : `No ${filter} goals found in your catalog.`}
                  </Text>
                  {filter === 'all' && (
                    <TactilePressable
                      style={[styles.emptyActionBtn, { backgroundColor: colors.accentEmerald }]}
                      onPress={() => setNewGoalModalVisible(true)}
                      activeScale={0.97}
                      haptic
                    >
                      <Text style={[styles.emptyActionBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>+ Add First Goal</Text>
                    </TactilePressable>
                  )}
                </View>
              ) : (
                filteredProjects.map((proj) => {
                  const { clampedPercent, isCompleted } = getProjectProgress(
                    proj.currentAmount,
                    proj.targetPrice
                  );

                  return (
                    <TactilePressable
                      key={proj.id}
                      style={[
                        styles.goalCard,
                        {
                          backgroundColor: colors.surfaceCard,
                          borderColor: isCompleted
                            ? (isDark ? 'rgba(134, 239, 172, 0.4)' : 'rgba(5, 150, 105, 0.4)')
                            : colors.border,
                        },
                      ]}
                      onPress={() => onOpenProjectDetail(proj.id)}
                      activeScale={0.97}
                      haptic
                    >
                      {/* Top Section */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.coinThumbnailContainer}>
                          <ProgressiveCoin
                            currentAmount={proj.currentAmount}
                            targetPrice={proj.targetPrice}
                            size={46}
                          />
                        </View>

                        <View style={styles.cardTitleCol}>
                          <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                            {proj.title}
                          </Text>
                          {isCompleted ? (
                            <View style={styles.fulfilledBadge}>
                              <CheckCircle2 size={11} color={colors.accentEmerald} />
                              <Text style={styles.fulfilledBadgeText}>Fulfilled</Text>
                            </View>
                          ) : (
                            <Text style={[styles.goalSubtitleText, { color: colors.textSecondary }]}>
                              {formatPHP(proj.targetPrice - proj.currentAmount)} remaining
                            </Text>
                          )}
                        </View>

                        {!isCompleted && (
                          <TactilePressable
                            style={[
                              styles.depositBtn,
                              {
                                backgroundColor: isDark ? '#162234' : '#F1F5F9',
                                borderColor: isDark ? '#22324B' : '#CBD5E1',
                              },
                            ]}
                            onPress={(e) => {
                              e?.stopPropagation?.();
                              setDepositProject(proj);
                            }}
                            activeScale={0.97}
                            haptic
                          >
                            <Text style={[styles.depositBtnText, { color: colors.accentEmerald }]}>+ Deposit</Text>
                          </TactilePressable>
                        )}
                      </View>

                      {/* Progress Breakdown */}
                      <View style={styles.amountBreakdownRow}>
                        <View style={styles.amountCol}>
                          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Saved</Text>
                          <Text style={[styles.amountCurrent, { color: colors.textPrimary }]}>{formatPHP(proj.currentAmount)}</Text>
                        </View>
                        <View style={[styles.amountCol, { alignItems: 'flex-end' }]}>
                          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Target: {formatPHP(proj.targetPrice)}</Text>
                          <Text style={[styles.percentText, { color: colors.accentEmerald }]}>{clampedPercent}%</Text>
                        </View>
                      </View>

                      {/* Horizontal Progress Bar */}
                      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${clampedPercent}%` },
                            isCompleted && styles.progressBarFillCompleted,
                          ]}
                        />
                      </View>

                      {/* Footer Row */}
                      <View style={styles.cardFooterRow}>
                        {isCompleted ? (
                          <View style={styles.footerStatusRow}>
                            <Sparkles size={12} color={colors.accentEmerald} />
                            <Text style={[styles.footerCompletedText, { color: colors.accentEmerald }]}>Goal fully acquired and blessed!</Text>
                          </View>
                        ) : (
                          <Text style={[styles.footerRemainingText, { color: colors.textMuted }]}>
                            {formatPHP(proj.targetPrice - proj.currentAmount)} remaining to complete
                          </Text>
                        )}
                        <ChevronRight size={15} color={colors.textMuted} />
                      </View>
                    </TactilePressable>
                  );
                })
              )}
            </ScrollView>
          </>
        )}

        {/* ---------------- COLLAB SQUAD TAB ---------------- */}
        {activeSegment === 'collab' && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>SHARED DUO & GROUP GOALS</Text>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Collab Squad</Text>
              </View>
              <View style={styles.headerButtonsRow}>
                <TouchableOpacity
                  style={[styles.joinCodeBtn, { backgroundColor: isDark ? '#162234' : '#F1F5F9', borderColor: colors.border }]}
                  onPress={() => setJoinSquadModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <KeyRound size={13} color={colors.accentEmerald} />
                  <Text style={[styles.joinCodeBtnText, { color: colors.textPrimary }]}>Join Code</Text>
                </TouchableOpacity>

                <TactilePressable
                  style={styles.addBtn}
                  onPress={() => setNewCollabModalVisible(true)}
                  activeScale={0.97}
                  haptic
                >
                  <Plus size={15} color="#07130F" strokeWidth={3} />
                  <Text style={styles.addBtnText}>New Goal</Text>
                </TactilePressable>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {/* Pending Invitations Banner for Current User */}
              {myPendingInvites.length > 0 && (
                <View style={[styles.pendingInvitesContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={styles.pendingInvitesHeader}>
                    <UserPlus size={15} color="#F59E0B" />
                    <Text style={[styles.pendingInvitesTitle, { color: colors.textPrimary }]}>
                      Pending Goal Invitations ({myPendingInvites.length})
                    </Text>
                  </View>
                  {myPendingInvites.map(({ goal, invite }) => (
                    <View key={goal.id} style={[styles.pendingInviteCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                      <View style={styles.pendingInviteInfo}>
                        <Text style={[styles.pendingGoalTitle, { color: colors.textPrimary }]}>{goal.title}</Text>
                        <Text style={[styles.pendingInviterText, { color: colors.textSecondary }]}>
                          Invited by @{invite.invitedBy} · Target: {formatPHP(goal.targetPrice)}
                        </Text>
                      </View>
                      <View style={styles.inviteActionsRow}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => respondToInvite(goal.id, true)}
                        >
                          <Check size={14} color="#07130F" strokeWidth={3} />
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.declineBtn, { backgroundColor: isDark ? '#142F26' : '#E2E8F0' }]}
                          onPress={() => respondToInvite(goal.id, false)}
                        >
                          <Text style={[styles.declineBtnText, { color: colors.textSecondary }]}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Collab Goals List */}
              {collabGoals.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                  <View style={[styles.emptyIconBox, { backgroundColor: isDark ? '#102820' : colors.surfaceSubtle, borderColor: colors.border }]}>
                    <Users size={32} color={colors.accentEmerald} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Squad Goals Yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Save together for Boracay trips, concert VIP tickets, or overseas adventures with friends.
                  </Text>
                  <TactilePressable
                    style={[styles.emptyActionBtn, { backgroundColor: colors.accentEmerald }]}
                    onPress={() => setNewCollabModalVisible(true)}
                    activeScale={0.97}
                    haptic
                  >
                    <Text style={[styles.emptyActionBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>+ Create Squad Goal</Text>
                  </TactilePressable>
                </View>
              ) : (
                collabGoals.map((goal) => {
                  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetPrice) * 100));
                  const isCompleted = goal.currentAmount >= goal.targetPrice;
                  const isMember = goal.members.some((m) => m.username.toLowerCase() === currentUsername);

                  return (
                    <View key={goal.id} style={[styles.collabGoalCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                      {/* Goal Title Header */}
                      <View style={styles.collabCardHeader}>
                        <View style={styles.collabTitleCol}>
                          <Text style={[styles.collabGoalTitle, { color: colors.textPrimary }]}>{goal.title}</Text>
                          <Text style={[styles.collabGoalSubtitle, { color: colors.textSecondary }]}>
                            Created by @{goal.createdBy} · {goal.members.length} Squad {goal.members.length === 1 ? 'Member' : 'Members'}
                          </Text>
                          {goal.inviteCode ? (
                            <View style={[styles.squadCodePill, { backgroundColor: isDark ? '#102820' : '#F1F5F9', borderColor: colors.border }]}>
                              <KeyRound size={11} color={colors.accentEmerald} />
                              <Text style={[styles.squadCodeLabel, { color: colors.textSecondary }]}>SQUAD CODE: </Text>
                              <Text style={[styles.squadCodeValue, { color: colors.accentEmerald }]}>{goal.inviteCode}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View style={styles.collabActionsRow}>
                          <TouchableOpacity
                            style={[styles.inviteMiniBtn, { backgroundColor: isDark ? '#102820' : '#F1F5F9', borderColor: isDark ? '#142F26' : '#CBD5E1' }]}
                            onPress={() => setInviteModalGoalId(goal.id)}
                          >
                            <UserPlus size={14} color={colors.accentEmerald} />
                            <Text style={[styles.inviteMiniBtnText, { color: colors.accentEmerald }]}>Invite</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.collabDepositActionBtn, { backgroundColor: colors.accentEmerald }]}
                            onPress={() => setCollabDepositGoal(goal)}
                          >
                            <Text style={[styles.collabDepositActionBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>+ Deposit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Amounts & Progress */}
                      <View style={styles.collabAmountsRow}>
                        <View>
                          <Text style={[styles.collabAmountLabel, { color: colors.textMuted }]}>TOTAL POOL SAVED</Text>
                          <Text style={[styles.collabCurrentAmount, { color: colors.textPrimary }]}>{formatPHP(goal.currentAmount)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.collabAmountLabel, { color: colors.textMuted }]}>TARGET: {formatPHP(goal.targetPrice)}</Text>
                          <Text style={[styles.collabPercentText, { color: colors.accentEmerald }]}>{percent}%</Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${percent}%` },
                            isCompleted && styles.progressBarFillCompleted,
                          ]}
                        />
                      </View>

                      {/* Member Contribution Breakdown */}
                      <View style={styles.membersSection}>
                        <Text style={[styles.membersSectionHeader, { color: colors.textMuted }]}>MEMBER CONTRIBUTIONS</Text>
                        <View style={styles.membersList}>
                          {goal.members.map((member) => {
                            const memberPercent = goal.currentAmount > 0
                              ? Math.round((member.totalContributed / goal.currentAmount) * 100)
                              : 0;
                            const isCurrentUser = member.username.toLowerCase() === currentUsername;

                            return (
                              <View key={member.username} style={styles.memberRow}>
                                <View style={styles.memberLeft}>
                                  <View style={styles.memberAvatarCircle}>
                                    <Text style={styles.memberAvatarInitial}>
                                      {member.name.charAt(0).toUpperCase()}
                                    </Text>
                                  </View>
                                  <View>
                                    <View style={styles.memberNameRow}>
                                      <Text style={[styles.memberNameText, { color: colors.textPrimary }]}>{member.name}</Text>
                                      {isCurrentUser && (
                                        <View style={styles.youBadge}>
                                          <Text style={styles.youBadgeText}>YOU</Text>
                                        </View>
                                      )}
                                    </View>
                                    <Text style={[styles.memberHandleText, { color: colors.textSecondary }]}>@{member.username}</Text>
                                  </View>
                                </View>

                                <View style={styles.memberRight}>
                                  <Text style={[styles.memberContributedAmount, { color: colors.textPrimary }]}>
                                    {formatPHP(member.totalContributed)}
                                  </Text>
                                  <Text style={[styles.memberContributedPercent, { color: colors.textMuted }]}>
                                    ({memberPercent}% of pool)
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      {/* Pending Invites on Goal */}
                      {goal.pendingInvites.length > 0 && (
                        <View style={styles.goalInvitesList}>
                          <Text style={[styles.goalInvitesText, { color: colors.textSecondary }]}>
                            Pending: {goal.pendingInvites.map((i) => `@${i.username}`).join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* New Personal Goal Modal */}
      <NewProjectModal
        visible={newGoalModalVisible}
        onClose={() => setNewGoalModalVisible(false)}
      />

      {/* Quick Deposit Modal for Personal Goal */}
      {depositProject && (
        <QuickDepositModal
          visible={!!depositProject}
          project={depositProject}
          onClose={() => setDepositProject(null)}
          onDeposit={async (amt, note) => {
            await addDeposit(depositProject.id, amt, note);
          }}
        />
      )}

      {/* Modal: Create Collab Goal */}
      <Modal
        visible={newCollabModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setNewCollabModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={() => setNewCollabModalVisible(false)}
          />
          <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetSubtitle, { color: colors.accentEmerald }]}>COLLAB SQUAD</Text>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Create Shared Goal</Text>
              </View>
              <TouchableOpacity
                onPress={() => setNewCollabModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.buttonSecondaryBg }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {/* Presets Chips */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Quick Ideas</Text>
              <View style={styles.presetChipsRow}>
                {[
                  { name: 'Boracay Trip', cost: '12000' },
                  { name: 'United States Trip', cost: '85000' },
                  { name: 'Japan Adventure', cost: '45000' },
                  { name: 'Concert VIP', cost: '15000' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.presetChip, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                    onPress={() => {
                      setCollabTitle(item.name);
                      setCollabTargetStr(item.cost);
                    }}
                  >
                    <Text style={[styles.presetChipText, { color: colors.textSecondary }]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Goal Title</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Boracay Trip, US Flight..."
                  placeholderTextColor={colors.textMuted}
                  value={collabTitle}
                  onChangeText={setCollabTitle}
                />
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Target Pool Price (PHP)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. 15000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={collabTargetStr}
                  onChangeText={(v) => setCollabTargetStr(v.replace(/[^0-9]/g, ''))}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.accentEmerald }]}
                onPress={handleCreateCollabGoal}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Launch Squad Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Invite Member to Squad Goal */}
      <Modal
        visible={!!inviteModalGoalId}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setInviteModalGoalId(null)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={() => setInviteModalGoalId(null)}
          />
          <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetSubtitle, { color: colors.accentEmerald }]}>COLLAB SQUAD</Text>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Invite Collaborator</Text>
              </View>
              <TouchableOpacity
                onPress={() => setInviteModalGoalId(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.buttonSecondaryBg }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {inviteError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{inviteError}</Text>
                </View>
              ) : null}

              {inviteSuccess ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{inviteSuccess}</Text>
                </View>
              ) : null}

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Type Collaborator Username (@handle)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>@</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. alex or maria"
                  placeholderTextColor={colors.textMuted}
                  value={inviteUsername}
                  onChangeText={(v) => {
                    setInviteUsername(v.replace(/^@+/, '').replace(/\s+/g, ''));
                    setInviteError('');
                  }}
                  autoCapitalize="none"
                />
              </View>

              {/* Quick suggestion chips from registered users */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Quick Suggest</Text>
              <View style={styles.presetChipsRow}>
                {allUsers
                  .filter((u) => u.username.toLowerCase() !== currentUsername)
                  .map((u) => (
                    <TouchableOpacity
                      key={u.username}
                      style={[styles.presetChip, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                      onPress={() => setInviteUsername(u.username)}
                    >
                      <Text style={[styles.presetChipText, { color: colors.textSecondary }]}>@{u.username} ({u.fullName})</Text>
                    </TouchableOpacity>
                  ))}
              </View>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.accentEmerald }]}
                onPress={handleSendInvite}
              >
                <Send size={16} color={isDark ? '#07130F' : '#FFFFFF'} />
                <Text style={[styles.modalPrimaryBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Send Invitation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Join Collab Squad with Code */}
      <JoinSquadModal
        visible={joinSquadModalVisible}
        onClose={() => setJoinSquadModalVisible(false)}
      />

      {/* Modal: Squad Deposit */}
      <Modal
        visible={!!collabDepositGoal}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setCollabDepositGoal(null)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={() => setCollabDepositGoal(null)}
          />
          <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetSubtitle, { color: colors.accentEmerald }]}>SQUAD DEPOSIT</Text>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  Fund {collabDepositGoal?.title || 'Goal'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCollabDepositGoal(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.buttonSecondaryBg }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              {/* Preset Chips */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Select Amount</Text>
              <View style={styles.presetChipsRow}>
                {['100', '250', '500', '1000', '2000'].map((amt) => {
                  const isActive = collabDepositAmountStr === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isActive ? (isDark ? 'rgba(134, 239, 172, 0.15)' : 'rgba(5, 150, 105, 0.12)') : colors.surfaceSubtle,
                          borderColor: isActive ? colors.accentEmerald : colors.border,
                        },
                      ]}
                      onPress={() => setCollabDepositAmountStr(amt)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          {
                            color: isActive ? colors.accentEmerald : colors.textSecondary,
                            fontWeight: isActive ? '700' : '600',
                          },
                        ]}
                      >
                        +₱{amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Custom Amount (PHP)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="500"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={collabDepositAmountStr}
                  onChangeText={(v) => setCollabDepositAmountStr(v.replace(/[^0-9]/g, ''))}
                />
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Optional Note</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="e.g. Errand allowance share, Baon savings"
                  placeholderTextColor={colors.textMuted}
                  value={collabDepositNote}
                  onChangeText={setCollabDepositNote}
                  maxLength={50}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: colors.accentEmerald }]}
                onPress={handleConfirmCollabDeposit}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>
                  Confirm Contribution ({formatPHP(parseInt(collabDepositAmountStr, 10) || 0)})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toastTextCol: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1,
  },
  toastMsg: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
    marginTop: 1,
  },
  toastCloseBtn: {
    padding: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#121B2A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#1E293B',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#86EFAC',
  },
  segmentCollabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  inviteBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#07130F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#86EFAC',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07130F',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#121B2A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterChipActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    borderColor: '#86EFAC',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#86EFAC',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
    gap: 14,
  },
  emptyContainer: {
    backgroundColor: '#121B2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#162234',
    borderWidth: 1,
    borderColor: '#22324B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#07130F',
  },
  goalCard: {
    backgroundColor: '#121B2A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
  },
  goalCardCompleted: {
    borderColor: 'rgba(134, 239, 172, 0.4)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  coinThumbnailContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCol: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  goalSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  fulfilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  fulfilledBadgeText: {
    fontSize: 11,
    color: '#86EFAC',
    fontWeight: '700',
  },
  depositBtn: {
    backgroundColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  depositBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07130F',
  },
  amountBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  amountCol: {
    gap: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  amountCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#86EFAC',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#1E293B',
    borderRadius: 3.5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 3.5,
  },
  progressBarFillCompleted: {
    backgroundColor: '#10B981',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerCompletedText: {
    fontSize: 11,
    color: '#86EFAC',
    fontWeight: '600',
  },
  footerRemainingText: {
    fontSize: 11,
    color: '#64748B',
  },
  pendingInvitesContainer: {
    backgroundColor: '#162234',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  pendingInvitesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingInvitesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  pendingInviteCard: {
    backgroundColor: '#0E1624',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pendingInviteInfo: {
    flex: 1,
  },
  pendingGoalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  pendingInviterText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  inviteActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07130F',
  },
  declineBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  declineBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  joinCodeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  squadCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  squadCodeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  squadCodeValue: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  collabGoalCard: {
    backgroundColor: '#121B2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    gap: 12,
  },
  collabCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  collabTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  collabGoalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  collabGoalSubtitle: {
    fontSize: 11,
    color: '#86EFAC',
    marginTop: 2,
    fontWeight: '600',
  },
  collabActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#162234',
    borderWidth: 1,
    borderColor: '#22324B',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inviteMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86EFAC',
  },
  collabDepositActionBtn: {
    backgroundColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  collabDepositActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07130F',
  },
  collabAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  collabAmountLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  collabCurrentAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#86EFAC',
    marginTop: 2,
  },
  collabPercentText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  membersSection: {
    backgroundColor: '#0E1624',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  membersSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1,
  },
  membersList: {
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A2436',
    borderWidth: 1,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarInitial: {
    fontSize: 12,
    fontWeight: '800',
    color: '#86EFAC',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  youBadge: {
    backgroundColor: 'rgba(134, 239, 172, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  youBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#86EFAC',
  },
  memberHandleText: {
    fontSize: 10,
    color: '#64748B',
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  memberContributedAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  memberContributedPercent: {
    fontSize: 10,
    color: '#86EFAC',
    fontWeight: '600',
  },
  goalInvitesList: {
    paddingTop: 4,
  },
  goalInvitesText: {
    fontSize: 10.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#121B2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 8,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#162234',
    borderWidth: 1,
    borderColor: '#22324B',
  },
  presetChipActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    borderColor: '#86EFAC',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  presetChipTextActive: {
    color: '#86EFAC',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1624',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 10,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86EFAC',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 50,
    marginTop: 16,
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#07130F',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  successText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
