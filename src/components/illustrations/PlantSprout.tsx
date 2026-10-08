import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

export interface PlantSproutProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const PlantSprout: React.FC<PlantSproutProps> = ({
  size = 24,
  color = '#86EFAC',
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <G fill={color}>
          {/* Gentle curved stem rising from base */}
          <Path
            d="M12 22C12 18 11.5 14 13.5 10.5C13.8 10 14.2 10.2 14.1 10.7C12.8 14.2 13.2 18 13.2 22C13.2 22.5 12 22.5 12 22Z"
          />
          {/* Main Left Seedling Leaf - rounded, plump organic shape */}
          <Path
            d="M12.5 11C11.5 7 7.5 4.5 3.5 5.5C3 8.5 5.5 12.5 9.5 13C10.8 13.2 12.2 12.5 12.5 11Z"
          />
          {/* Secondary Right Sprout Leaf - soft curved accent */}
          <Path
            d="M13.2 9C15.5 6.5 19 6 21 7.2C21.2 10 19 12.8 15.8 12.8C14.5 12.8 13.5 11.8 13.2 9Z"
          />
          {/* Little soil mound / root base dot */}
          <Path
            d="M10 22C10 21.2 11 20.8 12.6 20.8C14.2 20.8 15.2 21.2 15.2 22C15.2 22.8 14.2 23.2 12.6 23.2C11 23.2 10 22.8 10 22Z"
          />
        </G>
      </Svg>
    </View>
  );
};
