import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { X, ArrowDownLeft } from 'lucide-react-native';
import { useKansya } from '../../store/KansyaContext';
import { formatPHP } from '../../utils/calculations';
import { getThemeColors, KansyaDesign } from '../../utils/theme';
import { KEmptyState } from '../design/DesignSystem';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GroupedDeposits {
  dateLabel: string;
  items: Array<{
    id: string;
    title: string;
    time: string;
    amount: number;
    note?: string;
  }>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose }) => {
  const { deposits, projects, totalSavedAcrossAll, theme } = useKansya();
  const colors = getThemeColors(theme);

  const projectMap = new Map(projects.map((p) => [p.id, p.title]));

  // Mock sample deposits if deposits list is currently empty
  const displayDeposits = deposits.length > 0
    ? deposits
    : [
        {
          id: 'h-1',
          projectId: 'mockup-laptop',
          amount: 100,
          note: 'Quick deposit',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'h-2',
          projectId: 'mockup-laptop',
          amount: 200,
          note: 'Quick deposit',
          timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        },
        {
          id: 'h-3',
          projectId: 'mockup-laptop',
          amount: 50,
          note: 'Goal adjustment',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ];

  // Group by date: TODAY, YESTERDAY, or MMM D, YYYY
  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groupsMap = new Map<string, GroupedDeposits>();

  displayDeposits.forEach((dep) => {
    const depDate = new Date(dep.timestamp);
    const dateKey = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate()).toDateString();

    let dateLabel = depDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (dateKey === todayStr) {
      dateLabel = 'TODAY';
    } else if (dateKey === yesterdayStr) {
      dateLabel = 'YESTERDAY';
    }

    const timeStr = depDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

    const title = dep.note || (projectMap.get(dep.projectId) ? `Goal: ${projectMap.get(dep.projectId)}` : 'Quick deposit');

    if (!groupsMap.has(dateLabel)) {
      groupsMap.set(dateLabel, { dateLabel, items: [] });
    }

    groupsMap.get(dateLabel)!.items.push({
      id: dep.id,
      title,
      time: timeStr,
      amount: dep.amount,
      note: dep.note,
    });
  });

  const groupedList = Array.from(groupsMap.values());

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
              <Text style={styles.headerSubtitle}>TRANSACTION LEDGER</Text>
              <Text style={styles.headerTitle}>Savings History</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#9AAFA5" />
            </TouchableOpacity>
          </View>

          {/* Total Saved Sub-banner */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryLabel}>Total Accumulated Savings</Text>
            <Text style={styles.summaryAmount}>
              {formatPHP(totalSavedAcrossAll > 0 ? totalSavedAcrossAll : 525)}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {groupedList.length === 0 ? (
              <KEmptyState
                title="No history recorded yet"
                subtitle="Every small step towards your goals will quietly appear here."
              />
            ) : (
              groupedList.map((group) => (
                <View key={group.dateLabel} style={styles.dateGroup}>
                  <Text style={styles.dateGroupHeader}>{group.dateLabel}</Text>
                  <View style={styles.groupCard}>
                    {group.items.map((item, idx) => (
                      <View
                        key={item.id}
                        style={[
                          styles.transactionRow,
                          idx < group.items.length - 1 && styles.rowDivider,
                        ]}
                      >
                        <View style={styles.iconCircle}>
                          <ArrowDownLeft size={16} color="#55D99A" strokeWidth={2.4} />
                        </View>
                        <View style={styles.detailsCol}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.amountPositive}>
                          +{formatPHP(item.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
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
    padding: 20,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.sm,
    borderWidth: 1,
    borderColor: '#142F26',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9AAFA5',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#55D99A',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateGroupHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#667A71',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: '#102820',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#142F26',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(85, 217, 154, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F7F3',
  },
  itemTime: {
    fontSize: 11,
    color: '#667A71',
    marginTop: 2,
  },
  amountPositive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#55D99A',
  },
});
