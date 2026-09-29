import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Sparkles,
  ArrowRight,
  Check,
  Flag,
  Compass,
  Layers,
  Hammer,
  Home,
  Palette,
  Award,
} from 'lucide-react-native';
import { ConstructionPhase, WishlistProject } from '../../types';
import { ConfettiCannon } from '../ConfettiCannon';
import { formatPHP, getProjectProgress } from '../../utils/calculations';

function getPhaseIconComponent(badgeIcon: string) {
  switch (badgeIcon) {
    case 'flag':
      return Flag;
    case 'compass':
      return Compass;
    case 'layers':
      return Layers;
    case 'hammer':
      return Hammer;
    case 'home':
      return Home;
    case 'palette':
      return Palette;
    case 'sparkles':
      return Sparkles;
    default:
      return Award;
  }
}

interface MilestoneModalProps {
  visible: boolean;
  project: WishlistProject;
  phase: ConstructionPhase;
  isCompletion: boolean;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  visible,
  project,
  phase,
  isCompletion,
  onClose,
}) => {
  const { clampedPercent } = getProjectProgress(project.currentAmount, project.targetPrice);
  const IconComponent = getPhaseIconComponent(phase.badgeIcon);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Confetti Particle Layer */}
        <ConfettiCannon />

        <View style={styles.cardContainer}>
          {/* Glowing Header Banner */}
          <View style={[styles.ribbonBanner, isCompletion ? styles.ribbonGold : styles.ribbonMint]}>
            <Sparkles size={16} color={isCompletion ? '#FFB800' : '#86EFAC'} />
            <Text style={[styles.ribbonText, isCompletion ? styles.ribbonTextGold : styles.ribbonTextMint]}>
              {isCompletion ? 'GOAL ACQUIRED & FULFILLED!' : 'SAVINGS MILESTONE REACHED!'}
            </Text>
          </View>

          {/* Badge Icon */}
          <View style={styles.iconCircle}>
            <IconComponent size={34} color={isCompletion ? '#FFB800' : '#86EFAC'} />
          </View>

          {/* Phase Title & Subtitle */}
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.phaseTagline}>{phase.tagline}</Text>

          {/* Project Target Box */}
          <View style={styles.projectInfoBox}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.progressSummary}>
              {formatPHP(project.currentAmount)} of {formatPHP(project.targetPrice)} ({clampedPercent}%)
            </Text>
          </View>

          {/* Story Snippet */}
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{phase.description}</Text>
          </View>

          {/* Dismiss Button */}
          <TouchableOpacity style={styles.confirmBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.confirmBtnText}>
              {isCompletion ? 'Claim and Celebrate!' : 'Keep Stacking!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#121B2A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  ribbonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  ribbonMint: {
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.3)',
  },
  ribbonGold: {
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  ribbonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ribbonTextMint: {
    color: '#86EFAC',
  },
  ribbonTextGold: {
    color: '#FFB800',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#162234',
    borderWidth: 2,
    borderColor: '#22324B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 34,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  phaseTagline: {
    fontSize: 12,
    color: '#86EFAC',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 14,
  },
  projectInfoBox: {
    backgroundColor: '#0E1624',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  progressSummary: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  descriptionBox: {
    backgroundColor: '#162234',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B111E',
  },
});
