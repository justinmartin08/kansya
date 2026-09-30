import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image,
  DimensionValue,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';
import { KansyaDesign } from '../../utils/theme';
import { PROJECT_IMAGES } from '../../utils/projectImages';

// ============================================================================
// 1. KCard - Restrained, elegant container
// ============================================================================
interface KCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  onPress?: () => void;
}

export const KCard: React.FC<KCardProps> = ({ children, style, elevated = false, onPress }) => {
  const cardStyle = [
    styles.cardBase,
    elevated ? styles.cardElevated : styles.cardSurface,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// ============================================================================
// 2. KButton - Tactile, purposeful button
// ============================================================================
interface KButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const KButton: React.FC<KButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  style,
}) => {
  const btnStyle = [
    styles.buttonBase,
    size === 'sm' && styles.buttonSm,
    size === 'md' && styles.buttonMd,
    size === 'lg' && styles.buttonLg,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'gold' && styles.buttonGold,
    variant === 'ghost' && styles.buttonGhost,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.buttonTextBase,
    size === 'sm' && styles.buttonTextSm,
    size === 'md' && styles.buttonTextMd,
    size === 'lg' && styles.buttonTextLg,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'gold' && styles.buttonTextGold,
    variant === 'ghost' && styles.buttonTextGhost,
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled}
      style={btnStyle}
    >
      {icon && <View style={styles.buttonIconWrapper}>{icon}</View>}
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// 3. KProgressBar - Thin, sleek progress visualization
// ============================================================================
interface KProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const KProgressBar: React.FC<KProgressBarProps> = ({
  progress,
  color = KansyaDesign.colors.primaryGreen,
  height = 5,
  style,
}) => {
  const normalized = progress > 1 ? Math.min(100, Math.max(0, progress)) : Math.min(100, Math.max(0, progress * 100));
  const pctStr: DimensionValue = `${normalized}%`;

  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.progressFill,
          {
            width: pctStr,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

// ============================================================================
// 4. KProgressRing - Refined thin circular progress indicator
// ============================================================================
interface KProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  centerText?: string;
  centerSubtext?: string;
}

export const KProgressRing: React.FC<KProgressRingProps> = ({
  progress,
  size = 140,
  strokeWidth = 6,
  color = KansyaDesign.colors.primaryGreen,
  trackColor = '#142F26',
  centerText,
  centerSubtext,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringContent}>
        {centerText && <Text style={styles.ringText}>{centerText}</Text>}
        {centerSubtext && <Text style={styles.ringSubtext}>{centerSubtext}</Text>}
      </View>
    </View>
  );
};

// ============================================================================
// 5. KBadge - Restrained status tag
// ============================================================================
interface KBadgeProps {
  label: string;
  variant?: 'progress' | 'notStarted' | 'completed' | 'gold';
  style?: ViewStyle;
}

export const KBadge: React.FC<KBadgeProps> = ({
  label,
  variant = 'progress',
  style,
}) => {
  return (
    <View
      style={[
        styles.badgeBase,
        variant === 'progress' && styles.badgeProgress,
        variant === 'notStarted' && styles.badgeNotStarted,
        variant === 'completed' && styles.badgeCompleted,
        variant === 'gold' && styles.badgeGold,
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          variant === 'progress' && styles.badgeTextProgress,
          variant === 'notStarted' && styles.badgeTextNotStarted,
          variant === 'completed' && styles.badgeTextCompleted,
          variant === 'gold' && styles.badgeTextGold,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ============================================================================
// 6. KMascot - Piggy bank brand character
// ============================================================================
interface KMascotProps {
  variant?: 'avatar' | 'hero' | 'footer';
  size?: number;
  style?: any;
}

export const KMascot: React.FC<KMascotProps> = ({
  variant = 'avatar',
  size,
  style,
}) => {
  if (variant === 'hero') {
    return (
      <Image
        source={PROJECT_IMAGES.home_hero_piggy}
        style={[{ width: size || 140, height: size || 110, resizeMode: 'contain' }, style]}
      />
    );
  }

  if (variant === 'footer') {
    return (
      <Image
        source={PROJECT_IMAGES.wishlist_footer}
        style={[{ width: '100%', height: size || 100, resizeMode: 'cover' }, style]}
      />
    );
  }

  const dim = size || 36;
  return (
    <View style={[styles.mascotAvatarContainer, { width: dim, height: dim, borderRadius: dim / 2 }, style]}>
      <Image
        source={PROJECT_IMAGES.mascot_avatar}
        style={{ width: dim, height: dim, borderRadius: dim / 2 }}
      />
    </View>
  );
};

// ============================================================================
// 7. KEmptyState - Quietly motivating empty state
// ============================================================================
interface KEmptyStateProps {
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const KEmptyState: React.FC<KEmptyStateProps> = ({
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.emptyStateContainer, style]}>
      <KMascot variant="avatar" size={54} style={styles.emptyMascot} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {actionTitle && onAction && (
        <KButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.emptyAction}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    padding: KansyaDesign.spacing.base,
  },
  cardSurface: {
    backgroundColor: KansyaDesign.colors.surface,
    borderColor: KansyaDesign.colors.border,
  },
  cardElevated: {
    backgroundColor: KansyaDesign.colors.elevatedSurface,
    borderColor: KansyaDesign.colors.borderLight,
  },
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: KansyaDesign.radius.md,
  },
  buttonSm: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 38,
  },
  buttonMd: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 46,
  },
  buttonLg: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: KansyaDesign.colors.primaryGreen,
  },
  buttonSecondary: {
    backgroundColor: KansyaDesign.colors.elevatedSurface,
    borderWidth: 1,
    borderColor: KansyaDesign.colors.border,
  },
  buttonGold: {
    backgroundColor: KansyaDesign.colors.warmGold,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonIconWrapper: {
    marginRight: 8,
  },
  buttonTextBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonTextSm: {
    fontSize: 13,
  },
  buttonTextMd: {
    fontSize: 15,
  },
  buttonTextLg: {
    fontSize: 16,
  },
  buttonTextPrimary: {
    color: '#07130F',
  },
  buttonTextSecondary: {
    color: KansyaDesign.colors.textPrimary,
  },
  buttonTextGold: {
    color: '#07130F',
  },
  buttonTextGhost: {
    color: KansyaDesign.colors.primaryGreen,
  },
  buttonTextDisabled: {
    color: KansyaDesign.colors.textMuted,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#102820',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 26,
    fontWeight: '800',
    color: KansyaDesign.colors.textPrimary,
  },
  ringSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: KansyaDesign.colors.textSecondary,
    marginTop: 2,
  },
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: KansyaDesign.radius.sm,
    alignSelf: 'flex-start',
  },
  badgeProgress: {
    backgroundColor: 'rgba(85, 217, 154, 0.14)',
  },
  badgeNotStarted: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeCompleted: {
    backgroundColor: 'rgba(235, 203, 114, 0.16)',
  },
  badgeGold: {
    backgroundColor: 'rgba(235, 203, 114, 0.2)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  badgeTextProgress: {
    color: KansyaDesign.colors.primaryGreen,
  },
  badgeTextNotStarted: {
    color: KansyaDesign.colors.textMuted,
  },
  badgeTextCompleted: {
    color: KansyaDesign.colors.warmGold,
  },
  badgeTextGold: {
    color: KansyaDesign.colors.warmGold,
  },
  mascotAvatarContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(85, 217, 154, 0.2)',
  },
  emptyStateContainer: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMascot: {
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KansyaDesign.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: KansyaDesign.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyAction: {
    marginTop: 16,
  },
});
