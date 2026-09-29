import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  AtSign,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Database,
  HardDrive,
} from 'lucide-react-native';
import { PlantSprout } from '../components/illustrations/PlantSprout';
import { useKansya } from '../store/KansyaContext';
import { TactilePressable } from '../components/ui/TactilePressable';
import { getThemeColors } from '../utils/theme';

export const AuthScreen: React.FC = () => {
  const { registerUser, loginUser, theme, isDark, toggleTheme } = useKansya();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (isSubmitting) return;

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      const cleanUser = username.trim().replace(/^@+/, '');
      if (!cleanUser || cleanUser.length < 3) {
        setErrorMsg('Username must be at least 3 characters');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Password must be at least 4 characters');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await registerUser(fullName, cleanUser, email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to register account');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const cleanIdentifier = username.trim().replace(/^@+/, '');
      if (!cleanIdentifier) {
        setErrorMsg('Please enter your username or email');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await loginUser(cleanIdentifier, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to sign in');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, statusBarHeight, 16) + 12 },
          ]}
        >
          {/* Top Row: Theme Toggle */}
          <View style={styles.topBarRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={[
                styles.themeBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun size={16} color="#FBBF24" />
              ) : (
                <Moon size={16} color="#6366F1" />
              )}
            </TouchableOpacity>
          </View>

          {/* Brand Header */}
          <View style={styles.brandHero}>
            <View
              style={[
                styles.logoBadge,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
            >
              <PlantSprout size={36} color="#86EFAC" />
            </View>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>KANSYA</Text>
              <Text style={[styles.brandSparkle, { color: colors.accentEmerald }]}>✦</Text>
            </View>
            <Text style={styles.brandTagline}>DISCIPLINED SAVINGS & COLLAB SQUAD</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              {mode === 'register'
                ? 'Create your account to start saving and collaborate with friends.'
                : 'Welcome back! Sign in to continue your savings goals.'}
            </Text>
          </View>

          {/* Segmented Auth Mode Switcher */}
          <View
            style={[
              styles.modeSwitcherContainer,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'register' && [
                  styles.modeTabActive,
                  { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                ],
              ]}
              onPress={() => {
                setMode('register');
                setErrorMsg('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'register' && styles.modeTabTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                mode === 'login' && [
                  styles.modeTabActive,
                  { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                ],
              ]}
              onPress={() => {
                setMode('login');
                setErrorMsg('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'login' && styles.modeTabTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auth Card Form */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {mode === 'register' && (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <User size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="e.g. Justin"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {mode === 'register' ? 'Username (@handle)' : 'Username or Email'}
            </Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <AtSign size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder={mode === 'register' ? 'e.g. justin' : 'e.g. justin or justin@kansya.app'}
                placeholderTextColor="#64748B"
                value={username}
                onChangeText={(v) => setUsername(v.replace(/^@+/, '').replace(/\s+/g, ''))}
                autoCapitalize="none"
              />
            </View>

            {mode === 'register' && (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="e.g. justin@kansya.app"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.offlineNoticeRow}>
                  <HardDrive size={12} color="#10B981" />
                  <Text style={styles.offlineNoticeText}>
                    100% Offline Vault · No online verification email sent · Stored safely on this device
                  </Text>
                </View>
              </>
            )}

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Secure password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeToggleBtn}
                activeOpacity={0.7}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#86EFAC" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TactilePressable
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeScale={0.98}
              haptic
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting
                  ? 'Processing...'
                  : mode === 'register'
                  ? 'Create Kansya Account'
                  : 'Sign In to Kansya'}
              </Text>
              <ArrowRight size={18} color="#0B111E" strokeWidth={2.5} />
            </TactilePressable>
          </View>

          {/* Security & Offline Local Database Badge */}
          <View style={styles.securityRow}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={[styles.securityText, { color: colors.textMuted }]}>
              100% Offline Local Database · Zero Server Dependencies
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#121B2A',
    borderWidth: 1.5,
    borderColor: '#22324B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 6,
  },
  brandSparkle: {
    fontSize: 16,
    color: '#86EFAC',
    marginLeft: 4,
    top: -6,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 2,
    marginTop: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#121B2A',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#1E293B',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#10B981',
  },
  formCard: {
    backgroundColor: '#121B2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    gap: 6,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1624',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeToggleBtn: {
    padding: 8,
    marginRight: -6,
  },
  offlineNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  offlineNoticeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 50,
    marginTop: 16,
    gap: 8,
  },
  submitBtnText: {
    color: '#0B111E',
    fontSize: 15,
    fontWeight: '800',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
