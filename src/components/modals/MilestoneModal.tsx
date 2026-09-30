import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';
import { ConstructionPhase, WishlistProject } from '../../types';
import { formatPHP } from '../../utils/calculations';
import { PROJECT_IMAGES } from '../../utils/projectImages';
import { KansyaDesign, getThemeColors } from '../../utils/theme';
import { useKansya } from '../../store/KansyaContext';

interface MilestoneModalProps {
  visible: boolean;
  project: WishlistProject;
  phase: ConstructionPhase;
  isCompletion: boolean;
  onClose: () => void;
  onOpenNewGoal?: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  visible,
  project,
  phase,
  isCompletion,
  onClose,
  onOpenNewGoal,
}) => {
  const { updateProject, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);

  const handleMarkPurchased = async () => {
    await updateProject(project.id, {
      completedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.cardContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Mascot with Coin Artwork */}
          <View style={[styles.mascotContainer, { backgroundColor: colors.surfaceCardSecondary }]}>
            <Image
              source={PROJECT_IMAGES.mascot_avatar}
              style={styles.mascotImage}
            />
          </View>

          {isCompletion ? (
            <>
              {/* Goal Complete Header */}
              <View style={styles.statusPill}>
                <Sparkles size={14} color="#EBCB72" />
                <Text style={styles.statusPillText}>Goal complete</Text>
              </View>

              <Text style={[styles.savedAmountText, { color: colors.textPrimary }]}>
                {formatPHP(project.targetPrice)} saved
              </Text>
              <Text style={styles.motivatingText}>
                "You made it happen."
              </Text>

              <Text style={[styles.projectSubtitle, { color: colors.textSecondary }]}>
                {project.title}
              </Text>

              {/* Three Restrained Production Options */}
              <View style={styles.optionsCol}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.accentEmerald }]}
                  onPress={handleMarkPurchased}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.primaryActionText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Mark as purchased</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>Keep saving</Text>
                </TouchableOpacity>

                {onOpenNewGoal && (
                  <TouchableOpacity
                    style={styles.ghostActionBtn}
                    onPress={() => {
                      onClose();
                      onOpenNewGoal();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.ghostActionText, { color: colors.textSecondary }]}>Create another goal</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Intermediate Savings Milestone */}
              <View style={styles.statusPill}>
                <Sparkles size={14} color={colors.accentEmerald} />
                <Text style={[styles.statusPillText, { color: colors.accentEmerald }]}>
                  Savings milestone
                </Text>
              </View>

              <Text style={[styles.phaseName, { color: colors.textPrimary }]}>{phase.name}</Text>
              <Text style={[styles.phaseTagline, { color: colors.textSecondary }]}>{phase.tagline}</Text>

              <View style={[styles.projectInfoBox, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
                <Text style={[styles.projectTitle, { color: colors.textPrimary }]}>{project.title}</Text>
                <Text style={[styles.progressSummary, { color: colors.textSecondary }]}>
                  {formatPHP(project.currentAmount)} of {formatPHP(project.targetPrice)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.accentEmerald }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryActionText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Keep saving</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 15, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0D211B',
    borderRadius: KansyaDesign.radius.lg,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 24,
    alignItems: 'center',
  },
  mascotContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#102820',
    borderWidth: 1.5,
    borderColor: 'rgba(85, 217, 154, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(235, 203, 114, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EBCB72',
    letterSpacing: 0.4,
  },
  savedAmountText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F4F7F3',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  motivatingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#55D99A',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  projectSubtitle: {
    fontSize: 13,
    color: '#9AAFA5',
    marginBottom: 20,
  },
  optionsCol: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  primaryActionBtn: {
    width: '100%',
    height: 48,
    borderRadius: KansyaDesign.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#07130F',
  },
  secondaryActionBtn: {
    width: '100%',
    height: 46,
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F7F3',
  },
  ghostActionBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostActionText: {
    fontSize: 13,
    color: '#9AAFA5',
    fontWeight: '500',
  },
  phaseName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F4F7F3',
    marginBottom: 2,
  },
  phaseTagline: {
    fontSize: 12,
    color: '#9AAFA5',
    marginBottom: 16,
    textAlign: 'center',
  },
  projectInfoBox: {
    width: '100%',
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  projectTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F4F7F3',
  },
  progressSummary: {
    fontSize: 12,
    color: '#55D99A',
    fontWeight: '600',
    marginTop: 2,
  },
});
