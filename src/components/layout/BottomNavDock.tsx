import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, CircleDollarSign, Settings, Target, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { PlantSprout } from '../illustrations/PlantSprout';
import { triggerLightHaptic } from '../../utils/haptics';
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
    { key: 'home', label: 'Home', icon: PlantSprout },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'savings', label: 'Wishlist', icon: Bookmark },
    { key: 'settings', label: 'More', icon: MoreHorizontal },
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
      tension: 320,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (tabKey: TabKey) => {
    Animated.spring(scaleAnims[tabKey], {
      toValue: 1,
      tension: 300,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (tabKey: TabKey) => {
    triggerLightHaptic();
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
          backgroundColor: isDark ? '#0B111E' : '#FFFFFF',
          borderTopColor: isDark ? '#1A2333' : '#E2E8F0',
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
                    color={isActive ? '#0B111E' : '#64748B'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>

                {/* Tab Label */}
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
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
    backgroundColor: '#0B111E',
    borderTopWidth: 1,
    borderTopColor: '#1A2333',
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
    backgroundColor: '#10B981',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 0,
    shadowColor: '#10B981',
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
    color: '#10B981',
    fontWeight: '700',
  },
});
