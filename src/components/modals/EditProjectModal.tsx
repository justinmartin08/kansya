import React, { useState, useEffect } from 'react';
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
import { WishlistProject } from '../../types';
import { useKansya } from '../../store/KansyaContext';
import { KansyaDesign } from '../../utils/theme';

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
  const { updateProject } = useKansya();
  const [title, setTitle] = useState(project.title);
  const [targetPriceStr, setTargetPriceStr] = useState(project.targetPrice.toString());
  const [category, setCategory] = useState<WishlistProject['category']>(project.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(project.title);
      setTargetPriceStr(project.targetPrice.toString());
      setCategory(project.category);
    }
  }, [visible, project]);

  const targetPrice = parseInt(targetPriceStr, 10) || 0;

  const handleSave = async () => {
    if (!title.trim() || targetPrice <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProject(project.id, {
        title: title.trim(),
        targetPrice,
        category,
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
              <Text style={styles.headerSubtitle}>EDIT GOAL</Text>
              <Text style={styles.headerTitle}>Update Goal Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#9AAFA5" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Goal Title */}
            <Text style={styles.fieldLabel}>Goal Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Item / Goal name"
                placeholderTextColor="#667A71"
                value={title}
                onChangeText={setTitle}
                maxLength={45}
              />
            </View>

            {/* Target Price */}
            <Text style={styles.fieldLabel}>Target Price (₱)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Target Price"
                placeholderTextColor="#667A71"
                keyboardType="numeric"
                value={targetPriceStr}
                onChangeText={(val) => setTargetPriceStr(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!title.trim() || targetPrice <= 0 || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || targetPrice <= 0 || isSubmitting}
            >
              <Text style={styles.submitBtnText}>
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
    fontSize: 16,
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
  submitBtn: {
    backgroundColor: '#55D99A',
    borderRadius: KansyaDesign.radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
