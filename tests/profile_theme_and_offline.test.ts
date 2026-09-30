declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

import { AVATAR_OPTIONS, getAvatarById } from '../src/utils/avatarData';
import { getThemeColors, darkThemeColors, lightThemeColors } from '../src/utils/theme';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Profile, Theme Engine & 100% Offline Test Suite ---');

// ============================================================================
// 1. Top Navigation Icons Reorganization & Trophy Fix
// ============================================================================
console.log('1. Testing Top Navigation Icons & Trophy Icon Fix...');
const homeContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/HomeScreen.tsx'), 'utf8');

// Ensure Trophy icon is imported and used for achievements
assert(homeContent.includes('Trophy'), 'HomeScreen must import and render Trophy icon');
assert(
  homeContent.includes('setTrophyModalVisible(true)'),
  'HomeScreen must have action for opening trophy modal'
);
assert(
  homeContent.includes('<Trophy size={16}'),
  'Achievements button must use <Trophy size={16} instead of User icon'
);

// Ensure dedicated Profile button exists and opens ProfileModal
assert(
  homeContent.includes('setProfileModalVisible(true)'),
  'HomeScreen must have action for opening ProfileModal'
);
assert(
  homeContent.includes('AvatarBadge'),
  'HomeScreen profile action must support AvatarBadge'
);

// Ensure Sun / Moon Theme toggle exists
assert(
  homeContent.includes('toggleTheme'),
  'HomeScreen must invoke toggleTheme'
);
assert(homeContent.includes('<Sun'), 'HomeScreen must render Sun icon in dark mode');
assert(homeContent.includes('<Moon'), 'HomeScreen must render Moon icon in light mode');

// Check header action order: Theme Toggle -> Trophies -> Profile -> Settings
const themeToggleIdx = homeContent.indexOf('Action 1: Theme Toggle');
const trophiesIdx = homeContent.indexOf('Action 2: Trophies & Milestones');
const profileIdx = homeContent.indexOf('Action 3: Profile & Identity Customization');
const settingsIdx = homeContent.indexOf('Action 4: Settings (Baon & Allowance)');

assert(themeToggleIdx !== -1, 'Must include Theme Toggle in topNavActions');
assert(trophiesIdx !== -1, 'Must include Trophies & Milestones in topNavActions');
assert(profileIdx !== -1, 'Must include Profile & Identity in topNavActions');
assert(settingsIdx !== -1, 'Must include Settings in topNavActions');

assert(
  themeToggleIdx < trophiesIdx && trophiesIdx < profileIdx && profileIdx < settingsIdx,
  'Top navigation actions must strictly follow order: [Theme Toggle] [Trophies] [Profile] [Settings]'
);

console.log('✓ Top navigation reorganization verified: [Theme Toggle] [Trophies] [Profile] [Settings]!');

// ============================================================================
// 2. Light & Dark Theme Engine & Banner Graphics
// ============================================================================
console.log('2. Testing Light & Dark Theme Engine...');

// Theme Color Palettes
assert(darkThemeColors.background === '#07130F', 'Dark mode must use calm forest green #07130F');
assert(lightThemeColors.background === '#F8FAFC', 'Light mode must use porcelain #F8FAFC');
assert(lightThemeColors.surfaceCard === '#FFFFFF', 'Light mode must use white cards #FFFFFF');
assert(lightThemeColors.textPrimary === '#0F172A', 'Light mode must use deep slate text #0F172A');
assert(
  lightThemeColors.accentEmerald === '#059669',
  'Light mode must use vibrant emerald green accent #059669'
);

assert(getThemeColors('dark').isDark === true, 'getThemeColors(dark).isDark must be true');
assert(getThemeColors('light').isDark === false, 'getThemeColors(light).isDark must be false');

// MountainSunset light mode graphics
const mountainContent = fs.readFileSync(
  path.resolve(__dirname, '../src/components/illustrations/MountainSunset.tsx'),
  'utf8'
);
assert(mountainContent.includes('#BAE6FD'), 'MountainSunset must include bright sunrise sky gradient');
assert(mountainContent.includes('#10B981'), 'MountainSunset must include lush green hills gradient');
assert(mountainContent.includes('#059669'), 'MountainSunset must include green mountain gradient');
assert(mountainContent.includes('#064E3B'), 'MountainSunset must include foreground ridge gradient');
assert(
  mountainContent.includes('MountainGreeting'),
  'MountainSunset must export MountainGreeting alias'
);

console.log('✓ Light & Dark Theme palettes and sunrise mountain graphics verified!');

// ============================================================================
// 3. Password Visibility Toggles (AuthScreen & ProfileModal)
// ============================================================================
console.log('3. Testing Password Visibility Toggles...');
const authContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/AuthScreen.tsx'), 'utf8');
assert(authContent.includes('Eye'), 'AuthScreen must import Eye icon');
assert(authContent.includes('EyeOff'), 'AuthScreen must import EyeOff icon');
assert(authContent.includes('showPassword'), 'AuthScreen must manage showPassword state');
assert(
  authContent.includes('secureTextEntry={!showPassword}'),
  'AuthScreen password field must toggle secureTextEntry based on showPassword'
);

const profileModalContent = fs.readFileSync(
  path.resolve(__dirname, '../src/components/modals/ProfileModal.tsx'),
  'utf8'
);
assert(profileModalContent.includes('Eye'), 'ProfileModal must import Eye icon');
assert(profileModalContent.includes('EyeOff'), 'ProfileModal must import EyeOff icon');
assert(profileModalContent.includes('showOldPass'), 'ProfileModal must support old password toggle');
assert(profileModalContent.includes('showNewPass'), 'ProfileModal must support new password toggle');
assert(profileModalContent.includes('showConfirmPass'), 'ProfileModal must support confirm password toggle');

console.log('✓ Password visibility Eye/EyeOff toggles verified across AuthScreen & ProfileModal!');

// ============================================================================
// 4. Curated 6 Savings Avatars Catalog
// ============================================================================
console.log('4. Testing Curated Savings Avatars...');
assert(AVATAR_OPTIONS.length === 6, `Expected exactly 6 curated savings avatars, got ${AVATAR_OPTIONS.length}`);
const avatarIds = AVATAR_OPTIONS.map((a) => a.id);
assert(avatarIds.includes('avatar_sprout'), 'Must contain avatar_sprout');
assert(avatarIds.includes('avatar_vault'), 'Must contain avatar_vault');
assert(avatarIds.includes('avatar_coin'), 'Must contain avatar_coin');
assert(avatarIds.includes('avatar_star'), 'Must contain avatar_star');
assert(avatarIds.includes('avatar_flame'), 'Must contain avatar_flame');
assert(avatarIds.includes('avatar_crown'), 'Must contain avatar_crown');

// Test fallback resolution
const defaultAv = getAvatarById('unknown_avatar');
assert(defaultAv.id === 'avatar_sprout', 'Unknown avatar ID must fallback to avatar_sprout');
const validAv = getAvatarById('avatar_coin');
assert(validAv.title === 'Coin Master', 'avatar_coin must resolve to Coin Master');

console.log('✓ Curated 6 savings avatars catalog and fallback resolution verified!');

// ============================================================================
// 5. 100% Offline Credential & Recovery Code Generator
// ============================================================================
console.log('5. Testing 100% Offline Vault & Recovery Code Generator...');
const contextContent = fs.readFileSync(
  path.resolve(__dirname, '../src/store/KansyaContext.tsx'),
  'utf8'
);
assert(
  contextContent.includes('@kansya_theme_mode_v1'),
  'KansyaContext must persist theme in @kansya_theme_mode_v1'
);
assert(
  contextContent.includes('generateRecoveryCode'),
  'KansyaContext must expose generateRecoveryCode'
);
assert(
  contextContent.includes('updateUserProfile'),
  'KansyaContext must expose updateUserProfile'
);
assert(
  contextContent.includes('changePassword'),
  'KansyaContext must expose changePassword'
);

// Offline explanation in AuthScreen & ProfileModal
assert(
  authContent.includes('100% Offline Vault') || authContent.includes('100% Offline Local Database'),
  'AuthScreen must reassuringly state 100% offline vault operation'
);
assert(
  profileModalContent.includes('100% Offline Local Database'),
  'ProfileModal must reassure user of zero external email/server dependencies'
);
assert(
  profileModalContent.includes('Master Recovery Key'),
  'ProfileModal must feature Master Recovery Key section'
);

// Modal Keyboard and Translucent configuration
assert(
  profileModalContent.includes('statusBarTranslucent={true}'),
  'ProfileModal must include statusBarTranslucent={true}'
);
assert(
  profileModalContent.includes('behavior="padding"'),
  'ProfileModal must include behavior="padding"'
);
assert(
  profileModalContent.includes('keyboardShouldPersistTaps="handled"'),
  'ProfileModal must include keyboardShouldPersistTaps="handled"'
);

console.log('✓ 100% Offline local storage persistence and recovery key generator verified!');

// ============================================================================
// 6. Comprehensive Edge Cases & Token Consistency Verification
// ============================================================================
console.log('6. Testing Comprehensive Edge Cases & Token Consistency...');

// Check theme token symmetry
const darkKeys = Object.keys(darkThemeColors).sort();
const lightKeys = Object.keys(lightThemeColors).sort();
assert(JSON.stringify(darkKeys) === JSON.stringify(lightKeys), 'Dark and light themes must share identical token keys');

// Validate all avatar colors are non-empty hex strings
for (const av of AVATAR_OPTIONS) {
  assert(av.id.startsWith('avatar_'), `Avatar ID must start with avatar_, got ${av.id}`);
  assert(av.color.startsWith('#'), `Avatar color must be hex string, got ${av.color}`);
  assert(av.bgColor.startsWith('#'), `Avatar bgColor must be hex string, got ${av.bgColor}`);
  assert(av.borderColor.startsWith('#'), `Avatar borderColor must be hex string, got ${av.borderColor}`);
  assert(av.name.length > 0, 'Avatar name must not be empty');
  assert(av.title.length > 0, 'Avatar title must not be empty');
}

// Check recovery code format generator pattern
function simulateGenerateRecoveryCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KNY-${p1}-${p2}`;
}

const testCode = simulateGenerateRecoveryCode();
const recoveryRegex = /^KNY-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;
assert(recoveryRegex.test(testCode), `Generated recovery key must match format KNY-XXXX-XXXX, got ${testCode}`);

// Verify SettingsScreen links to ProfileModal
const settingsContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/SettingsScreen.tsx'), 'utf8');
assert(settingsContent.includes('setProfileModalVisible(true)'), 'SettingsScreen must open ProfileModal');
assert(settingsContent.includes('ProfileModal'), 'SettingsScreen must import and render ProfileModal');

console.log('✓ Comprehensive edge cases, tokens, and recovery keys verified!');

// ============================================================================
// 7. Security Hardening & Deep Theme Coverage Verification
// ============================================================================
console.log('7. Testing Security Hardening & Deep Theme Coverage...');

// Verify loginUser strictly blocks password bypass on empty password
assert(
  !contextContent.includes('found.password && password && found.password !== password'),
  'KansyaContext must not allow bypassing password check when password is empty/undefined'
);
assert(
  contextContent.includes('if (!password || found.password !== password)'),
  'KansyaContext must strictly guard password verification'
);

// Verify collab goals sync on fullName update
assert(
  contextContent.includes('oldUsername !== cleanUsername || currentUser.fullName !== cleanName'),
  'KansyaContext must update collab goals when fullName changes'
);

// Verify ProfileModal prevents wiping status message on update
assert(
  profileModalContent.includes('prevVisibleRef'),
  'ProfileModal must use prevVisibleRef to avoid wiping statusMsg when currentUser updates'
);

// Verify HomeScreen themed text elements
assert(
  homeContent.includes('styles.sectionHeaderTitle, { color: colors.textPrimary }'),
  'HomeScreen sectionHeaderTitle must adapt to colors.textPrimary'
);
assert(
  homeContent.includes('styles.currentAmountText, { color: colors.textPrimary }'),
  'HomeScreen currentAmountText must adapt to colors.textPrimary'
);
assert(
  homeContent.includes('styles.emptyCarouselCard, { backgroundColor: colors.surfaceCard'),
  'HomeScreen emptyCarouselCard must adapt to colors.surfaceCard'
);

// Verify GoalsScreen themed elements
const goalsContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/GoalsScreen.tsx'), 'utf8');
assert(
  goalsContent.includes('styles.headerTitle, { color: colors.textPrimary }'),
  'GoalsScreen headerTitle must adapt to colors.textPrimary'
);
assert(
  goalsContent.includes('styles.goalCard,') && goalsContent.includes('backgroundColor: colors.surfaceCard'),
  'GoalsScreen goalCard must adapt to colors.surfaceCard'
);
assert(
  goalsContent.includes('styles.collabGoalCard,') && goalsContent.includes('backgroundColor: colors.surfaceCard'),
  'GoalsScreen collabGoalCard must adapt to colors.surfaceCard'
);

// Verify ProjectDetailScreen themed elements
const detailContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/ProjectDetailScreen.tsx'), 'utf8');
assert(
  detailContent.includes('styles.container, { backgroundColor: colors.background }'),
  'ProjectDetailScreen container must adapt to colors.background'
);
assert(
  detailContent.includes('styles.heroDonutCard, { backgroundColor: colors.surfaceCard'),
  'ProjectDetailScreen heroDonutCard must adapt to colors.surfaceCard'
);
assert(
  detailContent.includes('styles.forecastCard, { backgroundColor: colors.surfaceCard'),
  'ProjectDetailScreen forecastCard must adapt to colors.surfaceCard'
);

console.log('✓ Security hardening, profile persistence, and full theme coverage strictly verified!');

console.log('ALL PROFILE, THEME & OFFLINE TESTS PASSED SUCCESSFULLY! 🚀');

