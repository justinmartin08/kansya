import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { triggerLightHaptic } from '../../utils/haptics';

interface TactilePressableProps {
  children: React.ReactNode;
  onPress?: (event?: GestureResponderEvent) => void;
  onPressIn?: (event?: GestureResponderEvent) => void;
  onPressOut?: (event?: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: any;
}

export const TactilePressable: React.FC<TactilePressableProps> = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  style,
  activeScale = 0.97,
  haptic = false,
  accessibilityLabel,
  accessibilityRole,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      damping: 15,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start();

    if (haptic) {
      triggerLightHaptic();
    }

    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 200,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={{ overflow: 'visible' }}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
