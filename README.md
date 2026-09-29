# 🌱 Kansya (カンシャ)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20%7C%20iOS-blue.svg)](https://reactnative.dev)
[![Framework](https://img.shields.io/badge/Framework-Expo%20%2F%20React%20Native-000000.svg)](https://expo.dev)
[![Offline](https://img.shields.io/badge/Database-100%25%20Offline%20AsyncStorage-10B981.svg)](#-offline-first-architecture)
[![Build](https://img.shields.io/badge/Release-APK%20v1.0.0-success.svg)](#-standalone-android-apk)

> **Sleek Modern Savings Engine & Wishlist Tracker for Students & Dreamers**  
> *Turn your daily school baon into real-world wishlist goals with glowing circular progress rings, smart pace forecasting, and collaborative squad goals.*

---

## 📸 Key Features

### 🌗 1. Dynamic Light & Dark Theme Engine
- **Instant Header Toggle**: Tap the **Sun / Moon** icon in the top header row for an instant, fluid 200ms ease-out switch.
- **Dark Mode (Obsidian Navy)**: Deep obsidian navy (`#0B111E`), slate cards (`#1E293B`), neon emerald accents, and an evening sunset mountain greeting.
- **Light Mode (Crisp Porcelain)**: Crisp porcelain background (`#F8FAFC`), pure white cards (`#FFFFFF`), high-contrast slate typography (`#0F172A`), and a morning sunrise mountain greeting with golden rays.
- **100% Theme Consistency**: Every card surface, text label, and progress donut adapts seamlessly to prevent washed-out text.

### 👤 2. Profile Customization & Offline Security Vault
- **Curated Avatar Selector**: Choose from 6 geometric savings avatars (Mint Shield, Golden Vault, Emerald Piggy, Diamond Lock, Sapphire Chest, Ruby Spark) with live preview.
- **Password Visibility Toggles**: Interactive `Eye` / `EyeOff` toggles on registration, sign in, and password change fields.
- **100% Offline Master Recovery Key**: Generates a private 12-character recovery key (`KANSYA-XXXX-XXXX`) saved locally on your device for account recovery without internet or third-party servers.

### 👥 3. Collab Squad (Duo & Group Shared Goals)
- **Top Segment Switcher**: Easily switch between **Personal Goals** and **Collab Squad** on the Wishlist tab.
- **Squad Invitations**: Invite friends by typing their `@username`, accept/decline pending invites, and track team progress.
- **Member Contribution Ledger**: Displays real-time breakdown of each collaborator's deposited amount and percentage share (e.g., `Justin: ₱1,500 (60%)`, `Alex: ₱1,000 (40%)`).
- **In-App Squad Activity Alerts**: Instant notification banners when a collaborator makes a deposit.

### 🎓 4. Custom College Class Schedule (1–7 Days)
- **Interactive Day Selector**: Replace rigid 5-day schedules with interactive chips from `1d` to `7d`.
- **Dynamic Weekly Power**: Calculates weekly savings capacity dynamically (`Daily Excess × Selected Days`) tailored to flexible university class schedules.

### 📈 5. Financial Engine & Smart Pace Forecasting
- **Live Pace Projections**: Dynamically calculates days and target completion dates based on current daily baon excess and past deposit frequency.
- **Animated Progress Donut**: Smooth SVG vector circular sweep with tactile physics and custom liquid gold/emerald fill.
- **Progressive Philippine Peso Medallion**: Custom vector coin with multi-tiered beveled metallic rims and an embossed ₱ symbol.

### 🏆 6. 100% Clean Slate & Dynamic Milestones
- **Zero Pre-loaded Dummy Data**: Fresh installs start completely clean with **0 goals**, **₱0 saved**, and **0/10 trophies unlocked**.
- **10 Milestone Trophies**: Trophies evaluate dynamically on real deposit events (First Coin in the Jar, Construction Phases at 15%, 30%, 60%, 85%, 100%, Consistent Saver, etc.).

---

## 🔒 Offline-First Architecture

Kansya is built from the ground up as a **100% offline-first application**:
- **Local Database (`AsyncStorage`)**: All user accounts, encrypted password hashes, personal wishlist goals, Collab Squads, and deposit ledgers are stored strictly in your phone's private sandbox storage.
- **Zero Tracking / Zero Telemetry**: Kansya does not connect to external tracking services, analytics, or remote ad networks.
- **No Cloud Required**: Works anywhere—inside classrooms, in rural areas, during flights, or with mobile data turned completely off.

### ❓ How Squad Invitations Work in an Offline App
1. **Current Implementation (Local Multi-User)**:
   - Multiple users can register on the same device. When `@justin` invites `@alex`, the app searches the phone's local user registry. When `@alex` signs in, the invite appears under their Collab Squad tab.
2. **Roadmap / Multi-Device Options**:
   - **P2P QR Code & File Sharing (100% Offline)**: Exporting an encrypted `.kansya` invite token or QR code that friends can scan or transfer via Bluetooth / Quick Share.
   - **Local Wi-Fi P2P (mDNS)**: Automatic squad discovery when connected to the same campus Wi-Fi or mobile hotspot.
   - **Optional Hybrid Cloud (Supabase/Firebase)**: Optional cloud sync for remote friends who want live online sync while preserving offline caching.

---

## 📱 Standalone Android APK

You can directly install the pre-compiled Android release APK:
- **Location**: `kansya-v1.0.0.apk`
- **Architecture**: Hermes Bytecode, ARM64 / x86_64, Android 7.0+ (API 24+)
- **Install via ADB**:
  ```bash
  adb install -r kansya-v1.0.0.apk
  ```

---

## 🚀 Getting Started (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- [Expo CLI](https://docs.expo.dev/)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/kansya.git
cd kansya
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development

#### Web Preview (Interactive Desktop Phone Chassis)
```bash
npm run web
```
Opens in your browser at `http://localhost:8081` inside a smartphone chassis (`390px` wide).

#### Mobile via Expo Go
```bash
npm run start
```
Scan the QR code in your terminal with the **Expo Go** app on your Android or iOS device.

#### Build Android Release APK Locally
```bash
cd android
./gradlew assembleRelease
```
The output APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 🧪 Automated Testing

Kansya includes 7 comprehensive automated test suites covering financial mathematics, edge cases, milestone logic, theme consistency, and clean-slate onboarding:

```bash
# Run all test suites
npm test

# Run TypeScript typechecker
npx tsc --noEmit
```

---

## 📂 Project Structure

```
kansya/
├── App.tsx                          # App root container with safe-area & theme routing
├── app.json                         # Expo & Android native configuration
├── src/
│   ├── types/                       # TypeScript definitions (Wishlist, Collab, User, Allowance)
│   ├── store/
│   │   ├── KansyaContext.tsx        # React Context + AsyncStorage offline engine
│   │   └── defaultData.ts           # Clean slate initializers & milestone catalog
│   ├── utils/
│   │   ├── calculations.ts          # Financial math, progress clamping & pace forecasts
│   │   └── theme.ts                 # Light & Dark theme color palettes
│   ├── components/
│   │   ├── charts/
│   │   │   ├── AnimatedDonutChart.tsx # SVG circular progress ring with stroke animation
│   │   │   └── SparklineChart.tsx     # Bezier trend line with gradient area fill
│   │   ├── layout/
│   │   │   ├── MobileContainer.tsx    # Smartphone chassis on web, native on mobile
│   │   │   └── BottomNavDock.tsx      # Solid circular active tab navigation dock
│   │   ├── illustrations/
│   │   │   ├── MountainGreeting.tsx   # Dual sunrise & sunset vector mountain illustration
│   │   │   └── ProgressiveCoin.tsx    # Embossed Philippine Peso bullion medallion
│   │   ├── ui/
│   │   │   ├── AnimatedCounter.tsx    # Rolling numeric odometer
│   │   │   └── TactilePressable.tsx   # Fluid 0.97 scale press animation wrapper
│   │   └── modals/
│   │       ├── ProfileModal.tsx       # Avatar picker, account settings & offline recovery vault
│   │       ├── NewProjectModal.tsx    # Goal creation modal with live pace calculation
│   │       ├── QuickDepositModal.tsx  # Sleek bottom sheet for deposits
│   │       ├── AllowanceModal.tsx     # 1-7 days daily baon allowance configuration
│   │       └── TrophyRoomModal.tsx    # Hall of unlocked milestones
│   └── screens/
│       ├── AuthScreen.tsx             # Register / Login with Eye toggles & offline persistence
│       ├── HomeScreen.tsx             # Main dashboard with greeting, hero balance & carousel
│       ├── GoalsScreen.tsx            # Personal wishlist & Collab Squad management
│       ├── SavingsScreen.tsx          # Ledger analytics & deposit history
│       └── SettingsScreen.tsx         # Account profile & preferences
└── tests/                             # 7 Automated verification test suites
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Everyone is invited to modify, improve, or adapt Kansya.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
