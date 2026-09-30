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

const notes = `## 🌱 Kansya v1.1.0 Release

### 📱 Standalone Android APK
Download \`kansya-v1.1.0.apk\` below and install directly on your Android phone (100% offline-first, zero server setup required)!

### ✨ What's New in v1.1.0
- 🐷 **Calm Kansya Mobile Design System & 3D Piggy Mascot**:
  - Welcoming 3D porcelain emerald piggy companion cheering on wishlist milestones and dashboard goals.
  - Soothing forest-inspired palette with high WCAG accessibility contrast.
  - Interactive design mockups (\`assets/mockups/\`) for light/dark modes.
- 🎯 **Wishlist & Goal Action Improvements**:
  - Deposit action button directly within Goal details.
  - Transaction history modal and enhanced ledger breakdown.
- 🌗 **Dynamic Light & Dark Theme Engine**:
  - Instant Sun/Moon toggle with dual sunrise & sunset mountain illustrations.
- 👤 **Offline Profile & Security Vault**:
  - 6 curated savings avatars, Eye/EyeOff password toggles, and master offline recovery key.
- 👥 **Collab Squad & 6-Character Squad Codes**:
  - Create shared duo/group goals with codes like \`BORA-924\` and track real-time contribution ledgers.
- 🎓 **Custom College Schedule**:
  - Dynamic 1 to 7 school day baon calculator.
- 🏆 **10 Trophies & Milestones**:
  - Clean-slate onboarding with dynamic unlock thresholds.

### 📦 Artifacts
- \`kansya-v1.1.0.apk\` (77.4 MB): Standalone release APK (Version Code 2, Hermes Bytecode, ARM64 / ARMv7 / x86 / x86_64).
- \`kansya-v1.0.0.apk\` (77.4 MB): Legacy compatibility release APK.

### 📄 License
Distributed under the MIT License.
`;

const notesFile = path.join(__dirname, 'RELEASE_NOTES.tmp.md');
fs.writeFileSync(notesFile, notes, 'utf8');

try {
  try {
    console.log('Publishing GitHub release v1.1.0...');
    cp.execSync(
      'gh release create v1.1.0 kansya-v1.1.0.apk kansya-v1.0.0.apk --title "Kansya v1.1.0 - Calm Mobile Design System and 3D Piggy Mascot" --notes-file "' + notesFile + '"',
      {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit',
      }
    );
    console.log('Release v1.1.0 published successfully!');
  } catch (createErr) {
    console.log('Release v1.1.0 already exists, uploading updated assets with --clobber...');
    cp.execSync(
      'gh release upload v1.1.0 kansya-v1.1.0.apk kansya-v1.0.0.apk --clobber',
      {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit',
      }
    );
    console.log('Release v1.1.0 assets updated successfully!');
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
