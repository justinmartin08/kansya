import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GameFrameProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'wood' | 'stone' | 'gold' | 'dark';
  glow?: boolean;
}

export const GameFrame: React.FC<GameFrameProps> = ({
  children,
  style,
  variant = 'wood',
  glow = false,
}) => {
  return (
    <View style={[styles.outerFrame, styles[`outer_${variant}`], glow && styles.glowActive, style]}>
      {/* Corner Pixel Accents */}
      <View style={[styles.cornerSquare, styles.cornerTL, styles[`corner_${variant}`]]} />
      <View style={[styles.cornerSquare, styles.cornerTR, styles[`corner_${variant}`]]} />
      <View style={[styles.cornerSquare, styles.cornerBL, styles[`corner_${variant}`]]} />
      <View style={[styles.cornerSquare, styles.cornerBR, styles[`corner_${variant}`]]} />

      {/* Inner Content Slot */}
      <View style={[styles.innerFrame, styles[`inner_${variant}`]]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    borderWidth: 3,
    borderRadius: 8,
    padding: 3,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  // Wood Border (Terraria Mahogany / Oak style)
  outer_wood: {
    borderColor: '#78350F',
    backgroundColor: '#92400E',
  },
  // Stone Slate Border
  outer_stone: {
    borderColor: '#1E293B',
    backgroundColor: '#334155',
  },
  // Gold Trim Border
  outer_gold: {
    borderColor: '#B45309',
    backgroundColor: '#F59E0B',
  },
  // Dark Onyx Border
  outer_dark: {
    borderColor: '#0F172A',
    backgroundColor: '#1E293B',
  },
  glowActive: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    borderColor: '#38BDF8',
  },
  innerFrame: {
    borderRadius: 5,
    padding: 12,
  },
  inner_wood: {
    backgroundColor: '#1C1917',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#0C0A09',
    borderLeftColor: '#0C0A09',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#292524',
    borderRightColor: '#292524',
  },
  inner_stone: {
    backgroundColor: '#0F172A',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#020617',
    borderLeftColor: '#020617',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#1E293B',
    borderRightColor: '#1E293B',
  },
  inner_gold: {
    backgroundColor: '#18181B',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#78350F',
    borderLeftColor: '#78350F',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#FBBF24',
    borderRightColor: '#FBBF24',
  },
  inner_dark: {
    backgroundColor: '#0A0F1D',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#020617',
    borderLeftColor: '#020617',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: '#1E293B',
    borderRightColor: '#1E293B',
  },
  // 4 Corner Pixel Accents
  cornerSquare: {
    position: 'absolute',
    width: 6,
    height: 6,
    zIndex: 10,
  },
  cornerTL: { top: -2, left: -2 },
  cornerTR: { top: -2, right: -2 },
  cornerBL: { bottom: -2, left: -2 },
  cornerBR: { bottom: -2, right: -2 },
  corner_wood: { backgroundColor: '#FDE047' },
  corner_stone: { backgroundColor: '#94A3B8' },
  corner_gold: { backgroundColor: '#FEF08A' },
  corner_dark: { backgroundColor: '#38BDF8' },
});
