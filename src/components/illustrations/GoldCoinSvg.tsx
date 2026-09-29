import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Path,
  G,
} from 'react-native-svg';

export interface GoldCoinSvgProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const GoldCoinSvg: React.FC<GoldCoinSvgProps> = ({
  size = 24,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          {/* Metallic Edge Outer Gradient */}
          <LinearGradient id="coinEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FCD34D" />
            <Stop offset="45%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </LinearGradient>

          {/* Main Metallic Face Gradient */}
          <LinearGradient id="coinFaceGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="30%" stopColor="#FBBF24" />
            <Stop offset="70%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>

          {/* Inner Groove Gradient */}
          <LinearGradient id="innerRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#B45309" stopOpacity="0.5" />
          </LinearGradient>

          {/* Embossed Symbol Gradient */}
          <LinearGradient id="symbolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FEF9C3" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>
        </Defs>

        {/* Outer Coin Edge Rim */}
        <Circle cx="16" cy="16" r="15" fill="url(#coinEdgeGrad)" />

        {/* Coin Main Face */}
        <Circle cx="16" cy="16" r="13.5" fill="url(#coinFaceGrad)" />

        {/* Inner Stamped Rim Groove */}
        <Circle
          cx="16"
          cy="16"
          r="11"
          fill="none"
          stroke="url(#innerRimGrad)"
          strokeWidth="1.2"
        />

        {/* Embossed Philippine Peso (₱) Symbol */}
        <G fill="none" stroke="url(#symbolGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* P Stem and Loop */}
          <Path d="M 13.5 8.5 V 22.5" />
          <Path d="M 13.5 8.5 H 16.5 C 19 8.5, 20.5 9.8, 20.5 12 C 20.5 14.2, 19 15.5, 16.5 15.5 H 13.5" />
          {/* Horizontal crossbars */}
          <Path d="M 10.5 11.5 H 18.5" />
          <Path d="M 10.5 13.8 H 18.5" />
        </G>

        {/* Specular Metallic Glint (Top-Left Star Sparkle) */}
        <G>
          <Path
            d="M 8 4.5 Q 8 7 5.5 7 Q 8 7 8 9.5 Q 8 7 10.5 7 Q 8 7 8 4.5 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
          <Circle cx="8" cy="7" r="1.2" fill="#FFFFFF" />
        </G>
      </Svg>
    </View>
  );
};
