import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

export const CustomHomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15C14.4 21 14 20.6 14 20V15H10V20C10 20.6 9.6 21 9 21H4C3.4 21 3 20.6 3 20V10.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const CustomGoalIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer target ring */}
    <Circle
      cx="12"
      cy="12"
      r="9.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Inner ring */}
    <Circle
      cx="12"
      cy="12"
      r="5.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Bullseye center coin / dot */}
    <Circle
      cx="12"
      cy="12"
      r="2"
      fill={color}
    />
  </Svg>
);

export const CustomWishlistIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Elegant bookmark ribbon */}
    <Path
      d="M5 4.5C5 3.7 5.7 3 6.5 3H17.5C18.3 3 19 3.7 19 4.5V21L12 17.5L5 21V4.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
    {/* Subtle heart/star badge in bookmark */}
    <Path
      d="M12 7.5V11.5M10 9.5H14"
      stroke={filled ? '#07130F' : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const CustomMoreIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Modern settings / controls sliders */}
    <Path
      d="M4 6H20M4 12H20M4 18H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Circle cx="8" cy="6" r="2.2" fill={color} />
    <Circle cx="16" cy="12" r="2.2" fill={color} />
    <Circle cx="10" cy="18" r="2.2" fill={color} />
  </Svg>
);
