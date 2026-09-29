import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  ShieldCheck,
  CircleDollarSign,
  Sparkles,
  Zap,
  Crown,
  User,
} from 'lucide-react-native';
import { PlantSprout } from '../components/illustrations/PlantSprout';
import {
  AvatarIconKey,
  AvatarOption,
  AVATAR_OPTIONS,
  getAvatarById,
} from './avatarData';

export type { AvatarIconKey, AvatarOption };
export { AVATAR_OPTIONS, getAvatarById };

interface AvatarBadgeProps {
  avatarId?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatarId,
  size = 36,
  style,
  showBorder = true,
}) => {
  const avatar = getAvatarById(avatarId);
  const iconSize = Math.round(size * 0.55);

  const renderIcon = () => {
    switch (avatar.iconKey) {
      case 'sprout':
        return <PlantSprout size={iconSize} color={avatar.color} />;
      case 'vault':
        return <ShieldCheck size={iconSize} color={avatar.color} strokeWidth={2.4} />;
      case 'coin':
        return <CircleDollarSign size={iconSize} color={avatar.color} strokeWidth={2.4} />;
      case 'star':
        return <Sparkles size={iconSize} color={avatar.color} strokeWidth={2.4} />;
      case 'flame':
        return <Zap size={iconSize} color={avatar.color} strokeWidth={2.4} />;
      case 'crown':
        return <Crown size={iconSize} color={avatar.color} strokeWidth={2.4} />;
      default:
        return <User size={iconSize} color="#86EFAC" strokeWidth={2.4} />;
    }
  };

  return (
    <View
      style={[
        styles.avatarCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatar.bgColor,
          borderColor: showBorder ? avatar.borderColor : 'transparent',
          borderWidth: showBorder ? 1.5 : 0,
        },
        style,
      ]}
    >
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
