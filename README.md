<div align="center">
  <img src="public/bunkmate-mascot.png" alt="BunkMate Mascot" width="120" />
  <h1>BunkMate</h1>
  <p><strong>Your Attendance. Your Control.</strong></p>
  <p>A modern, offline-first student companion app engineered for university semesters. Track lectures, calculate safe bunks, isolate theory and labs, and avoid detention with dual-rule compliance alerts.</p>

  <p>
    <a href="#key-features">Key Features</a> •
    <a href="#branding--personality">Branding</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#android-apk">Android APK</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 🚀 Key Features

- **🎓 Dual-Rule Detention Protection**:
  - Independent tracking against your official college target (e.g., **75%**) and safety floor (e.g., **60%**).
  - Instant alerts before any subject breaches critical thresholds.
- **🛡️ Real-Time Safe Bunk Calculator**:
  - Mathematically accurate bunk margins per course and overall:
    $$\text{Safe Bunks} = \left\lfloor \frac{\text{Attended} - (\text{Conducted} \times \text{Target})}{1 - \text{Target}} \right\rfloor$$
  - Tells you exactly how many lectures you can safely skip or how many consecutive classes you must attend to recover.
- **🔬 Theory & Lab Isolation**:
  - Practical lab sessions and theory lectures are tracked independently so short-term lab absences don't unexpectedly skew your overall status.
- **🔄 Timetable Swaps & Compensatory Classes**:
  - Log swapped periods cleanly without corrupting the scheduled course metrics (`0/0` conducted for scheduled, `+1/+1` for actual).
  - Add compensatory/extra lectures anytime.
- **📅 Visual Academic Calendar**:
  - Monthly attendance heat-map showing daily present, absent, cancelled, and unlogged days with 1-tap bulk marking.
- **🔒 100% Offline & Private**:
  - All logs, timetables, and profile data stay on your device via `localStorage`. No mandatory logins, no tracking, and zero cloud dependency.
  - One-click portable JSON backup and restore.

---

## 🎨 Branding & Personality

BunkMate is built with a student-friendly SaaS aesthetic and an animated panda mascot:

| Color Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Navy** | `#171642` | Primary text, headers, dark cards, launcher backgrounds |
| **Electric Purple** | `#7047FF` | Accent buttons, active tabs, mascot checkmark, highlights |
| **Soft Lavender** | `#E9E3FF` | Secondary badges, pills, subtle tint borders |
| **Pure White** | `#FFFFFF` | Background cards, high-contrast text |

- **Animated Mascot**: Features the panda mascot in the letter 'B' with a graduation cap and checkmark. Includes gentle floating and bounce animations that respect `prefers-reduced-motion`.
- **Responsive Architecture**: Fluid layouts from ultra-compact screens (320px foldables) to tablets, desktop monitors, and Android notches (`pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide Icons
- **Charts**: Recharts (`ResponsiveContainer`, `BarChart`, `PieChart`)
- **Testing**: Vitest (`12 passed unit tests` verifying calculation math)
- **Mobile Engine**: Capacitor 8 (Android runtime)

---

## 🏁 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bunkmate.git
cd bunkmate

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Building

```bash
# Run unit tests
npm test

# Production build
npm run build
```

---

## 📱 Android APK

BunkMate includes a native Android wrapper with home-screen launch animations and offline storage support:

```bash
# Sync web build to Android project
npx cap sync

# Open project in Android Studio
npx cap open android

# Build debug APK directly from terminal (requires JDK)
cd android
./gradlew assembleDebug
```

The compiled APK binary is stored at:
- `public/BunkMate.apk`
- `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Deployment (Vercel Ready)

This repository includes a pre-configured [`vercel.json`](./vercel.json) supporting Single Page Application (SPA) routing:

```bash
# Deploy with Vercel CLI
vercel --prod
```

Or connect the repository to your Vercel Dashboard with framework preset set to **Vite**.

---

<div align="center">
  <sub>Built with ❤️ for college and engineering students. BunkMate &bull; Your Attendance. Your Control.</sub>
</div>
