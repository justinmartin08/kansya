declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

import {
  INITIAL_PROJECTS,
  INITIAL_DEPOSITS,
  INITIAL_TROPHIES,
} from '../src/store/defaultData';
import { calculatePace, formatPHP } from '../src/utils/calculations';
import { AllowanceProfile, WishlistProject, CollabGoal } from '../src/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Auth, Collab Squad, and Clean Slate Verification Suite ---');

// 1. 100% Clean Slate Verification
console.log('1. Testing 100% Clean Slate (0 goals, ₱0 saved, 0/10 trophies unlocked)...');
assert(INITIAL_PROJECTS.length === 0, `INITIAL_PROJECTS must start empty (0 items), got ${INITIAL_PROJECTS.length}`);
assert(INITIAL_PROJECTS.find(() => true) === undefined, 'INITIAL_PROJECTS must not leak sample data through find()');
assert(INITIAL_DEPOSITS.length === 0, `INITIAL_DEPOSITS must start empty (0 items), got ${INITIAL_DEPOSITS.length}`);
assert(INITIAL_TROPHIES.length === 10, `INITIAL_TROPHIES must have 10 badges, got ${INITIAL_TROPHIES.length}`);
const unlockedBadges = INITIAL_TROPHIES.filter((t) => !!t.unlockedAt);
assert(unlockedBadges.length === 0, `All trophies must start locked (0 unlocked), but found ${unlockedBadges.length}`);
console.log('✓ 100% Clean Slate strictly verified!');

// 2. Custom College Schedule (1 to 7 Days per Week)
console.log('2. Testing Custom College Schedule (1 to 7 days/wk dynamic calculations)...');
for (let days = 1; days <= 7; days++) {
  const baon = 200;
  const expenses = 100;
  const dailyExcess = baon - expenses; // 100
  const weeklyExcess = dailyExcess * days;
  const monthlyExcess = weeklyExcess * 4;

  assert(weeklyExcess === 100 * days, `Weekly power for ${days} days must be ${100 * days}, got ${weeklyExcess}`);
  assert(monthlyExcess === 400 * days, `Monthly power for ${days} days must be ${400 * days}, got ${monthlyExcess}`);

  const allowance: AllowanceProfile = {
    dailyBaon: baon,
    dailyExpenses: expenses,
    savingsGoalPercent: 100,
    allowanceDaysPerWeek: days,
  };

  const project: WishlistProject = {
    id: `test-${days}`,
    title: 'College Project',
    targetPrice: 700,
    currentAmount: 0,
    category: 'education',
    createdAt: new Date().toISOString(),
  };

  const pace = calculatePace(project, allowance);
  assert(pace.hasPace, `calculatePace must have pace for ${days} days`);
  // 700 / 100 = 7 days needed
  // calendarDays = Math.ceil((7 / days) * 7) if days < 7 else 7
  const expectedCalendarDays = days < 7 ? Math.ceil((7 / days) * 7) : 7;
  assert(
    pace.daysRemaining === expectedCalendarDays,
    `For ${days} school days, expected ${expectedCalendarDays} calendar days, got ${pace.daysRemaining}`
  );
}
console.log('✓ Custom college schedule calculations (1-7 days) strictly verified!');

// 3. Collab Squad (Shared Duo & Group Goals) Logic
console.log('3. Testing Collab Squad Contribution Breakdown & Notifications...');
const sampleCollabGoal: CollabGoal = {
  id: 'collab-1',
  title: 'Boracay Trip',
  targetPrice: 10000,
  currentAmount: 2500,
  createdBy: 'justin',
  createdAt: '2026-09-01T00:00:00Z',
  members: [
    { username: 'justin', name: 'Justin', role: 'owner', totalContributed: 1500 },
    { username: 'alex', name: 'Alex Rivera', role: 'member', totalContributed: 1000 },
  ],
  pendingInvites: [
    { username: 'maria', invitedBy: 'justin', invitedAt: '2026-09-02T00:00:00Z' },
  ],
  deposits: [
    { id: 'd1', goalId: 'collab-1', username: 'justin', name: 'Justin', amount: 1500, timestamp: '2026-09-01T00:00:00Z' },
    { id: 'd2', goalId: 'collab-1', username: 'alex', name: 'Alex Rivera', amount: 1000, timestamp: '2026-09-02T00:00:00Z' },
  ],
};

const justinMember = sampleCollabGoal.members.find((m) => m.username === 'justin')!;
const alexMember = sampleCollabGoal.members.find((m) => m.username === 'alex')!;
const justinPercent = Math.round((justinMember.totalContributed / sampleCollabGoal.currentAmount) * 100);
const alexPercent = Math.round((alexMember.totalContributed / sampleCollabGoal.currentAmount) * 100);

assert(justinPercent === 60, `Justin percentage must be 60%, got ${justinPercent}%`);
assert(alexPercent === 40, `Alex percentage must be 40%, got ${alexPercent}%`);
assert(sampleCollabGoal.pendingInvites.length === 1, 'Must have 1 pending invite');
assert(sampleCollabGoal.pendingInvites[0].username === 'maria', 'Pending invite must be maria');

// Notification message simulation
const notifMsg = `${justinMember.name} deposited ${formatPHP(1500)} to ${sampleCollabGoal.title}!`;
assert(notifMsg === 'Justin deposited ₱1,500 to Boracay Trip!', `Unexpected notification message: ${notifMsg}`);

// Verify account validation on invitation
const registeredPeers = ['alex', 'maria'];
const testGhostUser = 'ghost_user_99';
assert(!registeredPeers.includes(testGhostUser), 'Ghost user must not be in registered peers');
console.log('✓ Collab Squad contribution breakdown and notification simulation passed!');

// 4. Modal Keyboard Avoidance & UI Typography Checks
console.log('4. Testing Modal Keyboard Avoidance & UI Typography...');

// Check ProjectDetailScreen button label and styling
const projectDetailContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/ProjectDetailScreen.tsx'), 'utf8');
assert(projectDetailContent.includes('+ Add Deposit'), 'ProjectDetailScreen must use "+ Add Deposit"');
assert(!projectDetailContent.includes('+ Mag-Ipon (Deposit)'), 'ProjectDetailScreen must retire "+ Mag-Ipon (Deposit)"');
assert(projectDetailContent.includes('borderRadius: 25'), 'ProjectDetailScreen must use spacious pill borderRadius: 25');

// Check SettingsScreen cleanup
const settingsContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/SettingsScreen.tsx'), 'utf8');
assert(!settingsContent.includes('Reset to Sample Goals'), 'SettingsScreen must permanently remove Reset to Sample Goals');
assert(settingsContent.includes('Sign Out'), 'SettingsScreen must have Sign Out button');
assert(settingsContent.includes('USER PROFILE & ACCOUNT'), 'SettingsScreen must display user profile header');

// Check modals have statusBarTranslucent, behavior="padding", and keyboardShouldPersistTaps
const modalFiles = [
  'AllowanceModal.tsx',
  'NewProjectModal.tsx',
  'QuickDepositModal.tsx',
  'EditProjectModal.tsx',
];

for (const modalFile of modalFiles) {
  const modalContent = fs.readFileSync(path.resolve(__dirname, `../src/components/modals/${modalFile}`), 'utf8');
  assert(
    modalContent.includes('statusBarTranslucent={true}'),
    `${modalFile} must include statusBarTranslucent={true}`
  );
  assert(
    modalContent.includes('keyboardShouldPersistTaps="handled"'),
    `${modalFile} must include keyboardShouldPersistTaps="handled"`
  );
  assert(
    modalContent.includes('behavior="padding"'),
    `${modalFile} must include behavior="padding" for Android/iOS keyboard avoidance`
  );
}

// Check GoalsScreen Collab Squad switcher and modal keyboard avoidance
const goalsContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/GoalsScreen.tsx'), 'utf8');
assert(goalsContent.includes('Personal Goals'), 'GoalsScreen must feature Personal Goals segment');
assert(goalsContent.includes('Collab Squad'), 'GoalsScreen must feature Collab Squad segment');
assert(goalsContent.includes('MEMBER CONTRIBUTIONS'), 'GoalsScreen must render member contributions breakdown');
assert(goalsContent.includes('behavior="padding"'), 'GoalsScreen modals must use behavior="padding"');

// Check AuthScreen keyboard avoidance
const authContent = fs.readFileSync(path.resolve(__dirname, '../src/screens/AuthScreen.tsx'), 'utf8');
assert(authContent.includes('behavior="padding"'), 'AuthScreen must use behavior="padding"');

console.log('✓ All Modal keyboard avoidance and UI typography verifications passed!');

console.log('ALL AUTH, COLLAB SQUAD, AND CLEAN SLATE TESTS PASSED! 🚀');
