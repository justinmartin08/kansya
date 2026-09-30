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
  Edit2,
  Archive,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKansya } from '../store/KansyaContext';
import { getThemeColors, KansyaDesign } from '../utils/theme';
import { formatPHP, getProjectProgress } from '../utils/calculations';
import { WishlistProject } from '../types';
import { PROJECT_IMAGES, getProjectImage } from '../utils/projectImages';
import { KANSYA_MOCKUP_PROJECTS } from '../store/defaultData';
import { KProgressBar, KBadge, KEmptyState } from '../components/design/DesignSystem';
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
  const [editItem, setEditItem] = useState<WishlistProject | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');

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

  const handleOpenEdit = (item: WishlistProject) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditPrice(item.targetPrice.toString());
    setActionItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const price = parseInt(editPrice.replace(/[^0-9]/g, ''), 10);
    if (!editTitle.trim() || !price || price <= 0) return;
    await updateProject(editItem.id, {
      title: editTitle.trim(),
      targetPrice: price,
    });
    setEditItem(null);
  };

  const handleArchiveItem = async (item: WishlistProject) => {
    await updateProject(item.id, {
      completedAt: item.completedAt ? undefined : new Date().toISOString(),
    });
    setActionItem(null);
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
            style={[styles.headerCircleBtn, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}
          >
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Wishlist
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAddModalVisible(true)}
            style={[styles.headerCircleBtn, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}
          >
            <Plus size={18} color={colors.accentEmerald} strokeWidth={2.4} />
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
          <View style={[styles.segmentedBar, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveFilter('all')}
              style={[
                styles.segmentTab,
                activeFilter === 'all' && [styles.segmentTabActive, { backgroundColor: colors.accentEmerald }],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: colors.textSecondary },
                  activeFilter === 'all' && [styles.segmentTextActive, { color: isDark ? '#07130F' : '#FFFFFF' }],
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
                activeFilter === 'goal' && [styles.segmentTabActive, { backgroundColor: colors.accentEmerald }],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: colors.textSecondary },
                  activeFilter === 'goal' && [styles.segmentTextActive, { color: isDark ? '#07130F' : '#FFFFFF' }],
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
                activeFilter === 'wishlist' && [styles.segmentTabActive, { backgroundColor: colors.accentEmerald }],
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: colors.textSecondary },
                  activeFilter === 'wishlist' && [styles.segmentTextActive, { color: isDark ? '#07130F' : '#FFFFFF' }],
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
          {filteredItems.length === 0 ? (
            <KEmptyState
              title="Nothing here yet."
              subtitle="What's something you've been wanting?"
              actionTitle="Add to wishlist"
              onAction={() => setAddModalVisible(true)}
            />
          ) : (
            filteredItems.map((item) => {
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
                    { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                  ]}
                >
                  {/* Thumbnail */}
                  <View style={[styles.itemThumbWrapper, { backgroundColor: colors.surfaceCardSecondary, borderColor: colors.border }]}>
                    <Image source={imgSource} style={styles.itemThumb} />
                  </View>

                  {/* Details Column */}
                  <View style={styles.itemInfoCol}>
                    <View style={styles.itemHeaderLine}>
                      <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.itemRightRow}>
                        <KBadge
                          label={item.completedAt ? 'Purchased' : isInProgress ? 'In Progress' : 'Not Started'}
                          variant={item.completedAt ? 'completed' : isInProgress ? 'progress' : 'notStarted'}
                        />
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setActionItem(item)}
                          style={styles.moreBtn}
                          accessibilityLabel="More actions"
                        >
                          <MoreVertical size={16} color={colors.textMuted} />
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
                          color={isInProgress ? colors.accentEmerald : (isDark ? '#142F26' : '#E2E8F0')}
                        />
                      </View>
                      <Text style={[styles.itemPercentText, { color: isInProgress ? colors.accentEmerald : colors.textMuted }]}>
                        {clampedPercent}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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

          <View style={[styles.sheetContent, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Add to Wishlist</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceCardSecondary }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetBody}
            >
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>What are you dreaming of?</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                placeholder="e.g. Noise-Cancelling Headphones"
                placeholderTextColor={colors.textMuted}
                value={newItemTitle}
                onChangeText={setNewItemTitle}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Estimated Price (₱)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textMuted}
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
                  { backgroundColor: colors.accentEmerald },
                  (!newItemTitle.trim() || !newItemPrice.trim() || isSubmitting) && styles.createItemBtnDisabled,
                ]}
              >
                <Text style={[styles.createItemBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>
                  {isSubmitting ? 'Adding...' : 'Add to Wishlist'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================ */}
      {/* EDIT WISHLIST ITEM MODAL */}
      {/* ================================================================ */}
      {editItem && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          statusBarTranslucent={true}
          onRequestClose={() => setEditItem(null)}
        >
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setEditItem(null)}
            />

            <View style={[styles.sheetContent, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Edit Wishlist Item</Text>
                <TouchableOpacity
                  onPress={() => setEditItem(null)}
                  style={[styles.sheetCloseBtn, { backgroundColor: colors.surfaceCardSecondary }]}
                >
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetBody}
              >
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Item Name</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                  placeholder="e.g. Gaming Laptop"
                  placeholderTextColor={colors.textMuted}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Target Price (₱)</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                  placeholder="e.g. 50000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSaveEdit}
                  disabled={!editTitle.trim() || !editPrice.trim()}
                  style={[
                    styles.createItemBtn,
                    { backgroundColor: colors.accentEmerald },
                    (!editTitle.trim() || !editPrice.trim()) && styles.createItemBtnDisabled,
                  ]}
                >
                  <Text style={[styles.createItemBtnText, { color: isDark ? '#07130F' : '#FFFFFF' }]}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

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
            <View style={[styles.actionSheetContainer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
              <Text style={[styles.actionSheetTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {actionItem.title}
              </Text>
              <Text style={[styles.actionSheetPrice, { color: colors.textSecondary }]}>
                Target: {formatPHP(actionItem.targetPrice)}
              </Text>

              {/* Action 1: Add Savings */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setDepositItem(actionItem);
                  setActionItem(null);
                }}
                style={[styles.actionSheetRow, { borderTopColor: colors.border }]}
              >
                <Plus size={18} color={colors.accentEmerald} />
                <Text style={[styles.actionSheetRowText, { color: colors.textPrimary }]}>Add Savings</Text>
              </TouchableOpacity>

              {/* Action 2: Convert to Active Goal */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleConvertToGoal(actionItem)}
                style={[styles.actionSheetRow, { borderTopColor: colors.border }]}
              >
                <ArrowUpRight size={18} color={colors.accentEmerald} />
                <Text style={[styles.actionSheetRowText, { color: colors.textPrimary }]}>Focus as Active Goal</Text>
              </TouchableOpacity>

              {/* Action 3: Edit Item */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenEdit(actionItem)}
                style={[styles.actionSheetRow, { borderTopColor: colors.border }]}
              >
                <Edit2 size={18} color={colors.accentEmerald} />
                <Text style={[styles.actionSheetRowText, { color: colors.textPrimary }]}>Edit Item</Text>
              </TouchableOpacity>

              {/* Action 4: Mark as Purchased */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMarkPurchased(actionItem)}
                style={[styles.actionSheetRow, { borderTopColor: colors.border }]}
              >
                <CheckCircle2 size={18} color="#EBCB72" />
                <Text style={[styles.actionSheetRowText, { color: colors.textPrimary }]}>Mark as Purchased</Text>
              </TouchableOpacity>

              {/* Action 5: Archive / Unarchive */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleArchiveItem(actionItem)}
                style={[styles.actionSheetRow, { borderTopColor: colors.border }]}
              >
                <Archive size={18} color={colors.textSecondary} />
                <Text style={[styles.actionSheetRowText, { color: colors.textPrimary }]}>
                  {actionItem.completedAt ? 'Restore from Archive' : 'Archive Item'}
                </Text>
              </TouchableOpacity>

              {/* Action 6: Delete */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleDeleteItem(actionItem)}
                style={[styles.actionSheetRow, styles.actionSheetRowDanger, { borderTopColor: 'rgba(239, 68, 68, 0.25)' }]}
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
