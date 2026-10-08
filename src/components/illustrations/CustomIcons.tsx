import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export interface IconProps {
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
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.2 : 0}
    />
    {/* Inner ring */}
    <Circle
      cx="12"
      cy="12"
      r="5.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.35 : 0}
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

export const CustomSunIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#EBCB72',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="4.5"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={filled ? color : 'none'}
    />
    <Path
      d="M12 2.5V4.5M12 19.5V21.5M2.5 12H4.5M19.5 12H21.5M5.3 5.3L6.8 6.8M17.2 17.2L18.7 18.7M5.3 18.7L6.8 17.2M17.2 6.8L18.7 5.3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const CustomMoonIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#55D99A',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.8A9 9 0 1 1 11.2 3A7 7 0 0 0 21 12.8Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const CustomTrophyIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Cup bowl */}
    <Path
      d="M6 4H18V10C18 13.3 15.3 16 12 16C8.7 16 6 13.3 6 10V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
    {/* Left handle */}
    <Path
      d="M6 6H3.5C2.7 6 2 6.7 2 7.5C2 9.5 3.5 11 5.5 11H6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right handle */}
    <Path
      d="M18 6H20.5C21.3 6 22 6.7 22 7.5C22 9.5 20.5 11 18.5 11H18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Stem & base */}
    <Path
      d="M12 16V19M8 21H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Coin emblem inside cup */}
    <Circle cx="12" cy="9" r="1.8" fill={color} />
  </Svg>
);

export const CustomProfileIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill={filled ? color : 'none'}
    />
    <Path
      d="M4 20C4 16.5 7.5 14.5 12 14.5C16.5 14.5 20 16.5 20 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CustomSettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7H14M18 7H20M4 17H6M10 17H20M4 12H10M14 12H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Circle cx="16" cy="7" r="2" stroke={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />
    <Circle cx="8" cy="17" r="2" stroke={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />
  </Svg>
);

export const CustomSparkleIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#55D99A',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Handcrafted Kansya curved coin gleam */}
    <Path
      d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
  </Svg>
);

export const CustomZapIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L4 13.5H11.5L10 22L19.5 10H12.5L13 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const CustomVolumeIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 8.5C16.5 9.5 17 10.7 17 12C17 13.3 16.5 14.5 15.5 15.5M19 5.5C20.8 7.3 22 9.5 22 12C22 14.5 20.8 16.7 19 18.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const CustomMusicIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18V5L20 3V16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="17" cy="16" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const CustomCheckIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M8 12.5L10.5 15L16 9.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CustomCoinIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="6.5" stroke={color} strokeWidth={strokeWidth * 0.75} strokeDasharray="2 2" />
    <Path d="M12 8V16M9 10H15M9 14H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const CustomShieldIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={filled ? '#07130F' : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CustomCloudIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 10H17.2C16.8 6.6 13.9 4 10.5 4C6.9 4 4 6.9 4 10.5C4 10.9 4 11.2 4.1 11.5C2.3 12.3 1 14.2 1 16.5C1 19.5 3.5 22 6.5 22H18C20.8 22 23 19.8 23 17C23 14.3 20.8 12.1 18 12V10Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const CustomLogOutIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17L21 12L16 7M21 12H9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Lucide-compatible aliases so screens can seamlessly adopt handcrafted icons
export const Sun = CustomSunIcon;
export const Moon = CustomMoonIcon;
export const Trophy = CustomTrophyIcon;
export const User = CustomProfileIcon;
export const Settings = CustomSettingsIcon;
export const Sparkles = CustomSparkleIcon;
export const Zap = CustomZapIcon;
export const Volume2 = CustomVolumeIcon;
export const Music = CustomMusicIcon;
export const CheckCircle2 = CustomCheckIcon;
export const ShieldCheck = CustomShieldIcon;
export const Cloud = CustomCloudIcon;
export const LogOut = CustomLogOutIcon;
