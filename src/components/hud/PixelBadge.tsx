import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
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
  Award,
} from 'lucide-react-native';
import { TrophyBadge } from '../../types';

interface PixelBadgeProps {
  badge: TrophyBadge;
  size?: 'sm' | 'md' | 'lg';
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

export const PixelBadge: React.FC<PixelBadgeProps> = ({ badge, size = 'md' }) => {
  const isUnlocked = !!badge.unlockedAt;
  const IconComp = getTrophyIconComponent(badge.id);

  const dims = {
    sm: { box: 56, icon: 20, titleSize: 10 },
    md: { box: 80, icon: 28, titleSize: 11 },
    lg: { box: 96, icon: 34, titleSize: 13 },
  }[size];

  return (
    <View
      style={[
        styles.badgeSlot,
        {
          width: dims.box,
          height: dims.box + 26,
          borderColor: isUnlocked ? '#CA8A04' : '#334155',
          backgroundColor: isUnlocked ? '#1C1917' : '#0F172A',
        },
      ]}
    >
      {/* Icon Slot */}
      <View
        style={[
          styles.iconBox,
          {
            width: dims.box - 12,
            height: dims.box - 12,
            backgroundColor: isUnlocked ? '#292524' : '#102820',
          },
        ]}
      >
        {isUnlocked ? (
          <IconComp size={dims.icon} color="#FEF08A" />
        ) : (
          <Lock size={dims.icon * 0.75} color="#64748B" />
        )}
      </View>

      {/* Label */}
      <Text
        numberOfLines={2}
        style={[
          styles.badgeTitle,
          {
            fontSize: dims.titleSize,
            color: isUnlocked ? '#FEF08A' : '#64748B',
          },
        ]}
      >
        {badge.title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeSlot: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconBox: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#44403C',
  },
  badgeTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
