import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { WishlistProject } from '../../types';
import { formatPHP, getProjectProgress } from '../../utils/calculations';

interface QuickDepositModalProps {
  visible: boolean;
  project: WishlistProject;
  onClose: () => void;
  onDeposit: (amount: number, note?: string) => Promise<void>;
}

const PRESET_CHIPS = [20, 50, 100, 200, 500];

export const QuickDepositModal: React.FC<QuickDepositModalProps> = ({
  visible,
  project,
  onClose,
  onDeposit,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customInput, setCustomInput] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAmount = customInput.trim().length > 0
    ? (parseInt(customInput, 10) || 0)
    : selectedAmount;

  React.useEffect(() => {
    if (!visible) {
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

        <View style={styles.sheetContainer}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerSubtitle}>SAVINGS DEPOSIT</Text>
              <Text style={styles.headerTitle}>Fund {project.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Quick Amount Selector */}
            <Text style={styles.sectionLabel}>Select Amount</Text>
            <View style={styles.chipRow}>
              {PRESET_CHIPS.map((chip) => {
                const isSelected = !customInput && selectedAmount === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => handleSelectChip(chip)}
                    style={[styles.chipButton, isSelected && styles.chipButtonActive]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      +₱{chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.customTextInput}
                placeholder="Or type custom amount"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={customInput}
                onChangeText={handleCustomChange}
              />
            </View>

            {/* Deposit Note Input */}
            <View style={styles.noteInputWrapper}>
              <TextInput
                style={styles.noteInput}
                placeholder="Optional note (e.g. Skipped milk tea, Baon savings)"
                placeholderTextColor="#64748B"
                value={note}
                onChangeText={setNote}
                maxLength={60}
              />
            </View>

            {/* Impact Preview Card */}
            <View style={styles.impactCard}>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>Current Progress:</Text>
                <Text style={styles.impactVal}>{currentProg.clampedPercent}% ({formatPHP(project.currentAmount)})</Text>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>After Deposit:</Text>
                <Text style={[styles.impactVal, { color: '#86EFAC', fontWeight: '700' }]}>
                  {nextProg.clampedPercent}% ({formatPHP(project.currentAmount + activeAmount)})
                </Text>
              </View>
              {nextProg.isCompleted && (
                <View style={styles.completionBadge}>
                  <CheckCircle2 size={13} color="#FFB800" />
                  <Text style={styles.completionText}>Will fully fund this goal!</Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.depositBtn, activeAmount <= 0 && styles.depositBtnDisabled]}
              onPress={handleConfirm}
              disabled={activeAmount <= 0 || isSubmitting}
            >
              <Text style={styles.depositBtnText}>
                {isSubmitting ? 'Saving...' : `Deposit ${formatPHP(activeAmount)}`}
              </Text>
              <ArrowRight size={18} color="#0B111E" strokeWidth={2.5} />
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
    backgroundColor: 'rgba(5, 8, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#121B2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
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
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1A2436',
    borderWidth: 1,
    borderColor: '#26354D',
  },
  chipButtonActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    borderColor: '#86EFAC',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chipTextActive: {
    color: '#86EFAC',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1624',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86EFAC',
    marginRight: 8,
  },
  customTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  noteInputWrapper: {
    backgroundColor: '#0E1624',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
  },
  noteInput: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  impactCard: {
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22324B',
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
    color: '#94A3B8',
  },
  impactVal: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  completionBadge: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB800',
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 52,
    gap: 8,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  depositBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  depositBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B111E',
  },
});
