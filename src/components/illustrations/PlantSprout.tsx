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
          {/* Rounded base stem */}
          <Path
            d="M10.8 11.5 C10.8 15.5 11 19.5 11 21 C11 21.6 11.4 22 12 22 C12.6 22 13 21.6 13 21 C13 19.5 13.2 15.5 13.2 11.5 Z"
          />
          {/* Soft Rounded Left Leaf */}
          <Path
            d="M11.6 12 C7.5 12 2.8 9.5 2.2 5.5 C5.8 4.6 10.2 6.8 11.8 11.2 C11.7 11.5 11.6 11.7 11.6 12 Z"
          />
          {/* Soft Rounded Right Leaf */}
          <Path
            d="M12.4 12 C12.4 11.7 12.3 11.5 12.2 11.2 C13.8 6.8 18.2 4.6 21.8 5.5 C21.2 9.5 16.5 12 12.4 12 Z"
          />
        </G>
      </Svg>
    </View>
  );
};
