import React, { useState, useEffect } from 'react';
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
import { X } from 'lucide-react-native';
import { WishlistProject } from '../../types';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP, getDailyExcessRate } from '../../utils/calculations';

interface EditProjectModalProps {
  visible: boolean;
  project: WishlistProject;
  onClose: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  visible,
  project,
  onClose,
}) => {
  const { updateProject, allowance } = useKansya();
  const [title, setTitle] = useState(project.title);
  const [targetPriceStr, setTargetPriceStr] = useState(project.targetPrice.toString());
  const [category, setCategory] = useState<WishlistProject['category']>(project.category);
  const [useManualRate, setUseManualRate] = useState(
    project.manualDailyAllocation !== undefined && project.manualDailyAllocation > 0
  );
  const [manualRateStr, setManualRateStr] = useState(
    project.manualDailyAllocation ? project.manualDailyAllocation.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(project.title);
      setTargetPriceStr(project.targetPrice.toString());
      setCategory(project.category);
      const hasManual =
        project.manualDailyAllocation !== undefined && project.manualDailyAllocation > 0;
      setUseManualRate(hasManual);
      setManualRateStr(hasManual ? project.manualDailyAllocation!.toString() : '');
    }
  }, [visible, project]);

  const targetPrice = parseInt(targetPriceStr, 10) || 0;
  const manualRate = parseInt(manualRateStr, 10) || 0;

  const handleSave = async () => {
    if (!title.trim() || targetPrice <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProject(project.id, {
        title: title.trim(),
        targetPrice,
        category,
        manualDailyAllocation: useManualRate && manualRate > 0 ? manualRate : undefined,
      });
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
              <Text style={styles.headerSubtitle}>EDIT FINANCIAL GOAL</Text>
              <Text style={styles.headerTitle}>Update Goal Settings</Text>
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
                value={title}
                onChangeText={setTitle}
                maxLength={45}
                placeholder="Item name"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Target Price */}
            <Text style={styles.fieldLabel}>Target Price (PHP)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={targetPriceStr}
                onChangeText={(val) => setTargetPriceStr(val.replace(/[^0-9]/g, ''))}
                placeholder="Target Price"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!title.trim() || targetPrice <= 0 || isSubmitting) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || targetPrice <= 0 || isSubmitting}
            >
              <Text style={styles.saveBtnText}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 52,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B111E',
  },
});
