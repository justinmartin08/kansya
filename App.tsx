import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { KansyaProvider, useKansya } from './src/store/KansyaContext';
import { MobileContainer } from './src/components/layout/MobileContainer';
import { BottomNavDock, TabKey } from './src/components/layout/BottomNavDock';
import { HomeScreen } from './src/screens/HomeScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { SavingsScreen } from './src/screens/SavingsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { getThemeColors } from './src/utils/theme';

function MainNavigator() {
  const { currentUser, isLoaded, theme, isDark } = useKansya();
  const colors = getThemeColors(theme);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const transYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    transYAnim.setValue(4);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(transYAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, selectedProjectId, currentUser, theme]);

  const handleOpenDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackFromDetail = () => {
    setSelectedProjectId(null);
  };

  const handleTabChange = (tab: TabKey) => {
    setSelectedProjectId(null);
    setActiveTab(tab);
  };

  // While checking persisted session from storage
  if (!isLoaded) {
    return <View style={[styles.loadingContainer, { backgroundColor: colors.background }]} />;
  }

  // Not signed in -> show AuthScreen (Welcome, Register & Sign In)
  if (!currentUser) {
    return (
      <MobileContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthScreen />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.contentArea, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.screenTransitionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: transYAnim }],
            },
          ]}
        >
          {selectedProjectId ? (
            <ProjectDetailScreen
              projectId={selectedProjectId}
              onBack={handleBackFromDetail}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  onOpenProjectDetail={handleOpenDetail}
                  onNavigateTab={handleTabChange}
                />
              )}
              {activeTab === 'goals' && (
                <GoalsScreen onOpenProjectDetail={handleOpenDetail} />
              )}
              {activeTab === 'savings' && <SavingsScreen />}
              {activeTab === 'settings' && <SettingsScreen />}
            </>
          )}
        </Animated.View>
      </View>

      {/* 4-Tab Bottom Dock */}
      {!selectedProjectId && (
        <BottomNavDock activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </MobileContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KansyaProvider>
        <MainNavigator />
      </KansyaProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#0B111E',
  },
  screenTransitionContainer: {
    flex: 1,
  },
});
