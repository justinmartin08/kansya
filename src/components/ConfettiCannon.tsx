import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#FBBF24',
];

interface Particle {
  x: number;
  y: Animated.Value;
  xAnim: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
  isCircle: boolean;
}

export const ConfettiCannon: React.FC = () => {
  const particles = useRef<Particle[]>(
    Array.from({ length: 45 }).map(() => ({
      x: Math.random() * SCREEN_WIDTH,
      y: new Animated.Value(-20),
      xAnim: new Animated.Value(0),
      rotate: new Animated.Value(0),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 6,
      isCircle: Math.random() > 0.5,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const delay = Math.random() * 600;
      const duration = 2200 + Math.random() * 1000;
      const drift = (Math.random() - 0.5) * 120;

      Animated.parallel([
        Animated.timing(p.y, {
          toValue: SCREEN_HEIGHT + 40,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.xAnim, {
          toValue: drift,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 360 * (Math.random() > 0.5 ? 2 : -2),
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View pointerEvents="none" style={styles.container}>
      {particles.map((p, idx) => {
        const spin = p.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.isCircle ? p.size : p.size * 1.5,
                borderRadius: p.isCircle ? p.size / 2 : 2,
                backgroundColor: p.color,
                transform: [
                  { translateY: p.y },
                  { translateX: p.xAnim },
                  { rotate: spin },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
