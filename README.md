# 🌿 Munda Wanga Sanctuary & Gardens

> **Explore Zambia’s Wild Heart** — An immersive, high-ticket digital interface featuring lush botanical trails, a wildlife sanctuary, sensory soundscapes, interactive route navigation, and an immersive gallery.

Rebuilt exactly as designed in Framer with ultra-premium responsiveness, fluid transitions, and a modern dark slate aesthetic. 

---

## 🎨 Design System & Aesthetic Pairings

Following the **Taste Skill** framework, this application avoids generic startup colors and visual patterns in favor of a bespoke, luxurious experience:
- **Color Palette**: Deep Espresso backgrounds (`#0b1110`), Warm Lattes, Off-Whites, and Fresh Greens (`#acffa3`) that reinforce the sanctuary's organic, wild identity.
- **Typography**: Editorial display headings paired with clean, ultra-legible "Inter" body text and monospace "JetBrains Mono" accents for sensory status displays.
- **Asymmetrical Grids**: Replaced cookie-cutter layout systems with customized, overlapping structural columns and generous negative space to let the visual elements breathe.
- **Micro-interactions**: High-fidelity hover states, elegant modal triggers, and custom cubic-bezier ease curves for all drawer slides and gallery transitions.

---

## 🚀 Key Features

### 1. 🖼️ Immersive Gallery & Focused Spotlight
- **Intelligent Carousel**: Automatic and manual layout rotators that prioritize centered active visual cards.
- **Interactive Focus Spotlight**: Clicking the centered active gallery image triggers a gorgeous full-screen modal backdrop (`backdrop-blur-2xl`) for a high-fidelity visual experience.
- **Spotlight Navigation**: Users can scroll through spotlighted cards using left/right controllers or standard `Escape` key close gestures.
- **Linked Navigation**: Out-of-bounds gallery item clicks rotate and scroll the carousel into target alignment dynamically.

### 2. 🗺️ Custom Trail Guides & Garden Routes
- Explore the **Mahogany Path**, **Cycad Circle**, or **Water Gardens** with dynamic media panels, interactive audio previews, and real-time rehabilitation stats.

### 3. 🔊 Integrated Sensory Soundscape Engine
- Toggle spatial audio modes (deep jungle, aviary choir, canopy wind) to accompany your virtual exploration of the Zambian landscape.

### 4. 🎫 Secure Digital Pass Generator
- Dynamic ticket builder that validates visitor counts and spits out a styled digital entry pass with secure QR configurations.

---

## ⚙️ Development & Local Setup

To run this React & Vite application locally, follow these simple steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
This spins up the local webserver on port `3000`. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
To bundle and optimize the static files for production deployment:
```bash
npm run build
```
The output will be created inside the `dist/` directory, ready to be hosted on Netlify, Vercel, GitHub Pages, or Cloud Run.

### 4. Code Quality & Linting
Ensure type safety and clean formatting across all source files:
```bash
npm run lint
```

---

## 📦 File Structure

```text
├── src/
│   ├── assets/              # High-definition imagery & branding assets
│   ├── components/          # Reusable UI cards, drawers, & modals
│   ├── App.tsx              # Core app entrypoint with interactive state engines
│   ├── main.tsx             # React bootstrap & mount layer
│   └── index.css            # Tailwind custom utility overrides & keyframe animations
├── package.json             # Manifest of build scripts & packages
├── tsconfig.json            # Strict TypeScript compilation rules
└── vite.config.ts           # Bundler plugins & server options
```

---

*Recreated with absolute visual precision for the Munda Wanga Conservation Trust.*
