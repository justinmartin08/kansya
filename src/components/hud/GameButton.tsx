import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { triggerLightHaptic } from '../../utils/haptics';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'emerald' | 'amber' | 'ruby' | 'slate' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GameButton: React.FC<GameButtonProps> = ({
  title,
  onPress,
  variant = 'emerald',
  size = 'md',
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    triggerLightHaptic();
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const colors = {
    emerald: {
      bg: '#16A34A',
      shadow: '#14532D',
      highlight: '#4ADE80',
      text: '#FFFFFF',
    },
    amber: {
      bg: '#D97706',
      shadow: '#78350F',
      highlight: '#FBBF24',
      text: '#FFFFFF',
    },
    ruby: {
      bg: '#DC2626',
      shadow: '#7F1D1D',
      highlight: '#F87171',
      text: '#FFFFFF',
    },
    slate: {
      bg: '#475569',
      shadow: '#0F172A',
      highlight: '#94A3B8',
      text: '#F8FAFC',
    },
    gold: {
      bg: '#EAB308',
      shadow: '#854D0E',
      highlight: '#FEF08A',
      text: '#713F12',
    },
  }[variant];

  const sizeStyles = {
    sm: { paddingVertical: 6, paddingHorizontal: 10, fontSize: 13, bevelHeight: 3 },
    md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 15, bevelHeight: 4 },
    lg: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 17, bevelHeight: 5 },
  }[size];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.baseButton,
        {
          backgroundColor: disabled ? '#334155' : colors.bg,
          borderBottomColor: disabled ? '#1E293B' : colors.shadow,
          borderTopColor: disabled ? '#475569' : colors.highlight,
          borderLeftColor: disabled ? '#475569' : colors.highlight,
          borderRightColor: disabled ? '#1E293B' : colors.shadow,
          borderBottomWidth: isPressed ? 1 : sizeStyles.bevelHeight,
          marginTop: isPressed ? sizeStyles.bevelHeight - 1 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.buttonText,
            {
              color: disabled ? '#94A3B8' : colors.text,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
  buttonText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
