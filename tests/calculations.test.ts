import {
  getConstructionPhase,
  getProjectProgress,
  getDailyExcessRate,
  calculatePace,
  formatPHP,
  CONSTRUCTION_PHASES,
} from '../src/utils/calculations';
import { WishlistProject, AllowanceProfile } from '../src/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Kansya Calculations & Financial Engine Tests ---');

// 1. Test 7 Construction Phases Mapping
console.log('Testing Construction Phase boundaries...');
assert(getConstructionPhase(0, 1000).id === 0, '0% should map to Phase 0');
assert(getConstructionPhase(1, 1000).id === 1, '1 peso (0.1% -> 1%) should map to Phase 1');
assert(getConstructionPhase(150, 1000).id === 1, '15% should map to Phase 1');
assert(getConstructionPhase(160, 1000).id === 2, '16% should map to Phase 2');
assert(getConstructionPhase(300, 1000).id === 2, '30% should map to Phase 2');
assert(getConstructionPhase(310, 1000).id === 3, '31% should map to Phase 3');
assert(getConstructionPhase(600, 1000).id === 3, '60% should map to Phase 3');
assert(getConstructionPhase(610, 1000).id === 4, '61% should map to Phase 4');
assert(getConstructionPhase(850, 1000).id === 4, '85% should map to Phase 4');
assert(getConstructionPhase(860, 1000).id === 5, '86% should map to Phase 5');
assert(getConstructionPhase(990, 1000).id === 5, '99% should map to Phase 5');
assert(getConstructionPhase(1000, 1000).id === 6, '100% should map to Phase 6 (Blessing)');
assert(getConstructionPhase(1500, 1000).id === 6, '150% (overfunded) should map to Phase 6');
console.log('✓ All 7 phase boundary tests passed!');

// 2. Test Progress and Clamping
console.log('Testing Progress Clamping...');
const pZero = getProjectProgress(0, 1000);
assert(pZero.clampedPercent === 0 && !pZero.isCompleted && pZero.remaining === 1000, '0% calculation');

const pHalf = getProjectProgress(500, 1000);
assert(pHalf.clampedPercent === 50 && !pHalf.isCompleted && pHalf.remaining === 500, '50% calculation');

const pOver = getProjectProgress(1200, 1000);
assert(pOver.clampedPercent === 100 && pOver.isCompleted && pOver.remaining === 0, '120% clamped to 100%');
console.log('✓ Progress calculations passed!');

// 3. Test Allowance Engine (Daily Excess & Weekly Power)
console.log('Testing Allowance Engine...');
const testAllowance: AllowanceProfile = {
  dailyBaon: 150,
  dailyExpenses: 90,
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5,
};

const excess = getDailyExcessRate(testAllowance);
assert(excess === 60, `Expected ₱60 excess, got ₱${excess}`);

const negativeExcessAllowance: AllowanceProfile = {
  dailyBaon: 80,
  dailyExpenses: 120, // Expenses exceed baon
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5,
};
assert(getDailyExcessRate(negativeExcessAllowance) === 0, 'Excess should clamp to 0 when expenses exceed baon');
console.log('✓ Allowance excess rate calculations passed!');

// 4. Test Smart Pace & Days Remaining Calculator
console.log('Testing Pace & Timeline Projections...');
const sampleProject: WishlistProject = {
  id: 'test-p1',
  title: 'Palworld',
  targetPrice: 1000,
  currentAmount: 450, // 550 remaining
  category: 'game',
  createdAt: '2026-09-20T00:00:00Z',
};

const pace = calculatePace(sampleProject, testAllowance);
assert(pace.dailyRate === 60, 'Daily rate should be ₱60');
// 550 remaining / 60 = 10 school days. With 5-day week -> 14 calendar days
assert(pace.daysRemaining === 14, `Expected 14 calendar days, got ${pace.daysRemaining}`);
assert(pace.hasPace === true, 'Should have active pace');

// Completed project pace
const completedProject: WishlistProject = {
  ...sampleProject,
  currentAmount: 1000,
};
const completedPace = calculatePace(completedProject, testAllowance);
assert(completedPace.daysRemaining === 0, 'Completed project should have 0 days remaining');
assert(completedPace.projectedFormatted === 'Fully Funded!', 'Projected label should be Fully Funded!');

// Manual Override Pace
const manualProject: WishlistProject = {
  ...sampleProject,
  manualDailyAllocation: 100, // Custom override: ₱100/day
};
const manualPace = calculatePace(manualProject, testAllowance);
assert(manualPace.dailyRate === 100, 'Should respect manual daily rate override');
console.log('✓ Smart Pace and timeline projections passed!');

// 5. Test Currency Formatter
console.log('Testing Currency Formatter...');
assert(formatPHP(1000) === '₱1,000', '1000 -> ₱1,000');
assert(formatPHP(2500.5) === '₱2,501', '2500.5 rounded -> ₱2,501');
assert(formatPHP(2500.5, true) === '₱2,500.50', '2500.5 with decimals -> ₱2,500.50');
assert(formatPHP(-20) === '₱0', 'Negative amount clamped to ₱0');
console.log('✓ Currency formatting passed!');

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! 🚀');
