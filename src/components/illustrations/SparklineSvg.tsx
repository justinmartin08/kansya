import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

export interface SparklineSvgProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  data?: number[];
  style?: StyleProp<ViewStyle>;
}

export const SparklineSvg: React.FC<SparklineSvgProps> = ({
  width = 115,
  height = 46,
  strokeColor = '#86EFAC',
  gradientStart = '#86EFAC',
  gradientEnd = '#34D399',
  data = [150, 250, 450, 400, 700, 850, 1200, 1100, 1550, 2100, 3450],
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  if (data.length < 2) return null;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const paddingY = 6;
  const paddingX = 4;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * plotWidth;
    const y = height - paddingY - ((val - minVal) / range) * plotHeight;
    return { x, y };
  });

  // Build smooth Bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    pathD += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Gradient area fill path
  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gradientStart} stopOpacity="0.38" />
            <Stop offset="75%" stopColor={gradientEnd} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={gradientEnd} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Gradient Fill Underneath Curve */}
        <Path d={areaD} fill="url(#sparklineGradient)" />

        {/* Mint Green Sparkline Line */}
        <Path
          d={pathD}
          stroke={strokeColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Outer ambient glow node */}
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={7}
          fill={strokeColor}
          fillOpacity={0.2}
        />

        {/* Pulsing mid halo node */}
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={4.5}
          fill={strokeColor}
          fillOpacity={0.45}
        />

        {/* Crisp solid center node */}
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill="#FFFFFF"
        />
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={1.5}
          fill={strokeColor}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
