import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  Bookmark,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { getThemeColors, KansyaDesign } from '../utils/theme';
import { formatPHP, getProjectProgress } from '../utils/calculations';
import { WishlistProject } from '../types';
import { PROJECT_IMAGES, getProjectImage } from '../utils/projectImages';
import { KANSYA_MOCKUP_PROJECTS } from '../store/defaultData';
import { KProgressBar, KBadge } from '../components/design/DesignSystem';
import { QuickDepositModal } from '../components/modals/QuickDepositModal';

interface WishlistScreenProps {
  onBack?: () => void;
  onOpenProjectDetail?: (projectId: string) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onBack,
  onOpenProjectDetail,
}) => {
  const {
    projects,
    createProject,
    deleteProject,
    updateProject,
    addDeposit,
    setActiveProjectId,
    theme,
    isDark,
  } = useKansya();

  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

  // Segment filter: 'all' | 'goal' | 'wishlist'
  const [activeFilter, setActiveFilter] = useState<'all' | 'goal' | 'wishlist'>('all');

  // Modals state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<WishlistProject['category']>('gadget');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item for action sheet & deposit
  const [actionItem, setActionItem] = useState<WishlistProject | null>(null);
  const [depositItem, setDepositItem] = useState<WishlistProject | null>(null);

  // Combined list of projects: user-created or default Kansya mockup items
  const allItems: WishlistProject[] = projects.length > 0 ? projects : KANSYA_MOCKUP_PROJECTS;

  const filteredItems = allItems.filter((item) => {
    const isStarted = item.currentAmount > 0;
    if (activeFilter === 'goal') return isStarted;
    if (activeFilter === 'wishlist') return !isStarted;
    return true;
  });

  const handleCreateWishlistItem = async () => {
    const price = parseInt(newItemPrice.replace(/[^0-9]/g, ''), 10);
    if (!newItemTitle.trim() || !price || price <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createProject(newItemTitle.trim(), price, newItemCategory);
      setNewItemTitle('');
      setNewItemPrice('');
      setAddModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToGoal = async (item: WishlistProject) => {
    setActiveProjectId(item.id);
    setActionItem(null);
    if (onOpenProjectDetail) {
      onOpenProjectDetail(item.id);
    }
  };

  const handleMarkPurchased = async (item: WishlistProject) => {
    await updateProject(item.id, {
      currentAmount: item.targetPrice,
      completedAt: new Date().toISOString(),
    });
    setActionItem(null);
  };

  const handleDeleteItem = async (item: WishlistProject) => {
    await deleteProject(item.id);
    setActionItem(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.kansyaBg || colors.background }]}>
      <ScrollView
        style={[styles.scrollArea, { backgroundColor: colors.kansyaBg || colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, statusBarHeight, 12) + 6 },
        ]}
      >
        {/* ================================================================ */}
        {/* 1. TOP HEADER (< Wishlist +) */}
        {/* ================================================================ */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack ? onBack : () => {}}
            style={[styles.headerCircleBtn, { backgroundColor: '#102820', borderColor: '#142F26' }]}
          >
            <ArrowLeft size={18} color="#F4F7F3" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Wishlist
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAddModalVisible(true)}
            style={[styles.headerCircleBtn, { backgroundColor: '#102820', borderColor: '#142F26' }]}
          >
            <Plus size={18} color="#55D99A" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* ================================================================ */}
        {/* 2. HERO BANNER ("Dream it. Save for it. Make it happen.") */}
        {/* ================================================================ */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={PROJECT_IMAGES.wishlist_hero}
            style={styles.heroBannerImage}
          />
        </View>

        {/* ================================================================ */}
        {/* 3. SEGMENTED FILTER PILLS (All | Goal | Wishlist) */}
        {/* ================================================================ */}
        <View style={styles.segmentedContainer}>
          <View style={styles.segmentedBar}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveFilter('all')}
              style={[
                styles.segmentTab,
                activeFilter === 'all' && styles.segmentTabActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeFilter === 'all' && styles.segmentTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveFilter('goal')}
              style={[
                styles.segmentTab,
                activeFilter === 'goal' && styles.segmentTabActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeFilter === 'goal' && styles.segmentTextActive,
                ]}
              >
                Goal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveFilter('wishlist')}
              style={[
                styles.segmentTab,
                activeFilter === 'wishlist' && styles.segmentTabActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeFilter === 'wishlist' && styles.segmentTextActive,
                ]}
              >
                Wishlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================================ */}
        {/* 4. WISHLIST ITEM CARDS */}
        {/* ================================================================ */}
        <View style={styles.itemsListContainer}>
          {filteredItems.map((item) => {
            const { clampedPercent } = getProjectProgress(item.currentAmount, item.targetPrice);
            const isInProgress = item.currentAmount > 0;
            const imgSource = getProjectImage(item.imageKey, item.category);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => {
                  if (onOpenProjectDetail) {
                    onOpenProjectDetail(item.id);
                  }
                }}
                style={[
                  styles.itemCard,
                  { backgroundColor: '#0D211B', borderColor: '#142F26' },
                ]}
              >
                {/* Thumbnail */}
                <View style={styles.itemThumbWrapper}>
                  <Image source={imgSource} style={styles.itemThumb} />
                </View>

                {/* Details Column */}
                <View style={styles.itemInfoCol}>
                  <View style={styles.itemHeaderLine}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.itemRightRow}>
                      <KBadge
                        label={isInProgress ? 'In Progress' : 'Not Started'}
                        variant={isInProgress ? 'progress' : 'notStarted'}
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setActionItem(item)}
                        style={styles.moreBtn}
                        accessibilityLabel="More actions"
                      >
                        <MoreVertical size={16} color="#667A71" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.itemPriceText, { color: colors.textSecondary }]}>
                    {formatPHP(item.currentAmount)} / {formatPHP(item.targetPrice)}
                  </Text>

                  {/* Progress Bar + % */}
                  <View style={styles.itemProgressRow}>
                    <View style={styles.itemProgressBarWrap}>
                      <KProgressBar
                        progress={clampedPercent}
                        height={4}
                        color={isInProgress ? '#55D99A' : '#142F26'}
                      />
                    </View>
                    <Text style={[styles.itemPercentText, { color: isInProgress ? '#55D99A' : '#667A71' }]}>
                      {clampedPercent}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================================================================ */}
        {/* 5. ATMOSPHERIC FOOTER ("Not just money, but a better you.") */}
        {/* ================================================================ */}
        <View style={styles.footerBannerContainer}>
          <Image
            source={PROJECT_IMAGES.wishlist_footer}
            style={styles.footerBannerImage}
          />
        </View>
      </ScrollView>

      {/* ================================================================ */}
      {/* ADD WISHLIST ITEM MODAL */}
      {/* ================================================================ */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          />

          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add to Wishlist</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.sheetCloseBtn}
              >
                <X size={18} color="#9AAFA5" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetBody}
            >
              <Text style={styles.fieldLabel}>What are you dreaming of?</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Noise-Cancelling Headphones"
                placeholderTextColor="#667A71"
                value={newItemTitle}
                onChangeText={setNewItemTitle}
              />

              <Text style={styles.fieldLabel}>Estimated Price (₱)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 5000"
                placeholderTextColor="#667A71"
                keyboardType="numeric"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCreateWishlistItem}
                disabled={!newItemTitle.trim() || !newItemPrice.trim() || isSubmitting}
                style={[
                  styles.createItemBtn,
                  (!newItemTitle.trim() || !newItemPrice.trim() || isSubmitting) && styles.createItemBtnDisabled,
                ]}
              >
                <Text style={styles.createItemBtnText}>
                  {isSubmitting ? 'Adding...' : 'Add to Wishlist'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================ */}
      {/* ACTION SHEET MODAL FOR ITEM */}
      {/* ================================================================ */}
      {actionItem && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setActionItem(null)}
        >
          <TouchableOpacity
            style={styles.actionSheetOverlay}
            activeOpacity={1}
            onPress={() => setActionItem(null)}
          >
            <View style={styles.actionSheetContainer}>
              <Text style={styles.actionSheetTitle} numberOfLines={1}>
                {actionItem.title}
              </Text>
              <Text style={styles.actionSheetPrice}>
                Target: {formatPHP(actionItem.targetPrice)}
              </Text>

              {/* Action 1: Add Savings */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setDepositItem(actionItem);
                  setActionItem(null);
                }}
                style={styles.actionSheetRow}
              >
                <Plus size={18} color="#55D99A" />
                <Text style={styles.actionSheetRowText}>Add Savings</Text>
              </TouchableOpacity>

              {/* Action 2: Convert to Active Goal */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleConvertToGoal(actionItem)}
                style={styles.actionSheetRow}
              >
                <ArrowUpRight size={18} color="#9FC7A9" />
                <Text style={styles.actionSheetRowText}>Focus as Active Goal</Text>
              </TouchableOpacity>

              {/* Action 3: Mark as Purchased */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMarkPurchased(actionItem)}
                style={styles.actionSheetRow}
              >
                <CheckCircle2 size={18} color="#EBCB72" />
                <Text style={styles.actionSheetRowText}>Mark as Purchased</Text>
              </TouchableOpacity>

              {/* Action 4: Delete */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleDeleteItem(actionItem)}
                style={[styles.actionSheetRow, styles.actionSheetRowDanger]}
              >
                <Trash2 size={18} color="#EF4444" />
                <Text style={[styles.actionSheetRowText, { color: '#EF4444' }]}>
                  Remove from Wishlist
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Quick Deposit Modal */}
      {depositItem && (
        <QuickDepositModal
          visible={true}
          project={depositItem}
          onClose={() => setDepositItem(null)}
          onDeposit={async (amt, note) => {
            await addDeposit(depositItem.id, amt, note);
            setDepositItem(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07130F',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  /* 1. Header Bar */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  /* 2. Hero Banner */
  heroBannerContainer: {
    width: '100%',
    height: 155,
    borderRadius: KansyaDesign.radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* 3. Segmented Filter */
  segmentedContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#0D211B',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 3,
    width: '100%',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: KansyaDesign.radius.sm,
  },
  segmentTabActive: {
    backgroundColor: '#A7F3C5',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9AAFA5',
  },
  segmentTextActive: {
    color: '#07130F',
    fontWeight: '700',
  },

  /* 4. Wishlist Item Cards */
  itemsListContainer: {
    gap: 10,
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: KansyaDesign.radius.md,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  itemThumbWrapper: {
    width: 52,
    height: 52,
    borderRadius: KansyaDesign.radius.sm,
    backgroundColor: '#102820',
    borderWidth: 1,
    borderColor: '#142F26',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfoCol: {
    flex: 1,
  },
  itemHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  itemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moreBtn: {
    padding: 2,
  },
  itemPriceText: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  itemProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemProgressBarWrap: {
    flex: 1,
  },
  itemPercentText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 26,
    textAlign: 'right',
  },

  /* 5. Footer Banner */
  footerBannerContainer: {
    width: '100%',
    height: 95,
    borderRadius: KansyaDesign.radius.md,
    overflow: 'hidden',
  },
  footerBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* Add Item Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 19, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#0D211B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 24,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F7F3',
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#102820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9AAFA5',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#102820',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#142F26',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F4F7F3',
    fontSize: 14,
    marginBottom: 16,
  },
  createItemBtn: {
    backgroundColor: '#55D99A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createItemBtnDisabled: {
    opacity: 0.5,
  },
  createItemBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#07130F',
  },

  /* Action Sheet */
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  actionSheetContainer: {
    backgroundColor: '#0D211B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#142F26',
    padding: 18,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F7F3',
  },
  actionSheetPrice: {
    fontSize: 12,
    color: '#9AAFA5',
    marginBottom: 16,
    marginTop: 2,
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#142F26',
    gap: 12,
  },
  actionSheetRowDanger: {
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionSheetRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F7F3',
  },
});
