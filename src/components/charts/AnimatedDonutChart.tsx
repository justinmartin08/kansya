import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedDonutChartProps {
  currentAmount: number;
  targetPrice: number;
  size?: number;
  strokeWidth?: number;
  showSubtitle?: boolean;
}

export const AnimatedDonutChart: React.FC<AnimatedDonutChartProps> = ({
  currentAmount,
  targetPrice,
  size = 180,
  strokeWidth = 14,
  showSubtitle = true,
}) => {
  const percent = targetPrice > 0 ? Math.min(100, Math.max(0, (currentAmount / targetPrice) * 100)) : 0;
  const isCompleted = percent >= 100;
  const remaining = Math.max(0, targetPrice - currentAmount);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated strokeDashoffset
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: percent / 100,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  // Dashoffset: 0 progress => circumference, 100% progress => 0
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Dynamic font sizing based on size prop to prevent collisions with stroke
  const percentFontSize = Math.round(size * 0.20);
  const labelFontSize = Math.max(8, Math.round(size * 0.09));
  const subtextFontSize = Math.max(7, Math.round(size * 0.07));
  const letterSpacing = size < 100 ? 0.3 : 1.2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#86EFAC" />
            <Stop offset="100%" stopColor="#6EE7B7" />
          </LinearGradient>
          <LinearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#86EFAC" />
          </LinearGradient>
        </Defs>

        {/* Outer subtle glow circle behind the stroke */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(134, 239, 172, 0.08)"
          strokeWidth={strokeWidth + 6}
          fill="none"
        />

        {/* Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${isCompleted ? 'completedGradient' : 'donutGradient'})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          // Start from top (12 o'clock)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContainer}>
        <Text
          style={[
            styles.percentText,
            { fontSize: percentFontSize, letterSpacing: size < 100 ? -0.3 : -0.5 },
            isCompleted && styles.completedPercentText,
          ]}
        >
          {Math.round(percent)}%
        </Text>
        <Text style={[styles.savedLabel, { fontSize: labelFontSize, letterSpacing }]}>
          {isCompleted ? 'ACQUIRED' : 'SAVED'}
        </Text>
        {showSubtitle && (
          <Text style={[styles.subtext, { fontSize: subtextFontSize }]}>
            {isCompleted ? 'Goal fulfilled!' : `₱${remaining.toLocaleString()} left`}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: -0.5,
  },
  completedPercentText: {
    color: '#FFB800',
  },
  savedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
});
