import { ThemeMode } from '../types';

export interface ThemeColors {
  mode: ThemeMode;
  isDark: boolean;
  background: string;
  surfaceCard: string;
  surfaceCardSecondary: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentEmerald: string;
  accentEmeraldDark: string;
  headerBg: string;
  inputBg: string;
  inputBorder: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  tagBg: string;
  divider: string;

  // Kansya Forest Green & Gold System
  kansyaBg: string;
  surface: string;
  surfaceAlt: string;
  elevatedSurface: string;
  primaryGreen: string;
  mint: string;
  softSage: string;
  warmGold: string;
  accentLime: string;
}

export const darkThemeColors: ThemeColors = {
  mode: 'dark',
  isDark: true,
  background: '#07130F',
  surfaceCard: '#0D211B',
  surfaceCardSecondary: '#102820',
  surfaceSubtle: '#07130F',
  border: '#142F26',
  borderSubtle: '#102820',
  textPrimary: '#F4F7F3',
  textSecondary: '#9AAFA5',
  textMuted: '#667A71',
  accentEmerald: '#55D99A',
  accentEmeraldDark: '#10B981',
  headerBg: '#07130F',
  inputBg: '#0D211B',
  inputBorder: '#142F26',
  buttonSecondaryBg: '#142F26',
  buttonSecondaryText: '#9AAFA5',
  tagBg: 'rgba(85, 217, 154, 0.12)',
  divider: '#142F26',

  // Kansya design system tokens
  kansyaBg: '#07130F',
  surface: '#0D211B',
  surfaceAlt: '#102820',
  elevatedSurface: '#142F26',
  primaryGreen: '#55D99A',
  mint: '#A7F3C5',
  softSage: '#9FC7A9',
  warmGold: '#EBCB72',
  accentLime: '#84CC16',
};

export const lightThemeColors: ThemeColors = {
  mode: 'light',
  isDark: false,
  background: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  surfaceCardSecondary: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',
  border: '#E2E8F0',
  borderSubtle: '#CBD5E1',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  accentEmerald: '#059669',
  accentEmeraldDark: '#10B981',
  headerBg: '#F8FAFC',
  inputBg: '#F1F5F9',
  inputBorder: '#CBD5E1',
  buttonSecondaryBg: '#E2E8F0',
  buttonSecondaryText: '#334155',
  tagBg: 'rgba(5, 150, 105, 0.1)',
  divider: '#E2E8F0',

  // Kansya design system tokens
  kansyaBg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  elevatedSurface: '#FFFFFF',
  primaryGreen: '#059669',
  mint: '#A7F3C5',
  softSage: '#9FC7A9',
  warmGold: '#D97706',
  accentLime: '#65A30D',
};

export const KansyaDesign = {
  colors: {
    background: '#07130F',
    surface: '#0D211B',
    surfaceAlt: '#102820',
    elevatedSurface: '#142F26',
    primaryGreen: '#55D99A',
    mint: '#A7F3C5',
    softSage: '#9FC7A9',
    warmGold: '#EBCB72',
    accentLime: '#84CC16',
    textPrimary: '#F4F7F3',
    textSecondary: '#9AAFA5',
    textMuted: '#667A71',
    border: '#142F26',
    borderLight: '#1B3B30',
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
    h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
    h2: { fontSize: 18, fontWeight: '700' as const },
    h3: { fontSize: 15, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    bodyMedium: { fontSize: 14, fontWeight: '600' as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
    micro: { fontSize: 10, fontWeight: '600' as const },
  },
  shadows: {
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export function getThemeColors(mode: ThemeMode = 'dark'): ThemeColors {
  return mode === 'light' ? lightThemeColors : darkThemeColors;
}

