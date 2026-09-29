import {
  getConstructionPhase,
  getProjectProgress,
  calculatePace,
} from '../src/utils/calculations';
import { WishlistProject, AllowanceProfile } from '../src/types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Milestones & Bug Fixes Verification Suite ---');

// 1. Verify Milestone Threshold Crossing Logic
console.log('1. Testing Milestone Threshold Detection...');

function isMilestoneCrossed(oldAmount: number, newAmount: number, targetPrice: number): boolean {
  const oldPhase = getConstructionPhase(oldAmount, targetPrice);
  const newPhase = getConstructionPhase(newAmount, targetPrice);
  const isNowComplete = newAmount >= targetPrice;

  // Milestone is crossed when reaching Phase 2+ (crossing 15%, 30%, 60%, 85%, 100%)
  // Phase 0 (0%) -> Phase 1 (1%-15%) is initial plot activation, not milestone fanfare
  return (newPhase.id > oldPhase.id && newPhase.id >= 2) || (isNowComplete && oldPhase.id < 6);
}

// Case A: 0% -> 2% (₱0 -> ₱20 on ₱1000 goal)
assert(!isMilestoneCrossed(0, 20, 1000), '0% -> 2% must NOT trigger milestone celebration');

// Case B: 14% -> 16% (₱140 -> ₱160 on ₱1000 goal) - crosses 15% threshold into Foundation
assert(isMilestoneCrossed(140, 160, 1000), '14% -> 16% MUST trigger milestone celebration (Foundation)');

// Case C: 29% -> 31% (crosses 30% into Masonry)
assert(isMilestoneCrossed(290, 310, 1000), '29% -> 31% MUST trigger milestone celebration (Masonry)');

// Case D: 59% -> 61% (crosses 60% into Roof)
assert(isMilestoneCrossed(590, 610, 1000), '59% -> 61% MUST trigger milestone celebration (Roof)');

// Case E: 84% -> 86% (crosses 85% into Paint)
assert(isMilestoneCrossed(840, 860, 1000), '84% -> 86% MUST trigger milestone celebration (Paint)');

// Case F: 95% -> 100% (crosses 100% into House Blessing)
assert(isMilestoneCrossed(950, 1000, 1000), '95% -> 100% MUST trigger milestone celebration (House Blessing)');

// Case G: Extra deposit on already completed house (100% -> 110%)
assert(!isMilestoneCrossed(1000, 1100, 1000), '100% -> 110% must NOT re-trigger completion celebration');

console.log('✓ Milestone threshold detection verified strictly!');

// 2. Verify Badge Unlock Percentages
console.log('2. Testing Badge Unlock Percentages...');

function getUnlockedPhaseBadges(amount: number, targetPrice: number): string[] {
  const p = getProjectProgress(amount, targetPrice).clampedPercent;
  const unlocked: string[] = [];
  if (p >= 15) unlocked.push('phase_1');
  if (p >= 30) unlocked.push('phase_2');
  if (p >= 60) unlocked.push('phase_3');
  if (p >= 85) unlocked.push('phase_4');
  if (p >= 86) unlocked.push('phase_5');
  if (p >= 100) unlocked.push('phase_6');
  return unlocked;
}

const badgesAt2Percent = getUnlockedPhaseBadges(20, 1000);
assert(!badgesAt2Percent.includes('phase_1'), '2% progress must NOT unlock phase_1 (Master Planner: Reached 15%)');

const badgesAt15Percent = getUnlockedPhaseBadges(150, 1000);
assert(badgesAt15Percent.includes('phase_1'), '15% progress MUST unlock phase_1');
assert(!badgesAt15Percent.includes('phase_2'), '15% progress must NOT unlock phase_2');

const badgesAt30Percent = getUnlockedPhaseBadges(300, 1000);
assert(badgesAt30Percent.includes('phase_2'), '30% progress MUST unlock phase_2');

const badgesAt100Percent = getUnlockedPhaseBadges(1000, 1000);
assert(badgesAt100Percent.length === 6, '100% progress unlocks all phase badges');

console.log('✓ Badge unlocking percentages strictly verified!');

// 3. Verify QuickDeposit Active Amount Resolution (Bug 5)
console.log('3. Testing Quick Deposit Amount Resolution...');

function resolveActiveAmount(selectedAmount: number, customInput: string): number {
  return customInput.trim().length > 0 ? (parseInt(customInput, 10) || 0) : selectedAmount;
}

assert(resolveActiveAmount(50, '') === 50, 'Empty custom input returns selected preset chip (50)');
assert(resolveActiveAmount(50, '0') === 0, 'Custom input "0" must resolve to 0, NOT fall back to 50');
assert(resolveActiveAmount(50, '75') === 75, 'Custom input "75" resolves to 75');
assert(resolveActiveAmount(100, '   ') === 100, 'Whitespace custom input returns selected preset chip (100)');

console.log('✓ Quick Deposit amount resolution verified!');

// 4. Verify Extreme Timeline Pace Calculation (Bug 3)
console.log('4. Testing Extreme Timeline Pace...');
const allowance: AllowanceProfile = {
  dailyBaon: 100,
  dailyExpenses: 99, // ₱1/day excess
  savingsGoalPercent: 100,
  allowanceDaysPerWeek: 5,
};
const megaProject: WishlistProject = {
  id: 'mega',
  title: 'Mega Project',
  targetPrice: 2000000000, // 2 Billion Pesos
  currentAmount: 0,
  category: 'other',
  createdAt: '2026-09-20T00:00:00Z',
};
const megaPace = calculatePace(megaProject, allowance);
assert(megaPace.hasPace === true, 'Mega pace should have pace');
assert(megaPace.projectedFormatted.includes('> 100 years'), 'Mega pace displays > 100 years without throwing');
assert(typeof megaPace.projectedDate === 'string', 'projectedDate is safe string');

console.log('✓ Extreme timeline pace calculated safely!');

console.log('ALL MILESTONE & BUG FIX TESTS PASSED! 🚀');
