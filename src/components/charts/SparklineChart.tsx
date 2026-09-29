import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface SparklineChartProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [150, 250, 450, 400, 700, 850, 1200, 1100, 1550, 2100, 3450],
  width = 110,
  height = 42,
  color = '#00F5A0',
}) => {
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

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
    <Animated.View style={[styles.container, { width, height, opacity: animatedOpacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Shaded Area Below Line */}
        <Path d={areaD} fill="url(#sparkGradient)" />

        {/* Smooth Bezier Line */}
        <Path
          d={pathD}
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Glow outer dot on latest point */}
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={5}
          fill={color}
          fillOpacity={0.25}
        />
        {/* Crisp solid dot on latest point */}
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
