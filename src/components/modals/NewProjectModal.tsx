import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Sparkles } from '../illustrations/CustomIcons';
import { WishlistProject } from '../../types';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP, getDailyExcessRate, calculatePace } from '../../utils/calculations';
import { KansyaDesign, getThemeColors } from '../../utils/theme';

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ visible, onClose }) => {
  const { createProject, allowance, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
  const [title, setTitle] = useState('');
  const [targetPriceStr, setTargetPriceStr] = useState('');
  const [targetDateStr, setTargetDateStr] = useState('');
  const [initialSavedStr, setInitialSavedStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setTitle('');
      setTargetPriceStr('');
      setTargetDateStr('');
      setInitialSavedStr('');
    }
  }, [visible]);

  const targetPrice = parseInt(targetPriceStr, 10) || 0;
  const initialSaved = parseInt(initialSavedStr, 10) || 0;
  const autoDailyExcess = getDailyExcessRate(allowance);

  const pace = calculatePace(
    {
      id: 'preview',
      title: title.trim() || 'New Goal',
      targetPrice,
      currentAmount: initialSaved,
      category: 'gadget',
      createdAt: new Date().toISOString(),
    },
    allowance
  );

  const handleCreate = async () => {
    if (!title.trim() || targetPrice <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createProject(
        title.trim(),
        targetPrice,
        'gadget',
        undefined,
        initialSaved > 0 ? initialSaved : undefined
      );
      onClose();
    } finally {
      setIsSubmitting(false);
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
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.modalBackdrop}
      >
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>NEW GOAL</Text>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Create a Goal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Step 1: What are you saving for? */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>What are you saving for?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. Gaming Laptop"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={45}
              />
            </View>

            {/* Step 2: How much does it cost? */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>How much does it cost?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. 50000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={targetPriceStr}
                onChangeText={(val) => setTargetPriceStr(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Step 3: When do you want it? (Optional) */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>When do you want it? (Optional)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. Dec 2026, Birthday, Next Summer"
                placeholderTextColor={colors.textMuted}
                value={targetDateStr}
                onChangeText={setTargetDateStr}
                maxLength={40}
              />
            </View>

            {/* Step 4: How much have you already saved? (Optional) */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>How much have you already saved? (Optional)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="e.g. 525 (leave empty if 0)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={initialSavedStr}
                onChangeText={(val) => setInitialSavedStr(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Smart Pace Projection Card */}
            {targetPrice > 0 && (
              <View style={[styles.previewBox, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
                <View style={styles.previewHeader}>
                  <Sparkles size={16} color={colors.accentEmerald} />
                  <Text style={[styles.previewTitle, { color: colors.accentEmerald }]}>Smart pace</Text>
                </View>
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  Based on your current pace, you'll reach this in{' '}
                  <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
                    {pace.daysRemaining > 0 ? `${pace.daysRemaining} days` : 'today'}
                  </Text>
                  {pace.projectedDate ? (
                    <Text style={[styles.dateSubtext, { color: colors.textMuted }]}>
                      {' '}(around {new Date(pace.projectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                    </Text>
                  ) : null}
                  .
                </Text>
              </View>
            )}

            {/* Step 5: Create Goal Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.accentEmerald },
                (!title.trim() || targetPrice <= 0 || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleCreate}
              disabled={!title.trim() || targetPrice <= 0 || isSubmitting}
            >
              <Text style={[styles.submitBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>
                {isSubmitting ? 'Creating Goal...' : 'Create goal'}
              </Text>
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
    backgroundColor: 'rgba(7, 19, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0D211B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#55D99A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F7F3',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9AAFA5',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  pesoSign: {
    fontSize: 15,
    fontWeight: '700',
    color: '#55D99A',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: '#F4F7F3',
    fontSize: 14,
  },
  previewBox: {
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 14,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#55D99A',
  },
  previewText: {
    fontSize: 12.5,
    color: '#9AAFA5',
    lineHeight: 18,
  },
  highlightText: {
    color: '#55D99A',
    fontWeight: '700',
  },
  dateSubtext: {
    color: '#F4F7F3',
  },
  submitBtn: {
    backgroundColor: '#55D99A',
    borderRadius: KansyaDesign.radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#07130F',
  },
});
