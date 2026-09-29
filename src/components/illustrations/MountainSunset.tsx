import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { ThemeMode } from '../../types';

interface MountainSunsetProps {
  width?: number | string;
  height?: number;
  theme?: ThemeMode;
}

export const MountainSunset: React.FC<MountainSunsetProps> = ({
  width = '100%',
  height = 95,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <View style={[styles.container, { width: width as any, height }]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 95" preserveAspectRatio="none">
        <Defs>
          {/* Sky Gradient */}
          <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isLight ? '#BAE6FD' : '#111B2C'} />
            <Stop offset="50%" stopColor={isLight ? '#FEF08A' : '#1E2A44'} />
            <Stop offset="100%" stopColor={isLight ? '#F0FDF4' : '#0B111E'} />
          </LinearGradient>

          {/* Warm Glowing Golden Sun/Moon Orb */}
          <LinearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#FFFDF2'} />
            <Stop offset="45%" stopColor="#FEF08A" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>

          {/* Ambient Glow for Valley Orb */}
          <RadialGradient id="sunAmbientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity={isLight ? 0.6 : 0.45} />
            <Stop offset="60%" stopColor="#F59E0B" stopOpacity={isLight ? 0.2 : 0.15} />
            <Stop offset="100%" stopColor={isLight ? '#BAE6FD' : '#1E2A44'} stopOpacity={isLight ? 0.05 : 0} />
          </RadialGradient>

          {/* Mountain Gradient Back */}
          <LinearGradient id="mountBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isLight ? '#34D399' : '#253552'} />
            <Stop offset="100%" stopColor={isLight ? '#059669' : '#141E30'} />
          </LinearGradient>

          {/* Mountain Gradient Mid */}
          <LinearGradient id="mountMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isLight ? '#10B981' : '#172338'} />
            <Stop offset="100%" stopColor={isLight ? '#047857' : '#0F172A'} />
          </LinearGradient>

          {/* Mountain Gradient Fore */}
          <LinearGradient id="mountFore" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isLight ? '#059669' : '#0F172A'} />
            <Stop offset="100%" stopColor={isLight ? '#064E3B' : '#0B111E'} />
          </LinearGradient>
        </Defs>

        {/* Sky Background */}
        <Path d="M 0 0 L 390 0 L 390 95 L 0 95 Z" fill="url(#skyGrad)" />

        {/* Ambient Glow Nestled in Valley */}
        <Circle cx="320" cy="40" r="44" fill="url(#sunAmbientGlow)" />

        {/* Sun / Moon Orb Setting in Upper Right Valley */}
        <Circle cx="320" cy="40" r="26" fill="url(#sunGrad)" opacity="0.95" />

        {/* Back Mountain Range */}
        <Path
          d="M 120 95 L 180 55 L 250 72 L 310 32 L 370 65 L 410 95 Z"
          fill="url(#mountBack)"
          opacity={isLight ? 0.9 : 0.85}
        />

        {/* Mid Mountain Range */}
        <Path
          d="M 140 95 L 210 62 L 280 44 L 350 70 L 400 50 L 410 95 Z"
          fill="url(#mountMid)"
          opacity="0.95"
        />

        {/* Foreground Mountain Ridge */}
        <Path
          d="M 0 95 L 160 95 L 240 76 L 315 58 L 380 75 L 390 95 Z"
          fill="url(#mountFore)"
        />
      </Svg>
    </View>
  );
};

export { MountainSunset as MountainGreeting };

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
