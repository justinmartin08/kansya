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
import { X, Sliders, Check, Zap } from 'lucide-react-native';
import { AllowanceProfile } from '../../types';
import { formatPHP } from '../../utils/calculations';

interface AllowanceModalProps {
  visible: boolean;
  allowance: AllowanceProfile;
  onClose: () => void;
  onSave: (updated: AllowanceProfile) => Promise<void>;
  onResetSampleData?: () => Promise<void>;
}

const SCHEDULE_DAYS = [
  { days: 1, label: '1 Day', sub: 'Paced' },
  { days: 2, label: '2 Days', sub: 'Part-time' },
  { days: 3, label: '3 Days', sub: 'College' },
  { days: 4, label: '4 Days', sub: 'College' },
  { days: 5, label: '5 Days', sub: 'School' },
  { days: 6, label: '6 Days', sub: 'Extended' },
  { days: 7, label: '7 Days', sub: 'Full Week' },
];

export const AllowanceModal: React.FC<AllowanceModalProps> = ({
  visible,
  allowance,
  onClose,
  onSave,
}) => {
  const [dailyBaonStr, setDailyBaonStr] = useState(allowance.dailyBaon.toString());
  const [dailyExpensesStr, setDailyExpensesStr] = useState(allowance.dailyExpenses.toString());
  const [daysPerWeek, setDaysPerWeek] = useState(allowance.allowanceDaysPerWeek || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setDailyBaonStr(allowance.dailyBaon.toString());
      setDailyExpensesStr(allowance.dailyExpenses.toString());
      setDaysPerWeek(allowance.allowanceDaysPerWeek || 5);
    }
  }, [visible, allowance]);

  const dailyBaon = parseInt(dailyBaonStr, 10) || 0;
  const dailyExpenses = parseInt(dailyExpensesStr, 10) || 0;
  const dailyExcess = Math.max(0, dailyBaon - dailyExpenses);
  const weeklyExcess = dailyExcess * daysPerWeek;
  const monthlyExcess = weeklyExcess * 4;

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave({
        dailyBaon,
        dailyExpenses,
        savingsGoalPercent: 100,
        allowanceDaysPerWeek: daysPerWeek,
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
              <Text style={styles.headerSubtitle}>ALLOWANCE & DISCIPLINE</Text>
              <Text style={styles.headerTitle}>Daily Baon Profile</Text>
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
            {/* Daily Baon Input */}
            <Text style={styles.fieldLabel}>Daily Allowance / Baon (PHP)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={dailyBaonStr}
                onChangeText={(v) => setDailyBaonStr(v.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 150"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Daily Expenses Input */}
            <Text style={styles.fieldLabel}>Daily Living Expenses (Fare, Food, Projects)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={dailyExpensesStr}
                onChangeText={(v) => setDailyExpensesStr(v.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 90"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Custom College & School Days Selection (7 Interactive Chips) */}
            <Text style={styles.fieldLabel}>Allowance Days Per Week (College / School)</Text>
            <View style={styles.weekDaysGrid}>
              {SCHEDULE_DAYS.map((item) => {
                const isSelected = daysPerWeek === item.days;
                return (
                  <TouchableOpacity
                    key={item.days}
                    onPress={() => setDaysPerWeek(item.days)}
                    style={[styles.weekDayChip, isSelected && styles.weekDayChipActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.weekDayChipTitle, isSelected && styles.weekDayChipTitleActive]}>
                      {item.days}d
                    </Text>
                    <Text style={[styles.weekDayChipSubtitle, isSelected && styles.weekDayChipSubtitleActive]}>
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Savings Capacity Summary Card */}
            <View style={styles.capacityCard}>
              <View style={styles.capacityHeaderRow}>
                <Zap size={13} color="#86EFAC" fill="#86EFAC" />
                <Text style={styles.capacityTitle}>SAVINGS ENGINE CAPACITY ({daysPerWeek} DAYS/WK)</Text>
              </View>
              <View style={styles.capacityGrid}>
                <View style={styles.capacityCol}>
                  <Text style={styles.capacityNum}>{formatPHP(dailyExcess)}</Text>
                  <Text style={styles.capacityLabel}>Daily Excess</Text>
                </View>
                <View style={styles.capacityCol}>
                  <Text style={styles.capacityNum}>{formatPHP(weeklyExcess)}</Text>
                  <Text style={styles.capacityLabel}>Weekly Power</Text>
                </View>
                <View style={styles.capacityCol}>
                  <Text style={styles.capacityNum}>{formatPHP(monthlyExcess)}</Text>
                  <Text style={styles.capacityLabel}>Monthly Power</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {isSubmitting ? 'Saving...' : 'Save Allowance Engine'}
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
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
    height: 48,
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
  weekDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  weekDayChip: {
    flexBasis: '22%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#162234',
    borderWidth: 1,
    borderColor: '#22324B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayChipActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    borderColor: '#86EFAC',
  },
  weekDayChipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  weekDayChipTitleActive: {
    color: '#86EFAC',
  },
  weekDayChipSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  weekDayChipSubtitleActive: {
    color: '#86EFAC',
  },
  capacityCard: {
    backgroundColor: '#162234',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#22324B',
    marginBottom: 20,
  },
  capacityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  capacityTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 1,
  },
  capacityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityCol: {
    alignItems: 'center',
    flex: 1,
  },
  capacityNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  capacityLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#86EFAC',
    borderRadius: 16,
    height: 50,
    shadowColor: '#86EFAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B111E',
  },
});
