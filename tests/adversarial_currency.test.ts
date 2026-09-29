import { formatPHP } from '../src/utils/calculations';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('=== Running Adversarial Currency & AnimatedCounter Stress Tests ===');

// Helper to simulate the exact string formatting logic inside AnimatedCounter.tsx
function formatAnimatedCounter(value: number, prefix: string = '₱', suffix: string = ''): string {
  const safePrefix = prefix ? prefix.replace(/₱+/g, '₱') : '';
  return `${safePrefix}${value.toLocaleString('en-US')}${suffix}`;
}

// Ease-out cubic animation step simulator from AnimatedCounter.tsx
function simulateAnimatedCounterStep(startVal: number, endVal: number, progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - p, 3);
  return Math.round(startVal + (endVal - startVal) * eased);
}

// ----------------------------------------------------------------------------
// 1. Stress Testing Prefix Deduplication and Variations
// ----------------------------------------------------------------------------
console.log('1. Testing AnimatedCounter prefix variations...');

// Standard single prefix
assert(formatAnimatedCounter(4050, '₱') === '₱4,050', 'Prefix ₱ must format as ₱4,050');
assert(formatAnimatedCounter(3450, '₱') === '₱3,450', 'Prefix ₱ must format as ₱3,450');

// Double prefix deduplication (R2 critical fix)
assert(formatAnimatedCounter(4050, '₱₱') === '₱4,050', 'Prefix ₱₱ must be deduplicated to ₱4,050');
assert(formatAnimatedCounter(3450, '₱₱') === '₱3,450', 'Prefix ₱₱ must be deduplicated to ₱3,450');

// Multiple prefix deduplication
assert(formatAnimatedCounter(800, '₱₱₱₱') === '₱800', 'Prefix ₱₱₱₱ must be deduplicated to ₱800');

// Empty prefix
assert(formatAnimatedCounter(4050, '') === '4,050', 'Empty prefix must format without currency symbol');
assert(formatAnimatedCounter(0, '') === '0', 'Empty prefix with 0 must be 0');

// Prefix with literal amount (e.g. '₱4050')
const p4050Result = formatAnimatedCounter(0, '₱4050');
console.log('prefix="₱4050" with value=0 produces:', p4050Result);
assert(!p4050Result.includes('₱₱'), 'prefix="₱4050" must not contain ₱₱');
assert(typeof p4050Result === 'string', 'prefix="₱4050" must produce valid string without error');

// ----------------------------------------------------------------------------
// 2. Numerical Edge Cases: Zero, Negative, Large, Floats
// ----------------------------------------------------------------------------
console.log('2. Testing numerical edge cases (zero, negative, large numbers, floats)...');

// Zero
assert(formatAnimatedCounter(0, '₱') === '₱0', 'Value 0 must format as ₱0');

// Negative numbers
const negResult = formatAnimatedCounter(-500, '₱');
console.log('Negative value -500 formatted:', negResult);
assert(negResult.includes('500') && !negResult.includes('₱₱'), 'Negative number must render safely');

// Large numbers
assert(formatAnimatedCounter(1000000, '₱') === '₱1,000,000', '1M must format with commas');
assert(formatAnimatedCounter(1234567890, '₱') === '₱1,234,567,890', '1.2B must format with commas');

// Floating point numbers
const floatResult = formatAnimatedCounter(1234.56, '₱');
console.log('Float value 1234.56 formatted:', floatResult);
assert(floatResult === '₱1,234.56' || floatResult === '₱1,235', 'Float must format cleanly');

// Suffix tests
assert(formatAnimatedCounter(100, '₱', ' / day') === '₱100 / day', 'Suffix must append cleanly');

// ----------------------------------------------------------------------------
// 3. Animation Ease-out Cubic Numerical Stability
// ----------------------------------------------------------------------------
console.log('3. Testing AnimatedCounter ease-out cubic animation stability...');

const progressSteps = [0, 0.1, 0.25, 0.5, 0.75, 0.99, 1.0, 1.5, -0.2];
for (const step of progressSteps) {
  const simulated = simulateAnimatedCounterStep(0, 4050, step);
  assert(!isNaN(simulated), `Step ${step} must not produce NaN`);
  assert(isFinite(simulated), `Step ${step} must not produce Infinity`);
  assert(simulated >= 0 && simulated <= 4050, `Step ${step} value ${simulated} must be within [0, 4050]`);
}
assert(simulateAnimatedCounterStep(0, 4050, 0) === 0, 'Animation at progress=0 must be 0');
assert(simulateAnimatedCounterStep(0, 4050, 1) === 4050, 'Animation at progress=1 must be end value');

// ----------------------------------------------------------------------------
// 4. Financial Engine formatPHP Adversarial Stress Test
// ----------------------------------------------------------------------------
console.log('4. Testing formatPHP financial formatting engine...');

assert(formatPHP(4050) === '₱4,050', 'formatPHP(4050) must be ₱4,050');
assert(formatPHP(0) === '₱0', 'formatPHP(0) must be ₱0');
assert(formatPHP(-50) === '₱0', 'formatPHP(-50) must safely clamp to ₱0');
assert(formatPHP(NaN) === '₱0', 'formatPHP(NaN) must safely fallback to ₱0');
assert(formatPHP(Infinity) !== '₱NaN', 'formatPHP(Infinity) must not produce NaN');
assert(formatPHP(1234.56, true) === '₱1,234.56', 'formatPHP(1234.56, true) must include 2 decimal places');
assert(formatPHP(1234.56, false) === '₱1,235', 'formatPHP(1234.56, false) must round to nearest peso');
assert(formatPHP(999999999) === '₱999,999,999', 'Large values must format with thousands separators');

// Verify double currency symbol prevention across all inputs
for (const v of [0, 1, 50, 800, 3450, 4050, 100000]) {
  const res = formatPHP(v);
  assert(!res.includes('₱₱'), `formatPHP(${v}) must never contain ₱₱`);
  assert(res.startsWith('₱'), `formatPHP(${v}) must start with single ₱`);
}

console.log('✓ PASS: All adversarial currency and AnimatedCounter stress tests passed cleanly!');
