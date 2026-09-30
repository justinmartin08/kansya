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
import { useKansya } from '../../store/KansyaContext';
import { getThemeColors } from '../../utils/theme';

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
  const { theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
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

        <View style={[styles.sheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.accentEmerald }]}>ALLOWANCE & DISCIPLINE</Text>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Daily Baon Profile</Text>
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
            {/* Daily Baon Input */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Daily Allowance / Baon (PHP)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={dailyBaonStr}
                onChangeText={(v) => setDailyBaonStr(v.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 150"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Daily Expenses Input */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Daily Living Expenses (Fare, Food, Projects)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pesoSign, { color: colors.accentEmerald }]}>₱</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                keyboardType="numeric"
                value={dailyExpensesStr}
                onChangeText={(v) => setDailyExpensesStr(v.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 90"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Custom College & School Days Selection (7 Interactive Chips) */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Allowance Days Per Week (College / School)</Text>
            <View style={styles.weekDaysGrid}>
              {SCHEDULE_DAYS.map((item) => {
                const isSelected = daysPerWeek === item.days;
                return (
                  <TouchableOpacity
                    key={item.days}
                    onPress={() => setDaysPerWeek(item.days)}
                    style={[
                      styles.weekDayChip,
                      { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border },
                      isSelected && [styles.weekDayChipActive, { backgroundColor: colors.tagBg, borderColor: colors.accentEmerald }],
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.weekDayChipTitle, { color: colors.textSecondary }, isSelected && [styles.weekDayChipTitleActive, { color: colors.accentEmerald }]]}>
                      {item.days}d
                    </Text>
                    <Text style={[styles.weekDayChipSubtitle, { color: colors.textMuted }, isSelected && [styles.weekDayChipSubtitleActive, { color: colors.accentEmerald }]]}>
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Savings Capacity Summary Card */}
            <View style={[styles.capacityCard, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
              <View style={styles.capacityHeaderRow}>
                <Zap size={13} color={colors.accentEmerald} fill={colors.accentEmerald} />
                <Text style={[styles.capacityTitle, { color: colors.accentEmerald }]}>SAVINGS ENGINE CAPACITY ({daysPerWeek} DAYS/WK)</Text>
              </View>
              <View style={styles.capacityGrid}>
                <View style={styles.capacityCol}>
                  <Text style={[styles.capacityNum, { color: colors.textPrimary }]}>{formatPHP(dailyExcess)}</Text>
                  <Text style={[styles.capacityLabel, { color: colors.textMuted }]}>Daily Excess</Text>
                </View>
                <View style={styles.capacityCol}>
                  <Text style={[styles.capacityNum, { color: colors.textPrimary }]}>{formatPHP(weeklyExcess)}</Text>
                  <Text style={[styles.capacityLabel, { color: colors.textMuted }]}>Weekly Power</Text>
                </View>
                <View style={styles.capacityCol}>
                  <Text style={[styles.capacityNum, { color: colors.textPrimary }]}>{formatPHP(monthlyExcess)}</Text>
                  <Text style={[styles.capacityLabel, { color: colors.textMuted }]}>Monthly Power</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accentEmerald }]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>
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
    color: '#55D99A',
    letterSpacing: 1.5,
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
    marginBottom: 6,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102820',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#142F26',
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 14,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#55D99A',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#F4F7F3',
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
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayChipActive: {
    backgroundColor: 'rgba(85, 217, 154, 0.15)',
    borderColor: '#55D99A',
  },
  weekDayChipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9AAFA5',
  },
  weekDayChipTitleActive: {
    color: '#55D99A',
  },
  weekDayChipSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#667A71',
    marginTop: 2,
  },
  weekDayChipSubtitleActive: {
    color: '#55D99A',
  },
  capacityCard: {
    backgroundColor: '#102820',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#142F26',
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
    color: '#55D99A',
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
    color: '#F4F7F3',
  },
  capacityLabel: {
    fontSize: 10,
    color: '#9AAFA5',
    marginTop: 2,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#55D99A',
    borderRadius: 16,
    height: 50,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#07130F',
  },
});
