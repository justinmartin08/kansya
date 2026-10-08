const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let token = (process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
if (!token) {
  try {
    const creds = cp.execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
    const m = creds.match(/password=(.+)/);
    if (m) {
      token = m[1].trim();
    }
  } catch (err) {
    // fallback
  }
}
if (!token) {
  console.error('Failed to get GitHub token from GH_TOKEN / GITHUB_TOKEN or credential manager');
  process.exit(1);
}

const notes = `## 🌱 Kansya v2.0.0 Release

### 📱 Standalone Android APK
Download \`kansya-v2.0.0.apk\` below and install directly on your Android phone (100% offline-first, zero server setup required)!

### ✨ What's New in v2.0.0
- 🐷 **Brand & Mascot Redesign**:
  - Flat-vector green piggy-bank app logo filling icon edge-to-edge across all Android mipmap densities and adaptive icons.
  - High-res 3D ceramic Kansya piggy companions on dashboard hero and wishlist screens.
  - ProgressiveAlkansya with crisp visibility in both Light mode (#E8F7EE) and Dark mode (#142F26).
- 🎵 **Standard Expo Audio Engine**:
  - Original calming 16s lo-fi ambient background music loop (\`assets/sounds/ambient_loop.mp3\`).
  - Tactile sound effects (coin drop, soft tap, milestone chime, celebration fanfare).
  - In-app Settings toggles for Sound Effects (default ON) and Background Music (default OFF) with AppState background pause.
- 🧹 **100% Clean Slate Start**:
  - Purged mockup data (₱0 initial savings, zero fake Sep 30 logs, zero mock projects).
  - Trophies overhaul with meaningful financial milestones (0/10 trophies unlocked on fresh start; no premature unlock).
- 🎨 **Custom SVG Icon Family & UI Polish**:
  - Redrawn organic PlantSprout icon and unified stroke-width iconography.
  - Fixed hero overlap: comfortable ~30px breathing room between Total Savings and Current Goal card.
  - Goals Screen differentiated from Wishlist ("SAVINGS GOALS / Your Active Goals").
  - Cleaned developer jargon ("Obsidian Navy", "Option 3").

### 📦 Artifacts
- \`kansya-v2.0.0.apk\`: Standalone release APK (Version Code 3, Hermes Bytecode, ARM64 / ARMv7 / x86 / x86_64).
- \`kansya-v1.0.0.apk\`: Legacy compatibility release APK.

### 📄 License
Distributed under the MIT License.
`;

const notesFile = path.join(__dirname, 'RELEASE_NOTES.tmp.md');
fs.writeFileSync(notesFile, notes, 'utf8');

try {
  try {
    console.log('Publishing GitHub release v2.0.0...');
    cp.execSync(
      'gh release create v2.0.0 kansya-v2.0.0.apk kansya-v1.0.0.apk --title "Kansya v2.0.0 - Brand Redesign, Expo Audio Engine & Complete Polish" --notes-file "' + notesFile + '"',
      {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit',
      }
    );
    console.log('Release v2.0.0 published successfully!');
  } catch (createErr) {
    console.log('Release v2.0.0 already exists, uploading updated assets with --clobber...');
    cp.execSync(
      'gh release upload v2.0.0 kansya-v2.0.0.apk kansya-v1.0.0.apk --clobber',
      {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit',
      }
    );
    console.log('Release v2.0.0 assets updated successfully!');
  }

  // Also update v1.0.0 release assets so anyone downloading from the old link gets the fresh build
  try {
    console.log('Updating v1.0.0 asset with latest build for backward compatibility...');
    cp.execSync(
      'gh release upload v1.0.0 kansya-v1.0.0.apk --clobber',
      {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit',
      }
    );
    console.log('v1.0.0 asset updated successfully!');
  } catch (err) {
    console.warn('Note: Could not update v1.0.0 asset (optional):', err.message);
  }
} finally {
  if (fs.existsSync(notesFile)) {
    fs.unlinkSync(notesFile);
  }
}
