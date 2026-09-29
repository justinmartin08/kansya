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
import { X, Sparkles } from 'lucide-react-native';
import { WishlistProject } from '../../types';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP, getDailyExcessRate, calculatePace } from '../../utils/calculations';

interface NewProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ visible, onClose }) => {
  const { createProject, allowance } = useKansya();
  const [title, setTitle] = useState('');
  const [targetPriceStr, setTargetPriceStr] = useState('');
  const category: WishlistProject['category'] = 'other';
  const [useManualRate, setUseManualRate] = useState(false);
  const [manualRateStr, setManualRateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setTitle('');
      setTargetPriceStr('');
      setManualRateStr('');
      setUseManualRate(false);
    }
  }, [visible]);

  const targetPrice = parseInt(targetPriceStr, 10) || 0;
  const manualRate = parseInt(manualRateStr, 10) || 0;
  const autoDailyExcess = getDailyExcessRate(allowance);
  const activeRate = useManualRate && manualRate > 0 ? manualRate : autoDailyExcess;

  const pace = calculatePace(
    {
      id: 'preview',
      title: title.trim() || 'New Goal',
      targetPrice,
      currentAmount: 0,
      category,
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
        category,
        useManualRate && manualRate > 0 ? manualRate : undefined
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

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerSubtitle}>NEW FINANCIAL GOAL</Text>
              <Text style={styles.headerTitle}>Stake a Wishlist Goal</Text>
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
            {/* Goal Title */}
            <Text style={styles.fieldLabel}>Item / Goal Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Mechanical Keyboard, Palworld..."
                placeholderTextColor="#64748B"
                value={title}
                onChangeText={setTitle}
                maxLength={45}
              />
            </View>

            {/* Target Price */}
            <Text style={styles.fieldLabel}>Target Price (PHP)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2500"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={targetPriceStr}
                onChangeText={(val) => setTargetPriceStr(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Pace Projection Card */}
            {targetPrice > 0 && (
              <View style={styles.previewBox}>
                <View style={styles.previewHeader}>
                  <Sparkles size={16} color="#86EFAC" />
                  <Text style={styles.previewTitle}>Pace Forecast</Text>
                </View>
                <Text style={styles.previewText}>
                  At {formatPHP(activeRate)}/day daily excess, you'll reach this goal in{' '}
                  <Text style={styles.highlightText}>
                    {pace.daysRemaining > 0 ? `${pace.daysRemaining} days` : 'today'}
                  </Text>
                  {pace.projectedDate ? (
                    <Text style={styles.dateSubtext}>
                      {' '}(by {new Date(pace.projectedDate).toLocaleDateString()})
                    </Text>
                  ) : null}
                  .
                </Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!title.trim() || targetPrice <= 0 || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleCreate}
              disabled={!title.trim() || targetPrice <= 0 || isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Staking Goal...' : 'Launch Goal'}
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 4,
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
    marginBottom: 14,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86EFAC',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  previewBox: {
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22324B',
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
    color: '#86EFAC',
    letterSpacing: 0.5,
  },
  previewText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  highlightText: {
    color: '#86EFAC',
    fontWeight: '700',
  },
  dateSubtext: {
    color: '#94A3B8',
    fontSize: 12,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 52,
    marginTop: 6,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B111E',
  },
});
