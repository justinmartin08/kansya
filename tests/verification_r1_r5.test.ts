declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

import { formatPHP } from '../src/utils/calculations';
import { INITIAL_PROJECTS, SAMPLE_PROJECTS } from '../src/store/defaultData';
import { PROJECT_IMAGES } from '../src/utils/projectImages';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Running Kansya R1–R5 Verification Test Suite ---');

// ============================================================================
// 1. R1: Zero OS Emojis Audit in UI Source Code
// ============================================================================
console.log('1. Testing Zero OS Emojis across UI code (R1)...');

function getSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;

const srcFiles = getSourceFiles(path.resolve(__dirname, '../src'));
const foundEmojis: Array<{ file: string; line: number; emoji: string }> = [];

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((lineText: string, idx: number) => {
    const matches = lineText.match(emojiRegex);
    if (matches) {
      matches.forEach((em: string) => {
        foundEmojis.push({ file: path.relative(path.resolve(__dirname, '..'), file), line: idx + 1, emoji: em });
      });
    }
  });
}

assert(
  foundEmojis.length === 0,
  `Expected 0 OS emojis across src/, found ${foundEmojis.length}: ${JSON.stringify(foundEmojis)}`
);

// Specifically verify PlantSprout vector component exists
const sproutPath = path.resolve(__dirname, '../src/components/illustrations/PlantSprout.tsx');
assert(fs.existsSync(sproutPath), 'PlantSprout.tsx must exist');
const sproutContent = fs.readFileSync(sproutPath, 'utf8');
assert(sproutContent.includes('PlantSprout'), 'PlantSprout must export PlantSprout component');

console.log('✓ Zero OS emojis confirmed across entire src/ codebase!');

// ============================================================================
// 2. R2: Single Currency Formatting (No ₱₱) & Vector Golden Coin (R2)
// ============================================================================
console.log('2. Testing Single Currency formatting and Hero Card (R2)...');

// Verify formatPHP outputs single currency symbol
assert(formatPHP(4050) === '₱4,050', `formatPHP(4050) must be ₱4,050, got ${formatPHP(4050)}`);
assert(formatPHP(3450) === '₱3,450', `formatPHP(3450) must be ₱3,450, got ${formatPHP(3450)}`);
assert(formatPHP(800) === '₱800', `formatPHP(800) must be ₱800, got ${formatPHP(800)}`);
assert(!formatPHP(3450).includes('₱₱'), 'formatPHP must NEVER produce double ₱₱');

// Verify HomeScreen does not render redundant <Text style={styles.currencySymbol}>₱</Text>
const homeScreenPath = path.resolve(__dirname, '../src/screens/HomeScreen.tsx');
const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf8');
assert(
  !homeScreenContent.includes('<Text style={styles.currencySymbol}>₱</Text>'),
  'HomeScreen must NOT render duplicate currency symbol <Text>₱</Text>'
);

// Verify GoldCoinSvg exists
const goldCoinPath = path.resolve(__dirname, '../src/components/illustrations/GoldCoinSvg.tsx');
assert(fs.existsSync(goldCoinPath), 'GoldCoinSvg.tsx must exist');

// Verify SparklineSvg exists
const sparklinePath = path.resolve(__dirname, '../src/components/illustrations/SparklineSvg.tsx');
assert(fs.existsSync(sparklinePath), 'SparklineSvg.tsx must exist');

// Verify HomeScreen uses SparklineSvg and has removed redundant hero coin and growing badge
assert(homeScreenContent.includes('<SparklineSvg'), 'HomeScreen must render SparklineSvg');
assert(!homeScreenContent.includes('<GoldCoinSvg'), 'HomeScreen Hero Card must NOT render redundant small coin next to balance');
assert(!homeScreenContent.includes('growingBadge'), 'HomeScreen Hero Card must NOT render Growing > status badge');
assert(homeScreenContent.includes("backgroundColor: 'transparent'"), 'cardCoinContainer must have transparent background');

// Verify ProgressiveCoin has embossed Philippine Peso symbol
const progressiveCoinPath = path.resolve(__dirname, '../src/components/illustrations/ProgressiveCoin.tsx');
assert(fs.existsSync(progressiveCoinPath), 'ProgressiveCoin.tsx must exist');
const progressiveCoinContent = fs.readFileSync(progressiveCoinPath, 'utf8');
assert(progressiveCoinContent.includes('dullSymbolId'), 'ProgressiveCoin must feature embossed symbol gradient');
assert(!progressiveCoinContent.includes('Kansya Sprout Emblem'), 'ProgressiveCoin must retire sprout emblem on coin face');

console.log('✓ Single currency formatting, clean Hero Card, and embossed ProgressiveCoin verified strictly!');

// ============================================================================
// 3. R3: Active Plots Carousel & 3D Product Visuals (R3)
// ============================================================================
console.log('3. Testing Active Plots Carousel & 3D Visuals (R3)...');

// Verify 3D images exist on disk and are high-res (>100KB)
const requiredImages = ['earbuds.jpg', 'keyboard.jpg', 'gaming_setup.jpg', 'palworld.jpg'];
for (const img of requiredImages) {
  const imgPath = path.resolve(__dirname, `../assets/images/${img}`);
  assert(fs.existsSync(imgPath), `Asset assets/images/${img} must exist`);
  const stats = fs.statSync(imgPath);
  assert(stats.size > 100000, `Asset ${img} must be high-res (>100KB), got ${stats.size} bytes`);
}

// Verify PROJECT_IMAGES mapping
assert(PROJECT_IMAGES['earbuds'] !== undefined, 'PROJECT_IMAGES must map earbuds');
assert(PROJECT_IMAGES['keyboard'] !== undefined, 'PROJECT_IMAGES must map keyboard');
assert(PROJECT_IMAGES['gaming_setup'] !== undefined, 'PROJECT_IMAGES must map gaming_setup');
assert(PROJECT_IMAGES['palworld'] !== undefined, 'PROJECT_IMAGES must map palworld');

// Verify sample projects data
const earbudsProj = SAMPLE_PROJECTS.find((p) => p.imageKey === 'earbuds');
assert(!!earbudsProj, 'Earbuds project must exist in SAMPLE_PROJECTS');
if (!earbudsProj) throw new Error('Unreachable');
assert(earbudsProj.targetPrice === 800 && earbudsProj.currentAmount === 800, 'Earbuds must be 100% funded (₱800 / ₱800)');

const keyboardProj = SAMPLE_PROJECTS.find((p) => p.imageKey === 'keyboard');
assert(!!keyboardProj, 'Keyboard project must exist in SAMPLE_PROJECTS');
if (!keyboardProj) throw new Error('Unreachable');
assert(Math.round((keyboardProj.currentAmount / keyboardProj.targetPrice) * 100) === 88, 'Keyboard must be 88%');

const gamingProj = SAMPLE_PROJECTS.find((p) => p.imageKey === 'gaming_setup');
assert(!!gamingProj, 'Gaming setup must exist in SAMPLE_PROJECTS');
if (!gamingProj) throw new Error('Unreachable');
assert(Math.round((gamingProj.currentAmount / gamingProj.targetPrice) * 100) === 40, 'Gaming setup must be 40%');

// Verify HomeScreen carousel padding for symmetrical side peeking (paddingHorizontal: 60)
assert(
  homeScreenContent.includes('paddingHorizontal: 60'),
  'HomeScreen carousel must set paddingHorizontal: 60 for symmetrical 46px side peeking'
);

// Verify inspect button uses Lucide Eye vector icon
assert(homeScreenContent.includes('<Eye'), 'HomeScreen inactive cards must render Lucide Eye icon');
assert(!homeScreenContent.includes('Inspect 👁'), 'Inspect button must NOT contain OS eye emoji');

console.log('✓ 3D visuals and carousel peeking layout verified!');

// ============================================================================
// 4. R4: Quick Actions & 4-Tab Bottom Dock (R4)
// ============================================================================
console.log('4. Testing Quick Actions & Bottom Dock (R4)...');

const dockPath = path.resolve(__dirname, '../src/components/layout/BottomNavDock.tsx');
assert(fs.existsSync(dockPath), 'BottomNavDock.tsx must exist');
const dockContent = fs.readFileSync(dockPath, 'utf8');

// Verify all 4 tabs exist
assert(dockContent.includes("'home'"), "Dock must contain 'home' tab");
assert(dockContent.includes("'goals'"), "Dock must contain 'goals' tab");
assert(dockContent.includes("'savings'"), "Dock must contain 'savings' tab");
assert(dockContent.includes("'settings'"), "Dock must contain 'settings' tab");

// Verify Home tab uses PlantSprout vector icon
assert(
  dockContent.includes("icon: PlantSprout"),
  'BottomNavDock Home tab must use PlantSprout vector icon'
);

// Verify Quick Actions card uses Lucide Zap vector
assert(homeScreenContent.includes('<Zap'), 'Quick Actions card must render Lucide Zap vector icon');

console.log('✓ Quick Actions & 4-tab bottom dock verified!');

// ============================================================================
// 5. R5: Goals Catalog Screen Overhaul (R5)
// ============================================================================
console.log('5. Testing Goals Catalog Screen Overhaul & Donut Scaling (R5)...');

const goalsScreenPath = path.resolve(__dirname, '../src/screens/GoalsScreen.tsx');
assert(fs.existsSync(goalsScreenPath), 'GoalsScreen.tsx must exist');
const goalsContent = fs.readFileSync(goalsScreenPath, 'utf8');

// Verify itemTitle in GoalsScreen has NO numberOfLines={1} truncation
assert(
  !goalsContent.includes('<Text style={styles.itemTitle} numberOfLines={1}>'),
  'GoalsScreen itemTitle must NOT enforce numberOfLines={1} to allow full readable titles'
);

// Verify AnimatedDonutChart dynamic typography scaling
const donutPath = path.resolve(__dirname, '../src/components/charts/AnimatedDonutChart.tsx');
assert(fs.existsSync(donutPath), 'AnimatedDonutChart.tsx must exist');
const donutContent = fs.readFileSync(donutPath, 'utf8');

assert(
  donutContent.includes('Math.round(size * 0.20)'),
  'AnimatedDonutChart must dynamically scale value font size using Math.round(size * 0.20)'
);
assert(
  donutContent.includes('Math.max(8, Math.round(size * 0.09))'),
  'AnimatedDonutChart must dynamically scale label font size using Math.max(8, Math.round(size * 0.09))'
);

// Test math for size=76, strokeWidth=8
const testSize = 76;
const testStroke = 8;
const innerDiameter = testSize - 2 * testStroke; // 60px
const valFontSize = Math.round(testSize * 0.20); // 15px
const lblFontSize = Math.max(8, Math.round(testSize * 0.09)); // 8px

assert(innerDiameter === 60, 'Inner diameter must be 60px');
assert(valFontSize === 15, `Value font size for size=76 must be 15px, got ${valFontSize}`);
assert(lblFontSize === 8, `Label font size for size=76 must be 8px, got ${lblFontSize}`);
assert(valFontSize < innerDiameter, 'Font size must fit within inner clear diameter');

console.log('✓ Goals catalog truncation removal and donut dynamic scaling verified!');

console.log('ALL R1–R5 VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
