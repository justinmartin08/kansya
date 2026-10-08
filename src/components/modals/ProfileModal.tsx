import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  X,
  User,
  AtSign,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  HardDrive,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Sparkles } from '../illustrations/CustomIcons';
import { useKansya } from '../../store/KansyaContext';
import { AVATAR_OPTIONS, AvatarBadge, getAvatarById } from '../../utils/avatars';
import { TactilePressable } from '../ui/TactilePressable';
import { getThemeColors } from '../../utils/theme';
import { triggerLightHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const {
    currentUser,
    updateUserProfile,
    changePassword,
    generateRecoveryCode,
    theme,
    isDark,
  } = useKansya();

  const colors = getThemeColors(theme);

  // Profile Identity State
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    currentUser?.avatarId || 'avatar_sprout'
  );
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [username, setUsername] = useState<string>(currentUser?.username || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');

  // Password Management State
  const [showPasswordSection, setShowPasswordSection] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  // Status & Offline Recovery State
  const [recoveryCode, setRecoveryCode] = useState<string>(
    currentUser?.recoveryCode || ''
  );
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const prevVisibleRef = useRef<boolean>(false);

  // Reset inputs only when modal opens
  useEffect(() => {
    if (visible && !prevVisibleRef.current && currentUser) {
      setSelectedAvatarId(currentUser.avatarId || 'avatar_sprout');
      setFullName(currentUser.fullName);
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setRecoveryCode(currentUser.recoveryCode || '');
      setStatusMsg(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    prevVisibleRef.current = visible;
  }, [visible, currentUser]);

  const handleSaveIdentity = async () => {
    setStatusMsg(null);
    if (!fullName.trim()) {
      setStatusMsg({ type: 'error', text: 'Full name cannot be empty' });
      return;
    }
    const cleanUser = username.trim().replace(/^@+/, '');
    if (!cleanUser || cleanUser.length < 3) {
      setStatusMsg({ type: 'error', text: 'Username must be at least 3 characters' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        fullName: fullName.trim(),
        username: cleanUser,
        email: email.trim().toLowerCase(),
        avatarId: selectedAvatarId,
      });

      if (!res.success) {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update profile' });
      } else {
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
        triggerSuccessHaptic();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error saving changes' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setStatusMsg(null);
    if (currentUser?.password && !oldPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter your current password' });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 4 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (!res.success) {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to change password' });
      } else {
        setStatusMsg({ type: 'success', text: 'Password successfully changed!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        triggerSuccessHaptic();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Password update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRecoveryCode = async () => {
    try {
      triggerLightHaptic();
      const code = await generateRecoveryCode();
      setRecoveryCode(code);
      setStatusMsg({
        type: 'success',
        text: 'New offline master recovery key generated and stored locally!',
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to generate recovery key' });
    }
  };

  const activeAvatar = getAvatarById(selectedAvatarId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardContainer}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.modalHeaderTitleRow}>
                <ShieldCheck size={20} color={colors.accentEmerald} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Profile & Identity
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.buttonSecondaryBg }]}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Status Banner */}
              {statusMsg && (
                <View
                  style={[
                    styles.statusBanner,
                    statusMsg.type === 'success'
                      ? styles.statusSuccessBanner
                      : styles.statusErrorBanner,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBannerText,
                      statusMsg.type === 'success'
                        ? styles.statusSuccessText
                        : styles.statusErrorText,
                    ]}
                  >
                    {statusMsg.text}
                  </Text>
                </View>
              )}

              {/* Live Profile Header Banner */}
              <View
                style={[
                  styles.heroProfileCard,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.heroAvatarWrapper}>
                  <AvatarBadge avatarId={selectedAvatarId} size={64} showBorder={true} />
                </View>
                <View style={styles.heroProfileInfo}>
                  <Text style={[styles.heroNameText, { color: colors.textPrimary }]}>
                    {fullName.trim() || currentUser?.fullName || 'Kansya Saver'}
                  </Text>
                  <Text style={[styles.heroHandleText, { color: colors.accentEmerald }]}>
                    @{username.trim().replace(/^@+/, '') || currentUser?.username || 'saver'}
                  </Text>
                  <View style={styles.heroBadgeRow}>
                    <Sparkles size={11} color={activeAvatar.color} />
                    <Text style={[styles.heroBadgeText, { color: activeAvatar.color }]}>
                      {activeAvatar.title}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 1. Curated Savings Avatar Selector */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  SAVINGS AVATAR
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  Choose from 6 curated identities to represent your savings journey
                </Text>

                <View style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = selectedAvatarId === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.avatarItemBtn,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            borderColor: isSelected ? colors.accentEmerald : colors.border,
                          },
                          isSelected && styles.avatarItemSelected,
                        ]}
                        onPress={() => {
                          triggerLightHaptic();
                          setSelectedAvatarId(item.id);
                        }}
                        activeOpacity={0.8}
                      >
                        <AvatarBadge avatarId={item.id} size={42} showBorder={false} />
                        <Text
                          style={[
                            styles.avatarItemLabel,
                            {
                              color: isSelected ? colors.textPrimary : colors.textMuted,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.avatarCheckmarkPill}>
                            <Check size={10} color="#07130F" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Identity Management Form */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  ACCOUNT CREDENTIALS
                </Text>

                {/* Full Name */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <User size={18} color="#94A3B8" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Full Name"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Username */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Username (@handle)
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
                  <AtSign size={18} color="#94A3B8" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Username"
                    placeholderTextColor="#64748B"
                    value={username}
                    onChangeText={(v) => setUsername(v.replace(/^@+/, '').replace(/\s+/g, ''))}
                    autoCapitalize="none"
                  />
                </View>

                {/* Email Address */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Email Address (Local Identifier)
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
                  <Mail size={18} color="#94A3B8" style={styles.fieldIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    placeholder="Email Address"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* 100% Offline Vault Notice */}
                <View
                  style={[
                    styles.offlineInfoBox,
                    {
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                      borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.25)',
                    },
                  ]}
                >
                  <HardDrive size={16} color={colors.accentEmerald} />
                  <View style={styles.offlineInfoContent}>
                    <Text style={[styles.offlineInfoTitle, { color: colors.accentEmerald }]}>
                      100% Offline Local Database
                    </Text>
                    <Text style={[styles.offlineInfoBody, { color: colors.textSecondary }]}>
                      Your email and credentials are stored strictly in local device storage. Kansya never makes external server calls or dispatches verification emails.
                    </Text>
                  </View>
                </View>

                {/* Save Identity Button */}
                <TactilePressable
                  style={[styles.actionBtn, { backgroundColor: colors.accentEmerald }]}
                  onPress={handleSaveIdentity}
                  activeScale={0.98}
                  haptic
                >
                  <Text style={styles.actionBtnText}>
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </Text>
                </TactilePressable>
              </View>

              {/* 3. Password Security Section */}
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={[
                    styles.expandableHeader,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowPasswordSection(!showPasswordSection)}
                  activeOpacity={0.8}
                >
                  <View style={styles.expandableTitleRow}>
                    <Lock size={18} color={colors.accentEmerald} />
                    <View>
                      <Text style={[styles.expandableTitle, { color: colors.textPrimary }]}>
                        Change Password
                      </Text>
                      <Text style={[styles.expandableSubtitle, { color: colors.textMuted }]}>
                        Update your local account master password
                      </Text>
                    </View>
                  </View>
                  {showPasswordSection ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {showPasswordSection && (
                  <View
                    style={[
                      styles.passwordCardBody,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {/* Current Password */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Current Password
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
                      <Lock size={18} color="#94A3B8" style={styles.fieldIcon} />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        placeholder="Current password"
                        placeholderTextColor="#64748B"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!showOldPass}
                      />
                      <TouchableOpacity
                        onPress={() => setShowOldPass(!showOldPass)}
                        style={styles.eyeBtn}
                      >
                        {showOldPass ? (
                          <EyeOff size={18} color={colors.accentEmerald} />
                        ) : (
                          <Eye size={18} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* New Password */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      New Password (Min 4 chars)
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
                      <KeyRound size={18} color="#94A3B8" style={styles.fieldIcon} />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        placeholder="New password"
                        placeholderTextColor="#64748B"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPass}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPass(!showNewPass)}
                        style={styles.eyeBtn}
                      >
                        {showNewPass ? (
                          <EyeOff size={18} color={colors.accentEmerald} />
                        ) : (
                          <Eye size={18} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Confirm New Password
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
                      <Check size={18} color="#94A3B8" style={styles.fieldIcon} />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        placeholder="Confirm new password"
                        placeholderTextColor="#64748B"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPass}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPass(!showConfirmPass)}
                        style={styles.eyeBtn}
                      >
                        {showConfirmPass ? (
                          <EyeOff size={18} color={colors.accentEmerald} />
                        ) : (
                          <Eye size={18} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>

                    <TactilePressable
                      style={[styles.actionBtn, { backgroundColor: colors.accentEmerald, marginTop: 12 }]}
                      onPress={handleUpdatePassword}
                      activeScale={0.98}
                      haptic
                    >
                      <Text style={styles.actionBtnText}>Update Password</Text>
                    </TactilePressable>
                  </View>
                )}
              </View>

              {/* 4. 100% Offline Credential & Master Recovery Key */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  OFFLINE CREDENTIAL RECOVERY
                </Text>
                <View
                  style={[
                    styles.recoveryCard,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.recoveryTopRow}>
                    <View style={styles.recoveryIconCircle}>
                      <KeyRound size={20} color="#F59E0B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recoveryTitle, { color: colors.textPrimary }]}>
                        Master Recovery Key
                      </Text>
                      <Text style={[styles.recoverySubtitle, { color: colors.textMuted }]}>
                        In-app offline security code to safeguard your local savings vault
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.codeDisplayBox,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.codeDisplayText, { color: colors.accentEmerald }]}>
                      {recoveryCode || 'NO KEY GENERATED'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.generateCodeBtn,
                      {
                        backgroundColor: colors.surfaceCardSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleGenerateRecoveryCode}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={14} color={colors.accentEmerald} />
                    <Text style={[styles.generateCodeBtnText, { color: colors.textPrimary }]}>
                      {recoveryCode ? 'Regenerate Offline Master Key' : 'Generate Offline Master Key'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  statusBanner: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusSuccessBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusErrorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  statusBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSuccessText: {
    color: '#86EFAC',
  },
  statusErrorText: {
    color: '#FCA5A5',
  },
  heroProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  heroAvatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroProfileInfo: {
    flex: 1,
  },
  heroNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroHandleText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarItemBtn: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
  },
  avatarItemSelected: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarItemLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  avatarCheckmarkPill: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 4,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  offlineInfoBox: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  offlineInfoContent: {
    flex: 1,
  },
  offlineInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  offlineInfoBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#07130F',
    fontSize: 14,
    fontWeight: '800',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  expandableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  expandableTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  expandableSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  passwordCardBody: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
  },
  recoveryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  recoveryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recoveryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  recoverySubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  codeDisplayBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDisplayText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  generateCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  generateCodeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
