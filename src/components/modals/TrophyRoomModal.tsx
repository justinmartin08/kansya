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
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react-native';
import { PlantSprout } from '../illustrations/PlantSprout';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP } from '../../utils/calculations';

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
  const { trophies, projects, totalSavedAcrossAll, completedProjectsCount } = useKansya();
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

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerSubtitle}>HALL OF ACHIEVEMENTS</Text>
              <Text style={styles.headerTitle}>Trophies & Milestones</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Stats Banner */}
          <View style={styles.statsBanner}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>TOTAL SAVED</Text>
              <Text style={[styles.statVal, { color: '#86EFAC' }]}>
                {formatPHP(totalSavedAcrossAll)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>GOALS ACQUIRED</Text>
              <Text style={[styles.statVal, { color: '#FFB800' }]}>
                {completedProjectsCount}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>BADGES</Text>
              <Text style={styles.statVal}>
                {unlockedCount} / {trophies.length}
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setTab('badges')}
              style={[styles.tabBtn, tab === 'badges' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, tab === 'badges' && styles.tabBtnTextActive]}>
                Badges ({unlockedCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab('glory')}
              style={[styles.tabBtn, tab === 'glory' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, tab === 'glory' && styles.tabBtnTextActive]}>
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
                      style={[styles.badgeCard, isUnlocked && styles.badgeCardUnlocked]}
                    >
                      <View style={[styles.iconWrapper, isUnlocked && styles.iconWrapperUnlocked]}>
                        {isUnlocked ? (
                          <IconComp size={22} color="#FEF08A" />
                        ) : (
                          <Lock size={18} color="#64748B" />
                        )}
                      </View>
                      <Text style={[styles.badgeTitle, isUnlocked && styles.badgeTitleUnlocked]}>
                        {badge.title}
                      </Text>
                      <Text style={styles.badgeDesc} numberOfLines={2}>
                        {badge.description}
                      </Text>
                      {isUnlocked && (
                        <View style={styles.unlockedTag}>
                          <CheckCircle size={10} color="#86EFAC" />
                          <Text style={styles.unlockedTagText}>Unlocked</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.gloryContainer}>
                {completedProjects.length === 0 ? (
                  <View style={styles.emptyGlory}>
                    <PlantSprout size={36} color="#334155" />
                    <Text style={styles.emptyTitle}>No Completed Goals Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Keep funding your goals! When a goal reaches 100%, it will be enshrined here forever.
                    </Text>
                  </View>
                ) : (
                  completedProjects.map((proj) => (
                    <View key={proj.id} style={styles.gloryCard}>
                      <View style={styles.gloryTop}>
                        <Text style={styles.gloryTitle}>{proj.title}</Text>
                        <Text style={styles.gloryPrice}>{formatPHP(proj.targetPrice)}</Text>
                      </View>
                      <Text style={styles.gloryBlessing}>
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
    color: '#86EFAC',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22324B',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#22324B',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E1624',
    borderRadius: 12,
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
    backgroundColor: '#1E293B',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#86EFAC',
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
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  badgeCardUnlocked: {
    borderColor: '#86EFAC',
    backgroundColor: 'rgba(134, 239, 172, 0.04)',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0E1624',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapperUnlocked: {
    backgroundColor: 'rgba(134, 239, 172, 0.1)',
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
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitleUnlocked: {
    color: '#F8FAFC',
  },
  badgeDesc: {
    fontSize: 10,
    color: '#64748B',
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
    color: '#86EFAC',
  },
  gloryContainer: {
    gap: 10,
  },
  gloryCard: {
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  gloryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gloryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gloryPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFB800',
  },
  gloryBlessing: {
    fontSize: 12,
    color: '#86EFAC',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyGlory: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
