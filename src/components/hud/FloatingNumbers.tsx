import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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
  // Coin drop physics
  const coinY = useRef(new Animated.Value(-100)).current;
  const coinScale = useRef(new Animated.Value(0.4)).current;
  const coinOpacity = useRef(new Animated.Value(1)).current;

  // Floating text physics
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Reset values
    coinY.setValue(-100);
    coinScale.setValue(0.4);
    coinOpacity.setValue(1);

    textTranslateY.setValue(20);
    textOpacity.setValue(0);
    textScale.setValue(0.7);

    // Sequence:
    // 1. Coin drops with spring physics & bounce
    // 2. On landing, floating text blooms & rises
    // 3. Fades out smoothly
    Animated.parallel([
      // Coin drop spring
      Animated.spring(coinY, {
        toValue: 0,
        tension: 110,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(coinScale, {
        toValue: 1,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }),
      // Delayed text reveal upon coin landing
      Animated.sequence([
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(textScale, {
            toValue: 1.25,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: -65,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Overall fade out
      Animated.sequence([
        Animated.delay(700),
        Animated.parallel([
          Animated.timing(coinOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      if (onAnimationEnd) onAnimationEnd();
    });
  }, [triggerKey]);

  return (
    <View pointerEvents="none" style={styles.overlayContainer}>
      {/* Physics Animated Coin */}
      <Animated.View
        style={[
          styles.coinBox,
          {
            transform: [{ translateY: coinY }, { scale: coinScale }],
            opacity: coinOpacity,
          },
        ]}
      >
        <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
          {/* Gold Coin Outer Ring */}
          <Circle cx="12" cy="12" r="10" fill="#EBCB72" stroke="#D4A738" strokeWidth={1.5} />
          {/* Inner milled border */}
          <Circle cx="12" cy="12" r="7.5" stroke="#FDE68A" strokeWidth={1} strokeDasharray="1.5 1.5" />
          {/* Philippine Peso ₱ Symbol */}
          <Path
            d="M10 6.5H13C14.4 6.5 15.5 7.6 15.5 9C15.5 10.4 14.4 11.5 13 11.5H10V17.5M8 8.5H15M8 11.5H15"
            stroke="#92400E"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Floating Amount Text */}
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [{ translateY: textTranslateY }, { scale: textScale }],
            opacity: textOpacity,
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
  coinBox: {
    marginBottom: 8,
    shadowColor: '#EBCB72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
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
