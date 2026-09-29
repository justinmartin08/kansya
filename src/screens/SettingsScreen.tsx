import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Sliders,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  Mail,
  AtSign,
  ShieldCheck,
  Sun,
  Moon,
  Edit3,
  Cloud,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { AllowanceModal } from '../components/modals/AllowanceModal';
import { TrophyRoomModal } from '../components/modals/TrophyRoomModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { SupabaseConfigModal } from '../components/modals/SupabaseConfigModal';
import { TactilePressable } from '../components/ui/TactilePressable';
import { AvatarBadge } from '../utils/avatars';
import { getThemeColors } from '../utils/theme';
import { formatPHP } from '../utils/calculations';
import { confirmAction } from '../utils/dialog';
import { PlantSprout } from '../components/illustrations/PlantSprout';

export const SettingsScreen: React.FC = () => {
  const {
    allowance,
    updateAllowance,
    trophies,
    currentUser,
    signOutUser,
    theme,
    isDark,
    toggleTheme,
    isCloudSyncActive,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const [allowanceModalVisible, setAllowanceModalVisible] = useState(false);
  const [trophyModalVisible, setTrophyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [supabaseModalVisible, setSupabaseModalVisible] = useState(false);

  const unlockedCount = trophies.filter((t) => !!t.unlockedAt).length;

  const handleSignOut = () => {
    confirmAction(
      'Sign Out of Kansya?',
      'You can sign back in anytime with your credentials.',
      async () => {
        await signOutUser();
      }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>APP PREFERENCES</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Engine Settings</Text>
        </View>

        {/* Section: User Profile & Account */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>USER PROFILE & ACCOUNT</Text>
        <TactilePressable
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setProfileModalVisible(true)}
          activeScale={0.98}
          haptic
        >
          <View style={styles.profileAvatar}>
            {currentUser?.avatarId ? (
              <AvatarBadge avatarId={currentUser.avatarId} size={48} showBorder={true} />
            ) : (
              <User size={22} color={colors.accentEmerald} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>
              {currentUser?.fullName || 'Kansya Saver'}
            </Text>
            <Text style={[styles.profileHandle, { color: colors.accentEmerald }]}>
              @{currentUser?.username || 'saver'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {currentUser?.email || 'saver@kansya.app'}
            </Text>
          </View>
          <View style={styles.profileEditAction}>
            <Edit3 size={16} color={colors.accentEmerald} />
          </View>
        </TactilePressable>

        {/* Section: Appearance & Theme */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE & THEME</Text>
        <TactilePressable
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={toggleTheme}
          activeScale={0.97}
          haptic
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(251, 191, 36, 0.15)'
                    : 'rgba(99, 102, 241, 0.15)',
                },
              ]}
            >
              {isDark ? (
                <Sun size={18} color="#FBBF24" />
              ) : (
                <Moon size={18} color="#6366F1" />
              )}
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {isDark ? 'Dark Mode (Obsidian Navy)' : 'Light Mode (Crisp Porcelain)'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Tap to switch to bright Light theme' : 'Tap to switch to dark Obsidian theme'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TactilePressable>

        {/* Section: Allowance Profile */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>FINANCIAL DISCIPLINE</Text>
        <TactilePressable
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setAllowanceModalVisible(true)}
          activeScale={0.97}
          haptic
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(134, 239, 172, 0.12)' : 'rgba(5, 150, 105, 0.12)' }]}>
              <Sliders size={18} color={colors.accentEmerald} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Baon & Allowance Engine</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {formatPHP(allowance.dailyBaon)}/day baon · {formatPHP(allowance.dailyExpenses)} expenses · {allowance.allowanceDaysPerWeek || 5} days/wk
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TactilePressable>

        {/* Section: Hall of Achievements */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACHIEVEMENTS & GLORY</Text>
        <TactilePressable
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setTrophyModalVisible(true)}
          activeScale={0.97}
          haptic
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 184, 0, 0.15)' }]}>
              <Sparkles size={18} color="#FFB800" />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Trophy Room & Badges</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {unlockedCount} of {trophies.length} badges unlocked
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TactilePressable>

        {/* Section: Hybrid Cloud & Collaboration */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>HYBRID CLOUD & COLLABORATION</Text>
        <TactilePressable
          style={[
            styles.settingCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSupabaseModalVisible(true)}
          activeScale={0.97}
          haptic
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: isCloudSyncActive ? 'rgba(56, 189, 248, 0.15)' : (isDark ? '#162234' : '#F1F5F9') }]}>
              <Cloud size={18} color={isCloudSyncActive ? '#38BDF8' : colors.textMuted} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Supabase Squad Sync (Option 3)</Text>
              <Text style={[styles.settingSubtitle, { color: isCloudSyncActive ? '#38BDF8' : colors.textSecondary }]}>
                {isCloudSyncActive ? 'Live Cloud Sync Active' : 'Offline Local Mode (Tap to configure)'}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TactilePressable>

        {/* Section: Account Actions */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACCOUNT ACTIONS</Text>
        <TactilePressable
          style={[
            styles.settingCard,
            styles.signOutCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
          onPress={handleSignOut}
          activeScale={0.97}
          haptic
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <LogOut size={18} color="#EF4444" />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: '#F87171' }]}>Sign Out</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Log out of your current session on this device
              </Text>
            </View>
          </View>
        </TactilePressable>

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <View style={styles.versionTitleRow}>
            <PlantSprout size={14} color={colors.accentEmerald} />
            <Text style={[styles.versionTitle, { color: colors.textPrimary }]}>KANSYA+ SAVINGS ENGINE</Text>
          </View>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 2.0.0 ({isDark ? 'Obsidian Navy Engine' : 'Crisp Porcelain Engine'})
          </Text>
          <Text style={[styles.versionSubtext, { color: colors.textMuted }]}>
            100% Offline · Local Storage · Zero Trackers
          </Text>
        </View>
      </ScrollView>

      <AllowanceModal
        visible={allowanceModalVisible}
        allowance={allowance}
        onClose={() => setAllowanceModalVisible(false)}
        onSave={updateAllowance}
      />

      <TrophyRoomModal
        visible={trophyModalVisible}
        onClose={() => setTrophyModalVisible(false)}
      />

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      <SupabaseConfigModal
        visible={supabaseModalVisible}
        onClose={() => setSupabaseModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121B2A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    gap: 14,
    marginBottom: 6,
  },
  profileAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  profileHandle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#86EFAC',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  profileEditAction: {
    padding: 8,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121B2A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 8,
  },
  signOutCard: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(134, 239, 172, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  settingSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    maxWidth: 240,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 4,
  },
  versionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
});
