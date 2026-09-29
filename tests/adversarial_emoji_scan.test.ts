declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('=== Running Adversarial Unicode Emoji & Symbol Scan ===');

function walk(dir: string): string[] {
  let r: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      r = r.concat(walk(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      r.push(fullPath);
    }
  }
  return r;
}

const targetFiles = walk(path.resolve(__dirname, '../src')).concat([
  path.resolve(__dirname, '../App.tsx'),
]);

// Exhaustive regular expressions
const emojiPresentationRegex = /\p{Emoji_Presentation}/gu;
const emojiModifierRegex = /\p{Emoji_Modifier}/gu; // Skin tone modifiers
const regionalFlagRegex = /[\u{1F1E6}-\u{1F1FF}]{2}/gu; // Country flags
const extendedARegex = /[\u{1FA00}-\u{1FAFF}]/gu; // Symbols and Pictographs Extended-A (e.g. 🪙 \u{1FA99})
const miscSymbolsPictographs = /[\u{1F300}-\u{1F5FF}]/gu;
const emoticons = /[\u{1F600}-\u{1F64F}]/gu;
const transportMap = /[\u{1F680}-\u{1F6FF}]/gu;
const supplementalSymbols = /[\u{1F900}-\u{1F9FF}]/gu;

// Characters explicitly allowed by R1/R3 requirements (Unicode text dingbats/symbols, NOT emojis):
// U+2713: Check mark ✓
// U+2726: 4-point star ✦
const ALLOWED_SYMBOLS = new Set(['✓', '✦']);

interface EmojiViolation {
  file: string;
  line: number;
  char: string;
  codePoint: string;
  category: string;
}

const violations: EmojiViolation[] = [];

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText: string, idx: number) => {
    // 1. Emoji Presentation check
    const epMatches = lineText.match(emojiPresentationRegex);
    if (epMatches) {
      for (const m of epMatches) {
        if (!ALLOWED_SYMBOLS.has(m)) {
          violations.push({
            file: path.relative(path.resolve(__dirname, '..'), file),
            line: idx + 1,
            char: m,
            codePoint: 'U+' + (m.codePointAt(0) || 0).toString(16).toUpperCase(),
            category: 'Emoji_Presentation',
          });
        }
      }
    }

    // 2. Emoji Modifier (skin tones)
    const emMatches = lineText.match(emojiModifierRegex);
    if (emMatches) {
      for (const m of emMatches) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '..'), file),
          line: idx + 1,
          char: m,
          codePoint: 'U+' + (m.codePointAt(0) || 0).toString(16).toUpperCase(),
          category: 'Skin_Tone_Modifier',
        });
      }
    }

    // 3. Flags
    const flagMatches = lineText.match(regionalFlagRegex);
    if (flagMatches) {
      for (const m of flagMatches) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '..'), file),
          line: idx + 1,
          char: m,
          codePoint: m,
          category: 'Regional_Flag',
        });
      }
    }

    // 4. Extended-A (e.g. 🪙)
    const extAMatches = lineText.match(extendedARegex);
    if (extAMatches) {
      for (const m of extAMatches) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '..'), file),
          line: idx + 1,
          char: m,
          codePoint: 'U+' + (m.codePointAt(0) || 0).toString(16).toUpperCase(),
          category: 'Pictographs_Extended_A',
        });
      }
    }

    // 5. Pictographs, Emoticons, Transport, Supplemental
    const allBlocks = [miscSymbolsPictographs, emoticons, transportMap, supplementalSymbols];
    for (const b of allBlocks) {
      const bMatches = lineText.match(b);
      if (bMatches) {
        for (const m of bMatches) {
          if (!ALLOWED_SYMBOLS.has(m)) {
            violations.push({
              file: path.relative(path.resolve(__dirname, '..'), file),
              line: idx + 1,
              char: m,
              codePoint: 'U+' + (m.codePointAt(0) || 0).toString(16).toUpperCase(),
              category: 'Emoji_Block',
            });
          }
        }
      }
    }
  });
}

// Deduplicate violations by file + line + char
const uniqueViolations = violations.filter(
  (v, i, arr) =>
    arr.findIndex(
      (o) => o.file === v.file && o.line === v.line && o.char === v.char
    ) === i
);

console.log(`Scanned ${targetFiles.length} source files.`);
if (uniqueViolations.length > 0) {
  console.error(`Found ${uniqueViolations.length} OS emoji violations:`);
  console.error(JSON.stringify(uniqueViolations, null, 2));
}

assert(
  uniqueViolations.length === 0,
  `Exhaustive Unicode scan found ${uniqueViolations.length} OS emojis in UI codebase!`
);

console.log('✓ PASS: Exhaustive Unicode scan detected 0 OS emojis across all source files!');
