import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface PlusCoinIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const PlusCoinIcon: React.FC<PlusCoinIconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Outer coin circle */}
      <Circle cx="12" cy="12" r="10" />
      {/* Inner subtle circle for coin ridge */}
      <Circle cx="12" cy="12" r="7" strokeOpacity={0.4} strokeDasharray="2 2" />
      {/* Plus symbol inside */}
      <Path d="M12 8v8" />
      <Path d="M8 12h8" />
    </Svg>
  );
};
