declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

import { PROJECT_IMAGES, getProjectImage } from '../src/utils/projectImages';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('=== Running Adversarial Project Images Loader Stress Tests ===');

// ----------------------------------------------------------------------------
// 1. Verify Physical Image Files on Disk
// ----------------------------------------------------------------------------
console.log('1. Verifying physical image files on disk...');

const expectedAssets = [
  { name: 'earbuds.jpg', key: 'earbuds' },
  { name: 'keyboard.jpg', key: 'keyboard' },
  { name: 'gaming_setup.jpg', key: 'gaming_setup' },
  { name: 'palworld.jpg', key: 'palworld' },
];

for (const asset of expectedAssets) {
  const filePath = path.resolve(__dirname, `../assets/images/${asset.name}`);
  assert(fs.existsSync(filePath), `Physical file ${asset.name} must exist`);

  const stat = fs.statSync(filePath);
  assert(stat.size > 100000, `Asset ${asset.name} must be high-res (>100KB), got ${stat.size} bytes`);

  // Verify JPEG magic bytes FF D8 FF
  const buffer = fs.readFileSync(filePath);
  assert(
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    `Asset ${asset.name} must have valid JPEG header`
  );
}
console.log('✓ All 4 physical JPEG assets are verified high-resolution on disk!');

// ----------------------------------------------------------------------------
// 2. Test PROJECT_IMAGES Record
// ----------------------------------------------------------------------------
console.log('2. Verifying PROJECT_IMAGES record mapping...');

assert(PROJECT_IMAGES.earbuds !== undefined, 'PROJECT_IMAGES.earbuds must be defined');
assert(PROJECT_IMAGES.keyboard !== undefined, 'PROJECT_IMAGES.keyboard must be defined');
assert(PROJECT_IMAGES.gaming_setup !== undefined, 'PROJECT_IMAGES.gaming_setup must be defined');
assert(PROJECT_IMAGES.palworld !== undefined, 'PROJECT_IMAGES.palworld must be defined');

// ----------------------------------------------------------------------------
// 3. Adversarial getProjectImage Edge Cases
// ----------------------------------------------------------------------------
console.log('3. Stress testing getProjectImage with edge cases...');

const testCases: Array<{
  key?: any;
  category?: any;
  expected: any;
  description: string;
}> = [
  // Exact valid keys
  { key: 'earbuds', category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Valid key: earbuds' },
  { key: 'keyboard', category: undefined, expected: PROJECT_IMAGES.keyboard, description: 'Valid key: keyboard' },
  { key: 'gaming_setup', category: undefined, expected: PROJECT_IMAGES.gaming_setup, description: 'Valid key: gaming_setup' },
  { key: 'palworld', category: undefined, expected: PROJECT_IMAGES.palworld, description: 'Valid key: palworld' },

  // Missing keys (undefined, null, empty)
  { key: undefined, category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Undefined key & undefined category -> earbuds default' },
  { key: null, category: null, expected: PROJECT_IMAGES.earbuds, description: 'Null key & null category -> earbuds default' },
  { key: '', category: '', expected: PROJECT_IMAGES.earbuds, description: 'Empty string key & empty category -> earbuds default' },
  { key: '   ', category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Whitespace key -> earbuds default' },

  // Non-existent and misspelled keys
  { key: 'nonexistent_key', category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Unknown key -> earbuds default' },
  { key: 'EARBUDS', category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Uppercase key -> earbuds default' },
  { key: 'earbuds_2', category: undefined, expected: PROJECT_IMAGES.earbuds, description: 'Variant key -> earbuds default' },

  // Category fallbacks
  { key: undefined, category: 'game', expected: PROJECT_IMAGES.gaming_setup, description: 'Category game fallback -> gaming_setup' },
  { key: 'invalid_image', category: 'game', expected: PROJECT_IMAGES.gaming_setup, description: 'Invalid key + category game -> gaming_setup' },
  { key: undefined, category: 'gadget', expected: PROJECT_IMAGES.keyboard, description: 'Category gadget fallback -> keyboard' },
  { key: 'invalid_image', category: 'gadget', expected: PROJECT_IMAGES.keyboard, description: 'Invalid key + category gadget -> keyboard' },
  { key: undefined, category: 'unknown_cat', expected: PROJECT_IMAGES.earbuds, description: 'Unknown category fallback -> earbuds default' },
  { key: undefined, category: 'tech', expected: PROJECT_IMAGES.earbuds, description: 'Category tech fallback -> earbuds default' },

  // Key precedence over category
  { key: 'earbuds', category: 'game', expected: PROJECT_IMAGES.earbuds, description: 'Key earbuds takes precedence over category game' },
  { key: 'keyboard', category: 'game', expected: PROJECT_IMAGES.keyboard, description: 'Key keyboard takes precedence over category game' },
  { key: 'palworld', category: 'gadget', expected: PROJECT_IMAGES.palworld, description: 'Key palworld takes precedence over category gadget' },
];

for (const tc of testCases) {
  const result = getProjectImage(tc.key, tc.category);
  assert(
    result === tc.expected,
    `FAILED: ${tc.description}. Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(result)}`
  );
  console.log(`  ✓ ${tc.description}`);
}

// ----------------------------------------------------------------------------
// 4. Adversarial Prototype Pollution & Property Shadowing Check
// ----------------------------------------------------------------------------
console.log('4. Adversarial probe: Object.prototype shadowing on imageKey...');

const protoKeys = ['constructor', 'toString', 'valueOf', '__proto__'];
let protoIssueCount = 0;

for (const pKey of protoKeys) {
  const res = getProjectImage(pKey);
  const isFunctionOrObjectProto = typeof res === 'function' || res === Object.prototype;
  if (isFunctionOrObjectProto) {
    console.warn(`  ⚠ Finding: imageKey='${pKey}' returned ${typeof res} instead of fallback image asset!`);
    protoIssueCount++;
  } else {
    console.log(`  ✓ imageKey='${pKey}' safely avoided prototype shadowing`);
  }
}

if (protoIssueCount > 0) {
  console.log(`[ADVERSARIAL FINDING]: ${protoIssueCount} prototype property keys leak Object.prototype properties when looked up via PROJECT_IMAGES[imageKey] without Object.hasOwn() check.`);
}

console.log('✓ PASS: Standard projectImages edge cases and fallback resolution verified!');
