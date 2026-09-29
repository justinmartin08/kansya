import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { formatPHP } from '../../utils/calculations';

interface FloatingNumbersProps {
  amount: number;
  triggerKey: number;
  onAnimationEnd?: () => void;
}

export const FloatingNumbers: React.FC<FloatingNumbersProps> = ({
  amount,
  triggerKey,
  onAnimationEnd,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Reset values
    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(0.7);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.25,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -75,
        duration: 950,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onAnimationEnd) onAnimationEnd();
    });
  }, [triggerKey]);

  return (
    <View pointerEvents="none" style={styles.overlayContainer}>
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <Text style={styles.shadowText}>+{formatPHP(amount)}!</Text>
        <Text style={styles.floatingText}>+{formatPHP(amount)}!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  bubble: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowText: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '900',
    color: '#064E3B',
    transform: [{ translateY: 2 }, { translateX: 2 }],
  },
  floatingText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4ADE80',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
});
