import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  Award,
  CheckCircle,
  Lock,
  CircleDollarSign,
  Flag,
  Compass,
  Layers,
  Hammer,
  Home,
  Palette,
  Zap,
  Crown,
} from 'lucide-react-native';
import { Sparkles } from '../illustrations/CustomIcons';
import { PlantSprout } from '../illustrations/PlantSprout';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP } from '../../utils/calculations';
import { getThemeColors } from '../../utils/theme';

interface TrophyRoomModalProps {
  visible: boolean;
  onClose: () => void;
}

function getTrophyIconComponent(badgeId: string) {
  switch (badgeId) {
    case 'first_deposit':
      return CircleDollarSign;
    case 'phase_0':
      return Flag;
    case 'phase_1':
      return Compass;
    case 'phase_2':
      return Layers;
    case 'phase_3':
      return Hammer;
    case 'phase_4':
      return Home;
    case 'phase_5':
      return Palette;
    case 'phase_6':
      return Sparkles;
    case 'streak_disciplined':
      return Zap;
    case 'peso_millionaire':
      return Crown;
    default:
      return Award;
  }
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({ visible, onClose }) => {
  const { trophies, projects, totalSavedAcrossAll, completedProjectsCount, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
  const [tab, setTab] = useState<'badges' | 'glory'>('badges');

  const completedProjects = projects.filter((p) => p.currentAmount >= p.targetPrice);
  const unlockedCount = trophies.filter((t) => !!t.unlockedAt).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>HALL OF ACHIEVEMENTS</Text>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trophies & Milestones</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Banner */}
          <View style={[styles.statsBanner, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL SAVED</Text>
              <Text style={[styles.statVal, { color: colors.accentEmerald }]}>
                {formatPHP(totalSavedAcrossAll)}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>GOALS ACQUIRED</Text>
              <Text style={[styles.statVal, { color: '#EBCB72' }]}>
                {completedProjectsCount}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>BADGES</Text>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                {unlockedCount} / {trophies.length}
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabBar, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setTab('badges')}
              style={[
                styles.tabBtn,
                tab === 'badges' && [styles.tabBtnActive, { backgroundColor: colors.surfaceCardSecondary }],
              ]}
            >
              <Text style={[styles.tabBtnText, { color: colors.textSecondary }, tab === 'badges' && [styles.tabBtnTextActive, { color: colors.accentEmerald }]]}>
                Badges ({unlockedCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab('glory')}
              style={[
                styles.tabBtn,
                tab === 'glory' && [styles.tabBtnActive, { backgroundColor: colors.surfaceCardSecondary }],
              ]}
            >
              <Text style={[styles.tabBtnText, { color: colors.textSecondary }, tab === 'glory' && [styles.tabBtnTextActive, { color: colors.accentEmerald }]]}>
                Fulfilled Goals ({completedProjects.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {tab === 'badges' ? (
              <View style={styles.badgeGrid}>
                {trophies.map((badge) => {
                  const isUnlocked = !!badge.unlockedAt;
                  const IconComp = getTrophyIconComponent(badge.id);

                  return (
                    <View
                      key={badge.id}
                      style={[
                        styles.badgeCard,
                        { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border },
                        isUnlocked && [styles.badgeCardUnlocked, { borderColor: colors.accentEmerald }],
                      ]}
                    >
                      <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceSubtle }, isUnlocked && styles.iconWrapperUnlocked]}>
                        {isUnlocked ? (
                          <IconComp size={22} color="#EBCB72" />
                        ) : (
                          <Lock size={18} color={colors.textMuted} />
                        )}
                      </View>
                      <Text style={[styles.badgeTitle, { color: colors.textSecondary }, isUnlocked && [styles.badgeTitleUnlocked, { color: colors.textPrimary }]]}>
                        {badge.title}
                      </Text>
                      <Text style={[styles.badgeDesc, { color: colors.textMuted }]} numberOfLines={2}>
                        {badge.description}
                      </Text>
                      {isUnlocked && (
                        <View style={styles.unlockedTag}>
                          <CheckCircle size={10} color={colors.accentEmerald} />
                          <Text style={[styles.unlockedTagText, { color: colors.accentEmerald }]}>Unlocked</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.gloryContainer}>
                {completedProjects.length === 0 ? (
                  <View style={[styles.emptyGlory, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
                    <PlantSprout size={36} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Completed Goals Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                      Keep funding your goals! When a goal reaches 100%, it will be enshrined here forever.
                    </Text>
                  </View>
                ) : (
                  completedProjects.map((proj) => (
                    <View key={proj.id} style={[styles.gloryCard, { backgroundColor: colors.surfaceCardSecondary }]}>
                      <View style={styles.gloryTop}>
                        <Text style={[styles.gloryTitle, { color: colors.textPrimary }]}>{proj.title}</Text>
                        <Text style={[styles.gloryPrice, { color: '#EBCB72' }]}>{formatPHP(proj.targetPrice)}</Text>
                      </View>
                      <Text style={[styles.gloryBlessing, { color: colors.accentEmerald }]}>
                        ✓ Acquired and blessed!
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0D211B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 24,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#55D99A',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F7F3',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#102820',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#142F26',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#142F26',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9AAFA5',
    letterSpacing: 0.8,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4F7F3',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#07130F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#102820',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9AAFA5',
  },
  tabBtnTextActive: {
    color: '#55D99A',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#102820',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
  },
  badgeCardUnlocked: {
    borderColor: '#55D99A',
    backgroundColor: 'rgba(85, 217, 154, 0.08)',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07130F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapperUnlocked: {
    backgroundColor: 'rgba(85, 217, 154, 0.15)',
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AAFA5',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitleUnlocked: {
    color: '#F4F7F3',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#667A71',
    textAlign: 'center',
    lineHeight: 14,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  unlockedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#55D99A',
  },
  gloryContainer: {
    gap: 10,
  },
  gloryCard: {
    backgroundColor: '#102820',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(235, 203, 114, 0.3)',
  },
  gloryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gloryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F7F3',
  },
  gloryPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EBCB72',
  },
  gloryBlessing: {
    fontSize: 12,
    color: '#55D99A',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyGlory: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F7F3',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#667A71',
    textAlign: 'center',
    lineHeight: 18,
  },
});
