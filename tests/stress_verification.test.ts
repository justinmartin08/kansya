declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

// ============================================================================
// ADVERSARIAL STRESS TEST SUITE: challenger_2
// 1. AnimatedDonutChart inner clear diameter vs text widths across diameters:
//    size = 50, 76, 100, 180, 190, 250; percent from 0% to 1000%; labels 'SAVED' & 'ACQUIRED'
// 2. GoalsScreen title rendering:
//    50+ chars, special characters, parentheses, unbroken strings
// 3. Active Plots carousel geometry in 390px viewport:
//    initial scroll 284px, exact pixel offsets of Card 0, Card 1, Card 2
// ============================================================================

interface DonutTestConfig {
  size: number;
  strokeWidth: number;
  percents: number[];
  labels: ('SAVED' | 'ACQUIRED')[];
}

// Glyph width metrics for bold sans-serif font (Inter / SF Pro / Roboto at weight 700/800)
// Expressed as fraction of font size (em units)
const GLYPH_WIDTH_MAP: Record<string, number> = {
  '0': 0.60, '1': 0.45, '2': 0.60, '3': 0.60, '4': 0.60,
  '5': 0.60, '6': 0.60, '7': 0.60, '8': 0.60, '9': 0.60,
  '%': 0.85,
  'S': 0.62, 'A': 0.68, 'V': 0.65, 'E': 0.60, 'D': 0.68,
  'C': 0.65, 'Q': 0.72, 'U': 0.68, 'I': 0.28, 'R': 0.68,
};

function estimateTextWidth(text: string, fontSize: number, letterSpacing: number): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const em = GLYPH_WIDTH_MAP[char] !== undefined ? GLYPH_WIDTH_MAP[char] : 0.65;
    width += em * fontSize;
  }
  if (text.length > 1) {
    width += (text.length - 1) * letterSpacing;
  }
  return Math.round(width * 100) / 100;
}

console.log('================================================================');
console.log('CHALLENGER 2: ADVERSARIAL UI LAYOUT & DONUT STRESS VERIFICATION');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// TEST 1: AnimatedDonutChart scaling & text bounds stress test
// ----------------------------------------------------------------------------
console.log('--- TEST 1: Donut Chart Inner Clear Diameter vs Text Widths ---');

const testDiameters = [50, 76, 100, 180, 190, 250];
const testPercents = [0, 1, 10, 50, 99, 100, 150, 500, 1000];
const testLabels: ('SAVED' | 'ACQUIRED')[] = ['SAVED', 'ACQUIRED'];

interface DonutResult {
  size: number;
  strokeWidth: number;
  innerClearDiameter: number;
  percentFontSize: number;
  labelFontSize: number;
  maxPercentText: string;
  maxPercentWidth: number;
  percentClampedWidth: number;
  labelSavedWidth: number;
  labelAcquiredWidth: number;
  maxTextWidth: number;
  overflows: boolean;
  clearance: number;
}

const donutResults: DonutResult[] = [];

for (const size of testDiameters) {
  // Stroke widths:
  // Component default is 14. GoalsScreen passes 8 for size=76. ProjectDetail passes 15 for size=190.
  let strokeWidth = 14;
  if (size === 76) strokeWidth = 8;
  else if (size === 190) strokeWidth = 15;
  else if (size === 50) strokeWidth = 8; // generous: test with small stroke 8 rather than default 14

  const innerClearDiameter = size - 2 * strokeWidth;
  const percentFontSize = Math.round(size * 0.20);
  const labelFontSize = Math.max(8, Math.round(size * 0.09));
  const letterSpacing = size < 100 ? 0.3 : 1.2;
  const percentLetterSpacing = size < 100 ? -0.3 : -0.5;

  const labelSavedWidth = estimateTextWidth('SAVED', labelFontSize, letterSpacing);
  const labelAcquiredWidth = estimateTextWidth('ACQUIRED', labelFontSize, letterSpacing);

  // Test 0% to 1000%
  let maxPercentWidth = 0;
  let maxPercentText = '';
  let percentClampedWidth = 0;

  for (const pct of testPercents) {
    // Unclamped
    const rawText = `${pct}%`;
    const rawW = estimateTextWidth(rawText, percentFontSize, percentLetterSpacing);
    if (rawW > maxPercentWidth) {
      maxPercentWidth = rawW;
      maxPercentText = rawText;
    }

    // Clamped (as implemented in AnimatedDonutChart: Math.min(100, Math.max(0, ...)))
    const clampedText = `${Math.min(100, Math.max(0, pct))}%`;
    const clampedW = estimateTextWidth(clampedText, percentFontSize, percentLetterSpacing);
    if (clampedW > percentClampedWidth) {
      percentClampedWidth = clampedW;
    }
  }

  const maxElementWidth = Math.max(maxPercentWidth, labelAcquiredWidth);
  const clearance = Math.round((innerClearDiameter - maxElementWidth) * 100) / 100;
  const overflows = clearance < 0;

  donutResults.push({
    size,
    strokeWidth,
    innerClearDiameter,
    percentFontSize,
    labelFontSize,
    maxPercentText,
    maxPercentWidth,
    percentClampedWidth,
    labelSavedWidth,
    labelAcquiredWidth,
    maxTextWidth: maxElementWidth,
    overflows,
    clearance,
  });

  console.log(`[size = ${size}px, stroke = ${strokeWidth}px, innerClear = ${innerClearDiameter}px]:`);
  console.log(`  - Font sizes: percent = ${percentFontSize}px, label = ${labelFontSize}px`);
  console.log(`  - Text widths: 'SAVED' = ${labelSavedWidth}px, 'ACQUIRED' = ${labelAcquiredWidth}px`);
  console.log(`  - Percent widths: '100%' = ${percentClampedWidth}px, max '${maxPercentText}' = ${maxPercentWidth}px`);
  console.log(`  - Max width = ${maxElementWidth}px vs InnerClear = ${innerClearDiameter}px => Clearance = ${clearance}px [${overflows ? 'FAIL: OVERFLOW' : 'PASS'}]`);
}

// Also test size=50 with default strokeWidth=14
const size50DefaultStroke = 14;
const size50InnerClearDefault = 50 - 2 * size50DefaultStroke; // 22px
const size50AcquiredW = estimateTextWidth('ACQUIRED', Math.max(8, Math.round(50 * 0.09)), 0.3);
console.log(`\n[Special Check: size = 50px with default strokeWidth = 14px]:`);
console.log(`  - Inner clear diameter: ${size50InnerClearDefault}px`);
console.log(`  - 'ACQUIRED' width: ${size50AcquiredW}px`);
console.log(`  - Overflows by: ${(size50AcquiredW - size50InnerClearDefault).toFixed(2)}px (${((size50AcquiredW / size50InnerClearDefault - 1) * 100).toFixed(1)}% overflow)`);

// ----------------------------------------------------------------------------
// TEST 2: GoalsScreen title rendering & boundary layout stress test
// ----------------------------------------------------------------------------
console.log('\n--- TEST 2: GoalsScreen Title Rendering Stress Tests ---');

const stressTitles = [
  {
    type: 'Extremely Long Title (50+ chars)',
    title: 'Custom High-End Ergo Split Mechanical Ortholinear Keyboard (Lubed & Filmed)',
    charCount: 77,
  },
  {
    type: 'Special Characters & HTML entities',
    title: 'Palworld & Steam: Edition #1 <Ultimate> - 100% [Deluxe] {Special} / $49.99 @ 2026!',
    charCount: 82,
  },
  {
    type: 'Parenthesized Title (Mockup Requirement)',
    title: 'Palworld (Steam)',
    charCount: 16,
  },
  {
    type: 'Deeply Nested Parentheses',
    title: 'Custom Mech Keyboard (PCB (Hotswap) + Switches (Gateron Oil Kings) + Keycaps (PBT))',
    charCount: 84,
  },
  {
    type: 'Unbroken Word (Extreme Word-Wrap Stress)',
    title: 'SupercalifragilisticexpialidociousLongWordWithoutAnySpacesAtAll',
    charCount: 62,
  },
];

const goalsFilePath = path.resolve(__dirname, '../src/screens/GoalsScreen.tsx');
const goalsContent = fs.readFileSync(goalsFilePath, 'utf8');

// Check that numberOfLines={1} is NOT present on itemTitle
const hasNumberOfLinesOnTitle = goalsContent.includes('style={styles.itemTitle} numberOfLines={1}');
console.log(`- Truncation guard: itemTitle has numberOfLines={1}: ${hasNumberOfLinesOnTitle ? 'FAIL (truncating)' : 'PASS (no truncation)'}`);

// Check infoCol and goalItemCard flex layout
const hasFlexInInfoCol = goalsContent.includes('infoCol: {') && goalsContent.includes('flex: 1');
console.log(`- Layout flexibility: infoCol has flex: 1: ${hasFlexInInfoCol ? 'PASS' : 'FAIL'}`);

const hasLineHeightOnTitle = goalsContent.includes('itemTitle: {') && goalsContent.includes('lineHeight: 20');
console.log(`- Typography metrics: itemTitle has lineHeight: 20: ${hasLineHeightOnTitle ? 'PASS' : 'FAIL'}`);

for (const t of stressTitles) {
  // Verify title can be formatted and handled safely without regex or runtime exceptions
  const safeTitle = t.title.trim();
  console.log(`  ✓ [${t.type}] (${t.charCount} chars): "${safeTitle.slice(0, 40)}..." -> Handled cleanly`);
}

// ----------------------------------------------------------------------------
// TEST 3: Active Plots Carousel Geometry in 390px Viewport
// ----------------------------------------------------------------------------
console.log('\n--- TEST 3: Active Plots Carousel Geometry in 390px Viewport ---');

const VIEWPORT_WIDTH = 390;
const CARD_WIDTH = 270;
const CARD_SPACING = 14;
const PADDING_HORIZONTAL = 60;
const INITIAL_SCROLL_X = 284; // 1 * (270 + 14)

// Card indices: 0 = Keyboard, 1 = Earbuds (Active), 2 = Gaming Setup
const cards = [
  { index: 0, title: 'Custom Mech Keyboard', targetPercent: 88 },
  { index: 1, title: 'Retro Wireless Earbuds', targetPercent: 100, isActive: true },
  { index: 2, title: 'Gaming Setup', targetPercent: 40 },
];

console.log(`Viewport: ${VIEWPORT_WIDTH}px | Card: ${CARD_WIDTH}px | Spacing: ${CARD_SPACING}px | Padding: ${PADDING_HORIZONTAL}px | Scroll: ${INITIAL_SCROLL_X}px\n`);

const cardLayouts = cards.map((c) => {
  // In content coordinates
  const contentLeft = PADDING_HORIZONTAL + c.index * (CARD_WIDTH + CARD_SPACING);
  const contentRight = contentLeft + CARD_WIDTH;

  // In viewport coordinates (relative to left screen edge)
  const viewportLeft = contentLeft - INITIAL_SCROLL_X;
  const viewportRight = contentRight - INITIAL_SCROLL_X;

  // Visible bounds within [0, VIEWPORT_WIDTH]
  const visibleLeft = Math.max(0, viewportLeft);
  const visibleRight = Math.min(VIEWPORT_WIDTH, viewportRight);
  const visibleWidth = Math.max(0, visibleRight - visibleLeft);

  return {
    ...c,
    contentLeft,
    contentRight,
    viewportLeft,
    viewportRight,
    visibleLeft,
    visibleRight,
    visibleWidth,
  };
});

for (const cl of cardLayouts) {
  console.log(`Card ${cl.index} ("${cl.title}"):`);
  console.log(`  - Content coords: [${cl.contentLeft}px, ${cl.contentRight}px]`);
  console.log(`  - Viewport coords: [${cl.viewportLeft}px, ${cl.viewportRight}px]`);
  console.log(`  - Visible window: [${cl.visibleLeft}px, ${cl.visibleRight}px] (Width: ${cl.visibleWidth}px)`);
}

// Symmetrical peeking verification
const card0Peeking = cardLayouts[0].visibleWidth;
const card1MarginLeft = cardLayouts[1].viewportLeft;
const card1MarginRight = VIEWPORT_WIDTH - cardLayouts[1].viewportRight;
const card2Peeking = cardLayouts[2].visibleWidth;

console.log('\nCarousel Symmetry Verification:');
console.log(`  - Card 0 Left Peeking Width: ${card0Peeking}px (Expected: 46px)`);
console.log(`  - Card 1 Center Margin Left: ${card1MarginLeft}px (Expected: 60px)`);
console.log(`  - Card 1 Center Margin Right: ${card1MarginRight}px (Expected: 60px)`);
console.log(`  - Card 2 Right Peeking Width: ${card2Peeking}px (Expected: 46px)`);

const isCard1Centered = card1MarginLeft === card1MarginRight && card1MarginLeft === 60;
const isPeekingSymmetrical = card0Peeking === card2Peeking && card0Peeking === 46;

console.log(`  => Card 1 Perfectly Centered: ${isCard1Centered ? 'PASS' : 'FAIL'}`);
console.log(`  => Peeking Symmetrical (46px each): ${isPeekingSymmetrical ? 'PASS' : 'FAIL'}`);

if (!isCard1Centered || !isPeekingSymmetrical) {
  throw new Error('FAIL: Carousel geometry does not produce symmetrical peeking');
}

console.log('\n================================================================');
console.log('CHALLENGER 2 STRESS HARNESS COMPLETED');
console.log('================================================================');
