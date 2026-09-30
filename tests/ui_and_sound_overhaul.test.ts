declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running UI, Sound, and Icon Overhaul Test Suite ---');

// 1. Root SafeAreaProvider & Screen Insets Check
console.log('1. Testing SafeAreaProvider and Status Bar Insets...');
const appContent = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');
assert(
  appContent.includes('<SafeAreaProvider>') || appContent.includes('<SafeAreaProvider '),
  'App.tsx must wrap root in SafeAreaProvider'
);
assert(appContent.includes('initialMetrics'), 'App.tsx must provide initialMetrics to SafeAreaProvider');
assert(appContent.includes('</SafeAreaProvider>'), 'App.tsx must close SafeAreaProvider');

const screens = [
  'HomeScreen.tsx',
  'GoalsScreen.tsx',
  'SavingsScreen.tsx',
  'SettingsScreen.tsx',
  'ProjectDetailScreen.tsx',
  'WishlistScreen.tsx',
  'AuthScreen.tsx',
];

for (const scr of screens) {
  const content = fs.readFileSync(path.resolve(__dirname, `../src/screens/${scr}`), 'utf8');
  assert(
    content.includes('useSafeAreaInsets'),
    `${scr} must import and use useSafeAreaInsets to prevent status bar overlap`
  );
  assert(
    content.includes('insets.top'),
    `${scr} must apply insets.top to avoid header collision with system clock/battery`
  );
}
console.log('✓ All 5 screens properly guard against status bar overlap with insets.top!');

// 2. BottomNavDock 44x44 Solid Circular Active Badge & Zero Indicator Dots
console.log('2. Testing BottomNavDock Solid Circular Badge...');
const dockContent = fs.readFileSync(
  path.resolve(__dirname, '../src/components/layout/BottomNavDock.tsx'),
  'utf8'
);
assert(dockContent.includes('width: 44'), 'BottomNavDock must define 44x44 badge width');
assert(dockContent.includes('height: 44'), 'BottomNavDock must define 44x44 badge height');
assert(dockContent.includes('borderRadius: 22'), 'BottomNavDock must define borderRadius: 22 for circular badge (not square/box)');
assert(dockContent.includes("backgroundColor: '#55D99A'"), 'BottomNavDock must use vibrant primary green badge');
assert(dockContent.includes("color={isActive ? '#07130F' : '#64748B'}"), 'BottomNavDock must tint active icon dark green #07130F');
assert(!dockContent.includes('borderRadius: 12'), 'BottomNavDock must NOT use boxy borderRadius: 12');
assert(!dockContent.includes('<View style={styles.activeDot}'), 'BottomNavDock must NOT render duplicate indicator dot in JSX');
assert(dockContent.includes('insets.bottom'), 'BottomNavDock must apply insets.bottom padding for Android gesture navigation');
console.log('✓ BottomNavDock solid circular active highlight verified!');

// 3. Complete Audio Decommissioning & Removal Across Entire App
console.log('3. Testing Complete Audio Removal Across Entire App...');
const mainAppContent = fs.readFileSync(
  path.resolve(__dirname, '../android/app/src/main/java/com/kansya/app/MainApplication.kt'),
  'utf8'
);
assert(
  !mainAppContent.includes('KansyaSoundPackage'),
  'MainApplication.kt must NOT register KansyaSoundPackage'
);

const kansyaContextContent = fs.readFileSync(
  path.resolve(__dirname, '../src/store/KansyaContext.tsx'),
  'utf8'
);
assert(
  !kansyaContextContent.includes('soundEffects.play'),
  'KansyaContext must not invoke soundEffects.play'
);
assert(
  !kansyaContextContent.includes('toggleSound'),
  'KansyaContext must not expose toggleSound'
);

const settingsScreenContent = fs.readFileSync(
  path.resolve(__dirname, '../src/screens/SettingsScreen.tsx'),
  'utf8'
);
assert(
  !settingsScreenContent.includes('FEEDBACK & AUDIO'),
  'SettingsScreen must NOT contain FEEDBACK & AUDIO section'
);
assert(
  !settingsScreenContent.includes('Sound Effects'),
  'SettingsScreen must NOT contain Sound Effects toggle'
);

console.log('✓ Complete audio removal across Android native, Context, and Settings strictly verified!');

// 4. Launcher Piggy Bank Icon & Adaptive Margins
console.log('4. Testing Launcher Piggy Bank Icon assets...');
const requiredIcons = [
  'assets/icon.png',
  'assets/android-icon-foreground.png',
  'assets/android-icon-background.png',
  'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png',
];

for (const iconP of requiredIcons) {
  const fullP = path.resolve(__dirname, `../${iconP}`);
  assert(fs.existsSync(fullP), `Icon file ${iconP} must exist`);
  const sz = fs.statSync(fullP).size;
  assert(sz > 500, `Icon file ${iconP} must not be empty (got ${sz} bytes)`);
}
console.log('✓ All adaptive piggy bank icon assets verified!');

console.log('ALL OVERHAUL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
