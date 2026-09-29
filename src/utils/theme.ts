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
}

export const darkThemeColors: ThemeColors = {
  mode: 'dark',
  isDark: true,
  background: '#0B111E',
  surfaceCard: '#121B2A',
  surfaceCardSecondary: '#111927',
  surfaceSubtle: '#0E1624',
  border: '#1E293B',
  borderSubtle: '#1A2333',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accentEmerald: '#86EFAC',
  accentEmeraldDark: '#10B981',
  headerBg: '#0B111E',
  inputBg: '#0E1624',
  inputBorder: '#1E293B',
  buttonSecondaryBg: '#1E293B',
  buttonSecondaryText: '#94A3B8',
  tagBg: 'rgba(134, 239, 172, 0.12)',
  divider: '#1E293B',
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
};

export function getThemeColors(mode: ThemeMode = 'dark'): ThemeColors {
  return mode === 'light' ? lightThemeColors : darkThemeColors;
}
