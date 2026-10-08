import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHomeIcon, CustomGoalIcon, CustomWishlistIcon, CustomMoreIcon } from '../illustrations/CustomIcons';
import { triggerLightHaptic } from '../../utils/haptics';
import { playTapSound } from '../../services/audioService';
import { useKansya } from '../../store/KansyaContext';

export type TabKey = 'home' | 'goals' | 'savings' | 'settings';

interface BottomNavDockProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { isDark } = useKansya();
  const insets = useSafeAreaInsets();
  const tabs: Array<{ key: TabKey; label: string; icon: any }> = [
    { key: 'home', label: 'Home', icon: CustomHomeIcon },
    { key: 'goals', label: 'Goals', icon: CustomGoalIcon },
    { key: 'savings', label: 'Wishlist', icon: CustomWishlistIcon },
    { key: 'settings', label: 'More', icon: CustomMoreIcon },
  ];

  const scaleAnims = useRef<Record<TabKey, Animated.Value>>({
    home: new Animated.Value(1),
    goals: new Animated.Value(1),
    savings: new Animated.Value(1),
    settings: new Animated.Value(1),
  }).current;

  const handlePressIn = (tabKey: TabKey) => {
    Animated.spring(scaleAnims[tabKey], {
      toValue: 0.97,
      tension: 100,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (tabKey: TabKey) => {
    Animated.spring(scaleAnims[tabKey], {
      toValue: 1,
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (tabKey: TabKey) => {
    triggerLightHaptic();
    playTapSound();
    if (tabKey !== activeTab) {
      onTabChange(tabKey);
    }
  };

  return (
    <View
      style={[
        styles.dockWrapper,
        {
          paddingBottom: Math.max(insets.bottom, 6),
          backgroundColor: isDark ? '#07130F' : '#FFFFFF',
          borderTopColor: isDark ? '#142F26' : '#E2E8F0',
        },
      ]}
    >
      <View style={styles.dockContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComp = tab.icon;

          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handlePress(tab.key)}
              onPressIn={() => handlePressIn(tab.key)}
              onPressOut={() => handlePressOut(tab.key)}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale: scaleAnims[tab.key] }],
                  },
                ]}
              >
                {/* 44x44 Solid Vibrant Emerald Circular Badge */}
                <View
                  style={[
                    styles.iconWrapper,
                    isActive && styles.activeIconWrapper,
                  ]}
                >
                  <IconComp
                    size={20}
                    color={isActive ? '#07130F' : '#64748B'}
                    strokeWidth={isActive ? 2.5 : 2}
                    filled={isActive}
                  />
                </View>

                {/* Tab Label */}
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel, isActive && { color: isDark ? '#55D99A' : '#059669' }]}>
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// Also export alias if imported as BottomDock
export { BottomNavDock as BottomDock };

const styles = StyleSheet.create({
  dockWrapper: {
    backgroundColor: '#07130F',
    borderTopWidth: 1,
    borderTopColor: '#142F26',
    paddingBottom: 6,
    paddingTop: 6,
  },
  dockContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconWrapper: {
    backgroundColor: '#55D99A',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0,
    shadowColor: '#55D99A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#55D99A',
    fontWeight: '700',
  },
});
