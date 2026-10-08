import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';
import { useKansya } from '../../store/KansyaContext';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ProgressiveAlkansyaProps {
  currentAmount: number;
  targetPrice: number;
  size?: number;
  isDark?: boolean;
}

export const ProgressiveAlkansya: React.FC<ProgressiveAlkansyaProps> = ({
  currentAmount,
  targetPrice,
  size = 50,
  isDark: isDarkProp,
}) => {
  let contextIsDark = true;
  try {
    const kansya = useKansya();
    contextIsDark = kansya.isDark;
  } catch (_) {
    // Outside Kansya context
  }

  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rawPercent = targetPrice > 0 ? currentAmount / targetPrice : 0;
    const clampedPercent = Math.min(Math.max(rawPercent, 0), 1);

    Animated.spring(progressAnim, {
      toValue: clampedPercent,
      tension: 60,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [currentAmount, targetPrice]);

  // Alkansya SVG path inside a 100x100 viewBox
  const alkansyaPath = "M80,55 C80,75 65,85 45,85 C25,85 15,75 15,55 C15,35 30,25 50,25 C70,25 80,35 80,55 Z";

  const fillY = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0], // Inverts so 0% = y is 100 (bottom), 100% = y is 0 (top)
  });

  // Dynamic Theme Colors
  const bodyFill = isDark ? '#14382B' : '#E8F7EE';
  const bodyStroke = isDark ? '#2D6B50' : '#15803D';
  const liquidFill = isDark ? '#55D99A' : '#10B981';
  const eyeColor = isDark ? '#55D99A' : '#15803D';
  const slotColor = isDark ? '#07130F' : '#14532D';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="piggyMask">
            <Path d={alkansyaPath} />
          </ClipPath>
        </Defs>

        {/* Legs */}
        <Path d="M30,80 L25,95 L35,95 L35,85" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />
        <Path d="M65,80 L60,95 L70,95 L70,85" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />

        {/* Snout */}
        <Path d="M80,45 C88,45 92,50 92,55 C92,60 88,65 80,65" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />
        <Path d="M85,50 C86,52 86,58 85,60" stroke={bodyStroke} strokeWidth="2" strokeLinecap="round" />

        {/* Ears */}
        <Path d="M40,26 L35,12 L48,25" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />
        <Path d="M25,32 L15,20 L30,30" fill={bodyFill} stroke={bodyStroke} strokeWidth="2.5" />

        {/* Outer body bg */}
        <Path d={alkansyaPath} fill={bodyFill} stroke={bodyStroke} strokeWidth="3.5" />

        {/* Dynamic Liquid Fill (emerald/mint) */}
        <G clipPath="url(#piggyMask)">
          <AnimatedRect
            x="0"
            y={fillY as any}
            width="100"
            height="100"
            fill={liquidFill}
            opacity="0.88"
          />
        </G>

        {/* Coin slot */}
        <Path d="M43,26 L57,23" stroke={slotColor} strokeWidth="3" strokeLinecap="round" />

        {/* Eye */}
        <Path d="M70,40 A 2 2 0 1 1 69.9 40" stroke={eyeColor} strokeWidth="3.2" strokeLinecap="round" />

        {/* Shine / 3D highlight */}
        <Path
          d="M30,35 C40,30 50,30 60,35"
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
