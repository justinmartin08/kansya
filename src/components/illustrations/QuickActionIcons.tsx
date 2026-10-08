import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const TargetCoinIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="6" strokeOpacity={0.6} strokeDasharray="2 3" />
    <Circle cx="12" cy="12" r="2" fill={color} strokeWidth={0} />
  </Svg>
);

export const WishlistCoinIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="7" strokeOpacity={0.4} strokeDasharray="2 2" />
    <Path d="M9 7v9l3-2 3 2V7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z" />
  </Svg>
);

export const HistoryCoinIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="7" strokeOpacity={0.4} strokeDasharray="2 2" />
    <Path d="M12 7v5l3 3" />
  </Svg>
);
