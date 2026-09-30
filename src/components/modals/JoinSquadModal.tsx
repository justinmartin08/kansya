import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Users, X, Check, KeyRound, AlertCircle } from 'lucide-react-native';
import { useKansya } from '../../store/KansyaContext';
import { getThemeColors } from '../../utils/theme';

interface JoinSquadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinSquadModal: React.FC<JoinSquadModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { joinCollabByCode, theme, isDark, isCloudSyncActive } = useKansya();
  const colors = getThemeColors(theme);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleJoin = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a 6-character Squad Code.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await joinCollabByCode(cleanCode);
      if (res.success && res.goal) {
        setSuccessMsg(`Joined "${res.goal.title}" successfully!`);
        setTimeout(() => {
          setCode('');
          setSuccessMsg('');
          setLoading(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Squad Code not found.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to join squad.');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7' }]}>
                <KeyRound size={20} color={colors.accentEmerald} />
              </View>
              <View>
                <Text style={[styles.sheetSubtitle, { color: colors.accentEmerald }]}>SQUAD CODE INVITATION</Text>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Join Collab Squad</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCloseBtn, { backgroundColor: colors.buttonSecondaryBg }]}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            <Text style={[styles.infoParagraph, { color: colors.textSecondary }]}>
              Enter the 6-character Squad Code shared by your friend (e.g., <Text style={{ fontWeight: '700', color: colors.textPrimary }}>BORA-924</Text>) to link up and save together.
            </Text>

            {errorMsg ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={15} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successBanner}>
                <Check size={15} color="#10B981" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Squad Code</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. BORA-924"
                placeholderTextColor={colors.textMuted}
                value={code}
                onChangeText={(v) => {
                  setCode(v.toUpperCase().replace(/\s+/g, ''));
                  setErrorMsg('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
              />
            </View>

            {/* Cloud Status Pill */}
            <View style={[styles.cloudPill, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <View style={[styles.statusDot, { backgroundColor: isCloudSyncActive ? '#10B981' : '#94A3B8' }]} />
              <Text style={[styles.cloudPillText, { color: colors.textSecondary }]}>
                {isCloudSyncActive
                  ? 'Cloud Sync Active (Supabase Connected)'
                  : 'Local Mode (Enable Supabase in Settings to sync across separate devices)'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: colors.accentEmerald }, loading && { opacity: 0.7 }]}
              onPress={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#07130F" />
              ) : (
                <>
                  <Users size={16} color={isDark ? '#07130F' : '#FFFFFF'} />
                  <Text style={[styles.modalPrimaryBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Join Squad</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoParagraph: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  cloudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cloudPillText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    height: 50,
    marginTop: 6,
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
