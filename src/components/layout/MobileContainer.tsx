import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Wifi, Battery, Signal } from 'lucide-react-native';

interface MobileContainerProps {
  children: ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const isWeb = Platform.OS === 'web';

  if (!isWeb) {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  return (
    <View style={styles.webBackdrop}>
      {/* Device Frame */}
      <View style={styles.phoneFrame}>
        {/* Dynamic Island / Bezel Notch & Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.notchPill} />
          <View style={styles.statusIcons}>
            <Signal size={12} color="#FFFFFF" strokeWidth={2.5} style={styles.statusIcon} />
            <Wifi size={13} color="#FFFFFF" strokeWidth={2.5} style={styles.statusIcon} />
            <Battery size={14} color="#FFFFFF" strokeWidth={2.5} style={styles.statusIcon} />
          </View>
        </View>

        {/* Inner Phone Content */}
        <View style={styles.phoneContent}>
          {children}
        </View>

        {/* Home Indicator Bar */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: '#07130F',
  },
  webBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#05080F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  phoneFrame: {
    width: 390,
    height: '100%',
    maxHeight: 844,
    backgroundColor: '#07130F',
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#142F26',
    overflow: 'hidden',
    shadowColor: '#00F5A0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  statusBar: {
    height: 44,
    backgroundColor: '#07130F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  statusTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  notchPill: {
    width: 80,
    height: 18,
    backgroundColor: '#030712',
    borderRadius: 12,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 6,
  },
  phoneContent: {
    flex: 1,
    backgroundColor: '#07130F',
    position: 'relative',
    overflow: 'hidden',
  },
  homeIndicatorContainer: {
    height: 20,
    backgroundColor: '#07130F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 130,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
});
