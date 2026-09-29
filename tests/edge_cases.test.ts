import {
  getConstructionPhase,
  getProjectProgress,
  getDailyExcessRate,
  calculatePace,
  formatPHP,
} from '../src/utils/calculations';
import { WishlistProject, AllowanceProfile } from '../src/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Edge Case Verification Suite ---');

// 1. Zero and Negative Target Price
console.log('1. Testing Zero & Negative Target Price edge cases...');
const zeroTargetProg = getProjectProgress(100, 0);
assert(zeroTargetProg.isCompleted === true, 'Zero target should be marked completed');
assert(zeroTargetProg.clampedPercent === 100, 'Zero target clamped to 100%');
assert(zeroTargetProg.remaining === 0, 'Zero target remaining should be 0');

const negTargetProg = getProjectProgress(50, -500);
assert(negTargetProg.isCompleted === true, 'Negative target should be handled as completed');
console.log('✓ Zero and negative target prices handled cleanly!');

// 2. Huge values (Millions of pesos)
console.log('2. Testing Large Currency Values...');
const hugeProg = getProjectProgress(5000000, 10000000);
assert(hugeProg.clampedPercent === 50, '₱5M / ₱10M = 50%');
assert(hugeProg.remaining === 5000000, '₱5M remaining');
assert(formatPHP(10000000) === '₱10,000,000', 'Formats ₱10,000,000 properly');
console.log('✓ Large currency values handled cleanly!');

// 3. Allowance: Expenses Exactly Equal Baon
console.log('3. Testing Zero Excess Allowance...');
const breakEvenAllowance: AllowanceProfile = {
  dailyBaon: 100,
  dailyExpenses: 100,
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5,
};
assert(getDailyExcessRate(breakEvenAllowance) === 0, 'Break-even baon results in 0 excess');

const breakEvenProject: WishlistProject = {
  id: 'be-1',
  title: 'Test',
  targetPrice: 500,
  currentAmount: 0,
  category: 'game',
  createdAt: '2026-09-20T00:00:00Z',
};
const breakEvenPace = calculatePace(breakEvenProject, breakEvenAllowance);
assert(breakEvenPace.hasPace === false, 'Zero excess rate should indicate hasPace=false');
assert(breakEvenPace.projectedFormatted.includes('Set Baon Excess'), 'Provides prompt when rate is 0');
console.log('✓ Zero excess baon handled cleanly!');

// 4. Calendar Days conversion between 5-day school week and 7-day calendar week
console.log('4. Testing Calendar Days vs School Days...');
const normalAllowance5: AllowanceProfile = {
  dailyBaon: 150,
  dailyExpenses: 50, // ₱100 excess/day
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5, // 5 days/week
};
const proj1000: WishlistProject = {
  id: 'p-1',
  title: 'Test',
  targetPrice: 1000,
  currentAmount: 0,
  category: 'game',
  createdAt: '2026-09-20T00:00:00Z',
};
// 1000 / 100 = 10 school days needed.
// (10 / 5) * 7 = 14 calendar days
const pace5 = calculatePace(proj1000, normalAllowance5);
assert(pace5.daysRemaining === 14, `Expected 14 calendar days for 5-day week, got ${pace5.daysRemaining}`);

const normalAllowance7: AllowanceProfile = {
  ...normalAllowance5,
  allowanceDaysPerWeek: 7, // 7 days/week
};
const pace7 = calculatePace(proj1000, normalAllowance7);
assert(pace7.daysRemaining === 10, `Expected 10 calendar days for 7-day week, got ${pace7.daysRemaining}`);
console.log('✓ 5-day school week and 7-day calendar conversion verified!');

// 5. Phase Thresholds Edge Values
console.log('5. Testing Boundary Percentages...');
assert(getConstructionPhase(0, 1000).id === 0, 'Strictly 0 amount is Phase 0');
assert(getConstructionPhase(150, 1000).id === 1, '150/1000 (15%) is Phase 1');
assert(getConstructionPhase(151, 1000).id === 1, '151/1000 (15.1% floor 15%) is Phase 1');
assert(getConstructionPhase(160, 1000).id === 2, '160/1000 (16%) is Phase 2');
assert(getConstructionPhase(300, 1000).id === 2, '300/1000 (30%) is Phase 2');
assert(getConstructionPhase(310, 1000).id === 3, '310/1000 (31%) is Phase 3');
assert(getConstructionPhase(600, 1000).id === 3, '600/1000 (60%) is Phase 3');
assert(getConstructionPhase(610, 1000).id === 4, '610/1000 (61%) is Phase 4');
assert(getConstructionPhase(850, 1000).id === 4, '850/1000 (85%) is Phase 4');
assert(getConstructionPhase(860, 1000).id === 5, '860/1000 (86%) is Phase 5');
assert(getConstructionPhase(999, 1000).id === 5, '999/1000 (99%) is Phase 5');
assert(getConstructionPhase(1000, 1000).id === 6, '1000/1000 (100%) is Phase 6');
// 6. Testing Extreme Timeline Date Overflow (e.g. 1 Billion Pesos with 1 Peso/day)
console.log('6. Testing Extreme Pace Timeline Guard...');
const extremeProject: WishlistProject = {
  id: 'p-extreme',
  title: 'Island Villa',
  targetPrice: 1000000000,
  currentAmount: 0,
  category: 'other',
  createdAt: '2026-09-20T00:00:00Z',
  manualDailyAllocation: 1,
};
const extremePace = calculatePace(extremeProject, normalAllowance5);
assert(extremePace.hasPace === true, 'Has pace should be true');
assert(extremePace.projectedFormatted.includes('> 100 years'), 'Gracefully handles > 100 years');
assert(typeof extremePace.projectedDate === 'string', 'projectedDate is string');
console.log('✓ Extreme timeline date overflow handled safely without crashing!');

console.log('ALL EDGE CASES PASSED VERIFICATION! 🚀');

