import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Cloud, X, Check, Globe, Key, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useKansya } from '../../store/KansyaContext';
import { getThemeColors } from '../../utils/theme';
import { SupabaseConfig } from '../../services/supabaseService';

interface SupabaseConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ visible, onClose }) => {
  const { supabaseConfig, updateSupabaseConfig, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (visible && supabaseConfig) {
      setUrl(supabaseConfig.url || '');
      setAnonKey(supabaseConfig.anonKey || '');
      setIsEnabled(supabaseConfig.isEnabled || false);
      setStatusMessage(null);
    }
  }, [visible, supabaseConfig]);

  const handleTestAndSave = async () => {
    setStatusMessage(null);
    const trimmedUrl = url.trim().replace(/\/+$/, '');
    const trimmedKey = anonKey.trim();

    if (isEnabled && (!trimmedUrl || !trimmedKey)) {
      setStatusMessage({
        text: 'Please provide both your Supabase URL and Anon Public Key.',
        type: 'error',
      });
      return;
    }

    if (!isEnabled) {
      const newConfig: SupabaseConfig = {
        url: trimmedUrl,
        anonKey: trimmedKey,
        isEnabled: false,
      };
      await updateSupabaseConfig(newConfig);
      setStatusMessage({
        text: 'Cloud sync disabled. Kansya is running in 100% Offline Local mode.',
        type: 'success',
      });
      setTimeout(() => onClose(), 1200);
      return;
    }

    setTesting(true);
    try {
      // Test ping to Supabase REST endpoint
      const res = await fetch(`${trimmedUrl}/rest/v1/collab_goals?select=count`, {
        method: 'GET',
        headers: {
          apikey: trimmedKey,
          Authorization: `Bearer ${trimmedKey}`,
        },
      });

      if (res.ok || res.status === 200 || res.status === 206) {
        const newConfig: SupabaseConfig = {
          url: trimmedUrl,
          anonKey: trimmedKey,
          isEnabled: true,
        };
        await updateSupabaseConfig(newConfig);
        setStatusMessage({
          text: 'Connected successfully to Supabase! Live multi-device squad sync is now active.',
          type: 'success',
        });
        setTimeout(() => onClose(), 1400);
      } else {
        const errText = await res.text();
        setStatusMessage({
          text: `Supabase returned status ${res.status}. Make sure you ran supabase/schema.sql in your Supabase dashboard. (${errText.slice(0, 100)})`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Connection failed: ${err?.message || 'Check your URL and internet connection.'}`,
        type: 'error',
      });
    } finally {
      setTesting(false);
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
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE' }]}>
                <Cloud size={20} color="#38BDF8" />
              </View>
              <View>
                <Text style={[styles.sheetSubtitle, { color: colors.accentEmerald }]}>SQUAD CLOUD SYNC</Text>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Supabase Squad Sync</Text>
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
              Connect your free Supabase database to invite friends across separate phones and sync shared Collab Squad deposits in real-time.
            </Text>

            {statusMessage && (
              <View
                style={[
                  styles.statusBanner,
                  statusMessage.type === 'success'
                    ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
                    : { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
                ]}
              >
                {statusMessage.type === 'success' ? (
                  <Check size={16} color="#10B981" />
                ) : (
                  <AlertCircle size={16} color="#EF4444" />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5' },
                  ]}
                >
                  {statusMessage.text}
                </Text>
              </View>
            )}

            {/* Toggle Enable Cloud Sync */}
            <View style={[styles.toggleRow, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <View style={styles.toggleLeft}>
                <Globe size={18} color={isEnabled ? '#38BDF8' : colors.textMuted} />
                <View>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Enable Real-Time Cloud Sync</Text>
                  <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                    {isEnabled ? 'Syncing Collab Squads via Supabase' : 'Running 100% Offline (Local)'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={(val) => setIsEnabled(val)}
                trackColor={{ false: '#334155', true: '#059669' }}
                thumbColor={isEnabled ? '#10B981' : '#94A3B8'}
              />
            </View>

            {/* Supabase URL */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Supabase Project URL</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Globe size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="https://xyzcompany.supabase.co"
                placeholderTextColor={colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Supabase Anon Key */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Supabase Anon / Public API Key</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Key size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                placeholderTextColor={colors.textMuted}
                value={anonKey}
                onChangeText={setAnonKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            {/* SQL Notice */}
            <View style={[styles.schemaHintBox, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <ShieldCheck size={16} color={colors.accentEmerald} />
              <Text style={[styles.schemaHintText, { color: colors.textSecondary }]}>
                Ready-to-run database tables are provided in <Text style={{ fontWeight: '700', color: colors.textPrimary }}>supabase/schema.sql</Text>. Run it in the Supabase SQL editor with one click.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: isEnabled ? '#38BDF8' : colors.accentEmerald },
                testing && { opacity: 0.7 },
              ]}
              onPress={handleTestAndSave}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color="#07130F" />
              ) : (
                <>
                  <Check size={18} color="#07130F" strokeWidth={3} />
                  <Text style={styles.saveBtnText}>
                    {isEnabled ? 'Test Connection & Save' : 'Save Offline Settings'}
                  </Text>
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
    maxHeight: '85%',
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
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
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  schemaHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 16,
  },
  schemaHintText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    height: 50,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#07130F',
  },
});
