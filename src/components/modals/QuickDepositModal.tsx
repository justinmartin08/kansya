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
import { X, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { WishlistProject } from '../../types';
import { formatPHP, getProjectProgress } from '../../utils/calculations';
import { KansyaDesign, getThemeColors } from '../../utils/theme';
import { useKansya } from '../../store/KansyaContext';

interface QuickDepositModalProps {
  visible: boolean;
  project: WishlistProject;
  onClose: () => void;
  onDeposit: (amount: number, note?: string) => Promise<void>;
}

const PRESET_CHIPS = [50, 100, 200, 500];

export const QuickDepositModal: React.FC<QuickDepositModalProps> = ({
  visible,
  project,
  onClose,
  onDeposit,
}) => {
  const { theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAmount = customInput.trim().length > 0
    ? (parseInt(customInput, 10) || 0)
    : selectedAmount;

  React.useEffect(() => {
    if (!visible) {
      setSelectedAmount(100);
      setCustomInput('');
      setNote('');
    }
  }, [visible]);

  const currentProg = getProjectProgress(project.currentAmount, project.targetPrice);
  const nextProg = getProjectProgress(project.currentAmount + activeAmount, project.targetPrice);

  const handleSelectChip = (chip: number) => {
    setSelectedAmount(chip);
    setCustomInput('');
  };

  const handleCustomChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setCustomInput(cleaned);
  };

  const handleConfirm = async () => {
    if (activeAmount <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDeposit(activeAmount, note.trim() || undefined);
      setCustomInput('');
      setNote('');
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
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>ADD SAVINGS</Text>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{project.title}</Text>
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
            {/* Quick Amounts */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Quick amounts</Text>
            <View style={styles.chipRow}>
              {PRESET_CHIPS.map((chip) => {
                const isSelected = !customInput && selectedAmount === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => handleSelectChip(chip)}
                    style={[
                      styles.chipButton,
                      { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border },
                      isSelected && [styles.chipButtonActive, { backgroundColor: colors.tagBg, borderColor: colors.accentEmerald }],
                    ]}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && [styles.chipTextActive, { color: colors.accentEmerald }]]}>
                      ₱{chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Custom amount</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
              <TextInput
                style={[styles.customTextInput, { color: colors.textPrimary }]}
                placeholder="Enter custom amount"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={customInput}
                onChangeText={handleCustomChange}
              />
            </View>

            {/* Optional Note Input */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Optional note</Text>
            <View style={[styles.noteInputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.textPrimary }]}
                placeholder="e.g. Skipped coffee, Baon savings"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                maxLength={60}
              />
            </View>

            {/* Impact Preview */}
            <View style={[styles.impactCard, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <View style={styles.impactRow}>
                <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>Current Progress:</Text>
                <Text style={[styles.impactVal, { color: colors.textPrimary }]}>
                  {currentProg.clampedPercent}% ({formatPHP(project.currentAmount)})
                </Text>
              </View>
              <View style={styles.impactRow}>
                <Text style={[styles.impactLabel, { color: colors.textSecondary }]}>After Deposit:</Text>
                <Text style={[styles.impactVal, { color: colors.accentEmerald, fontWeight: '700' }]}>
                  {nextProg.clampedPercent}% ({formatPHP(project.currentAmount + activeAmount)})
                </Text>
              </View>
              {nextProg.isCompleted && (
                <View style={styles.completionBadge}>
                  <CheckCircle2 size={13} color="#EBCB72" />
                  <Text style={styles.completionText}>Will fully fund this goal!</Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.depositBtn,
                { backgroundColor: colors.accentEmerald },
                activeAmount <= 0 && styles.depositBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={activeAmount <= 0 || isSubmitting}
            >
              <Text style={[styles.depositBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>
                {isSubmitting ? 'Adding...' : `Add ${formatPHP(activeAmount)}`}
              </Text>
              <ArrowRight size={18} color={isDark ? '#07130F' : '#FFFFFF'} strokeWidth={2.5} />
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
    paddingBottom: 20,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9AAFA5',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  chipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: KansyaDesign.radius.sm,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipButtonActive: {
    backgroundColor: 'rgba(85, 217, 154, 0.16)',
    borderColor: '#55D99A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9AAFA5',
  },
  chipTextActive: {
    color: '#55D99A',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#55D99A',
    marginRight: 6,
  },
  customTextInput: {
    flex: 1,
    height: 48,
    color: '#F4F7F3',
    fontSize: 14,
  },
  noteInputWrapper: {
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  noteInput: {
    height: 48,
    color: '#F4F7F3',
    fontSize: 13.5,
  },
  impactCard: {
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 12,
    color: '#9AAFA5',
  },
  impactVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F4F7F3',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(235, 203, 114, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  completionText: {
    fontSize: 11,
    color: '#EBCB72',
    fontWeight: '600',
  },
  depositBtn: {
    flexDirection: 'row',
    backgroundColor: '#55D99A',
    borderRadius: KansyaDesign.radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  depositBtnDisabled: {
    opacity: 0.45,
  },
  depositBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#07130F',
  },
});
