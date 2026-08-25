# 📸 SnapFrame — App Store & Google Play Screenshot Studio

> **SnapFrame** is an ultra-fast, professional, and open-source screenshot generator for mobile apps. Create stunning, high-converting App Store (iOS & iPadOS) and Google Play (Phone & Android Tablet) screenshot presentations in seconds with built-in AI Superpowers, panoramic multi-screen backgrounds, official vector device frames, and full Fastlane metadata export.

---

## ✨ Key Features

### 🤖 AI Superpowers Suite (5-Provider Failover Engine)
- **✨ 1-Click Project Auto-Pilot:** Powered by Multimodal AI Vision (`gemini-3.6-flash`, `gpt-4o-mini`, `groq-llama-3.2-vision`, `mistral-pixtral`, `grok-2-vision`). Analyzes your uploaded app screenshots and automatically populates high-converting headlines, benefit subtitles, and panoramic matching color gradients across all screens in 1 click.
- **📈 AI Store Listing & ASO Generator:** Generates full, compliant App Store and Google Play metadata in any target language with strict store character limit enforcement:
  - *iOS:* App Name (≤ 30c), Subtitle (≤ 30c), Promotional Text (≤ 170c), Keywords Bank (≤ 100c), Description & What's New.
  - *Android:* App Title (≤ 30c), Short Description (≤ 80c), Full Description & What's New.
- **🪄 AI Copywriter & Tone Switcher:** Instant tone adaptations (🚀 *High Energy*, ✨ *Minimalist*, 🎯 *Benefit-Driven*, 🔥 *FOMO / Social Proof*, 💼 *B2B Enterprise*), auto-shorten under 30 characters, and 5 alternative headline suggestions.
- **🎨 AI Magic Theme Matcher:** 1-click curated and generated App Store color palettes (*OLED Midnight*, *Clean Cupertino*, *Vibrant Sunset*, *Cyber Neon*, *Pastel Aurora*, *Emerald Matrix*).
- **🧼 Smart Clean Status Bar:** Automatically overlays a crisp vector status bar (9:41 AM, 100% battery, 5G, 4 signal bars) with light/dark theme toggle, ensuring 100% compliance with Apple Store guidelines.
- **🌍 Native Cultural Localization:** Contextual, idiom-aware marketing translations across 60+ languages & regional dialects with strict length constraints.
- **🔒 Enterprise Security & Rate Limiting:** All AI endpoints enforce Firebase ID token verification, in-memory sliding window rate limiting, anti-SSRF protections, and secure server-managed keys.

---

### 📱 Multi-Platform & Tablet Support
- **Apple iOS & iPadOS:** iPhone 17 Pro, 16 Pro, 15 Pro, 14, and iPad Pro 13" (2048 × 2732 px).
- **Google Play & Android Tablets:** Google Pixel 10/11 Pro XL, Google Pixel 10/11 Pro, Google Pixel 9 Pro, Samsung Galaxy S25 Ultra, S24 Ultra, Samsung Galaxy Tab S9 Ultra, Galaxy Tab S7, and Galaxy Tab A.
- **Official Color Finishes:** Authentic HEX colors including *Natural Titanium*, *Desert Titanium*, *Obsidian*, *Porcelain*, *Titanium Gray*, *Ultramarine*, and more.
- **Proportional Scaling:** Adding a phone or tablet set automatically adapts and scales existing project templates proportionally.

---

### 🎨 Design & Canvas Capabilities
- **📝 Batch Captions Editor (Multi-Screen Headline Table):** Review and edit primary headlines and subtitles across all 10 screens in a single compact tabular view with live debounced canvas synchronization.
- **🎨 Project Brand Kit & Saved Colors:** Save custom corporate and app brand colors (HEX) per project with 1-click application across backgrounds, text typography, and graphic shapes.
- **🪄 Quick AI Text Actions:** 1-click optimization chips (✂️ *Shorten <30c*, 🔥 *Add Emojis*, 🎯 *Benefit-Driven*, 🚀 *High Energy*, ✨ *Rewrite Tone*, 💡 *5 Alternatives*) with strict App Store length limits.
- **Global Clipboard Paste (`Ctrl+V` / `Cmd+V`):** Paste screenshots directly from your system clipboard (`Win+Shift+S` / `Cmd+Shift+4`) straight into the selected device mockup frame without saving files or opening disk dialogs.
- **🧲 Smart Magnetic Snapping & Alignment Guides:** Intelligent multi-point alignment snapping (screen center, safe margins, and sibling layer boundaries) with real-time glowing cyan and magenta guide lines.
- **🔍 Native EyeDropper Color Picker:** 1-click screen color sampling directly from screenshots using `window.EyeDropper` API across background, text, and shape inspectors.
- **Continuous Panoramic Flow:** Connect seamless backgrounds, waves, gradients, or custom uploaded ultra-wide panoramas across multiple screens.
- **30+ Drag-and-Drop Block Elements:** Dynamic Islands, Live Activity workouts, iOS Toggle switches, Push Notification banners, Editors' Choice laurels, 30-Day Guarantee seals, Growth stats (+142%), and Before/After comparison cards.
- **Responsive & Adaptable Studio UI:** Built-in horizontal scroll rails with interactive chevrons, vertical-to-horizontal mouse wheel conversion, and automatic tab centering across all category filters (Templates, Block Elements, Color Themes, Stickers, Languages).
- **Ergonomic Template Cards & Controls:** Full-width titles with tooltip support, cleanly separated PRO and Screen-count indicators, responsive 2-column platform scope selectors ("All Platforms" vs "Active Only"), and a 5-column icon+label background switcher.
- **3D Multi-Screen Dashboard Covers:** Realistic layered 3D screen deck preview with dynamic ambient glow extracted from project background palettes, interactive hover micro-gallery (screen peek), app icon monograms, and headline teasers.
- **Real-Time Save Engine & Breadcrumb Renaming:** Live `Saving...` / `Cloud Synced` status badge with 1-click force save and header breadcrumb navigation (`Projects / [Name]`).
- **20+ Google Fonts:** Inter, Montserrat, Poppins, Outfit, Space Grotesk, Syne, Playfair Display, and more.
- **Lossless 2D Canvas Engine:** 100% visual parity between the real-time editor, Live Store Simulator, PNG clipboard copy, and production 4K ZIP export.

---

### 📦 Pro Export Suite & Store Submission
- **Structured Multi-Platform ZIP:** Dedicated non-colliding folders:
  - `App Store (iPhone)/`
  - `App Store (iPad)/`
  - `Google Play (Phone)/`
  - `Google Play (Tablet)/`
- **⚡ ASO A/B Testing Variant Generator:** 1-click generation of alternative test sets (High-Contrast Dark, Minimalist Clean Studio, Vibrant Glow, Bold Conversion Focus).
- **Fastlane `Deliverfile` & App Store Connect Package:** Includes an automated `Deliverfile` ready for `fastlane deliver`, `README-FASTLANE.md` instructions, and structured text files (`name.txt`, `subtitle.txt`, `description.txt`, `keywords.txt`, etc.).
- **Multi-Format Export Control:** Choose between **PNG Lossless (4K)**, **WebP (Optimized, <8MB)**, and **JPEG (High Quality 90%)** for App Store upload compliance.
- **Live Store Simulator:** Interactive Apple App Store and Google Play preview with device switching and instant multi-language preview.
- **GIF Animator:** Export animated showcase GIFs of your screenshot sets.
- **1-Click 4K PNG Clipboard Copy:** Instantly copy active screens to clipboard for Figma, Slack, or Notion.
- **App Store & Google Play Screenshot Guides:** Built-in 2026 developer reference guides at `/app-store-screenshot-sizes` and `/google-play-screenshot-sizes`.

### 💎 Account Tiers & Architecture

| Feature | 👤 Guest Mode | 🟢 Free Registered (Google/GitHub) | ⭐ SnapFrame Pro ($9/mo or $69/yr) |
| :--- | :--- | :--- | :--- |
| **Max Projects** | 1 Active Session Project | **3 Projects** (Stored locally on device) | **Unlimited Projects** |
| **Cloud Synchronization** | ❌ Local Browser Only | ❌ Local Browser Only | **☁️ Multi-Device Real-Time Cloud Sync** (Google Firestore) |
| **Upgrade Migration** | N/A | Local projects automatically migrate to Cloud on Pro upgrade | Instant multi-device sync across Mac, PC, iPad |
| **AI Generations** | 🔒 Sign in required | **3 Complimentary AI Credits** | **1,500 AI Generations / Month** (Fair Usage) |
| **Batch Captions Editor** | 🔒 Sign in required | **Screens 1 to 3** | **All 10 Screens + 1-Click AI Batch Rewrite** |
| **Brand Kit Palette** | 1 Color Slot | **3 Saved Brand Colors** | **12 Saved Brand Colors** |
| **1-Click Clipboard Copy** | ✅ Included (Screens 1–3) | ✅ Included (Screens 1–3) | **✅ Lossless Copy on all 10 screens** |
| **Screenshot Export (ZIP)** | 🔒 Sign in required | **Up to 3 screens per set (1 platform)** | **All 10 screens per set (All platforms)** |
| **Multi-Platform Batch** | 🔒 Sign in required | 1 Platform (e.g. iPhone only) | **Full Multi-Platform ZIP (iOS + iPad + Android + Tablet)** |
| **Multi-Language Batch** | 🔒 Sign in required | 1 Active Language | **Batch 40+ Languages in organized folders** |
| **Fastlane & ASO Package** | 🔒 Sign in required | ❌ Not included (raw images only) | **✅ Complete Fastlane (`.txt`, `.json`) suite** |
| **Custom Canvas & Social Presets** | ❌ Standard store sizes only | Standard store sizes only | **✅ Freeform W × H + Product Hunt / Twitter / IG / Web Presets** |
| **A/B Testing Variant Generator** | ❌ Not included | ❌ Not included | **✅ 4 Conversion Strategies (Dark, Clean, Glow, Bold)** |
| **Smart Alignment Guides** | ✅ Included | ✅ Included | **✅ Included** |
| **Mockup Frame Scaling** | 100% Fixed Scale | 100% Fixed Scale | **✅ Custom Mockup Scaling (50% to 150%)** |
| **Dual Theme Generator** | 🔒 Sign in required | ❌ Not included | **✅ 1-Click matching Light & Dark sets** |
| **Live Store Simulator** | 🔒 Sign in required | **Phone Simulator (iPhone & Android)** | **Phone & Tablet Simulator (iPad Pro 13" & Tabs)** |
| **Mockup Frame Styles** | 2D & Titanium standard | 2D & Titanium standard | **All Luxury 3D Frames (Clay, Glass, Neon, Wireframe)** |
| **Video & Animated GIF Studio** | 🔒 Sign in required | **100% Free & Unlimited** (60fps MP4/WebM/GIF) | **100% Free & Unlimited** |
| **Store App Icon & Dev Packs** | 🔒 Sign in required | **100% Free & Unlimited** (Xcode & Android zips) | **100% Free & Unlimited** |
| **4K Lossless Master Exports** | ❌ Standard 1x/2x | Standard 1x/2x | **✅ 4K Ultra-HD Lossless Exports (@3x)** |
| **Templates** | Standard templates | Standard templates | **All 12+ Pro Niche Showcases + 55+ Curated Kits** |
| **Templates SEO Gallery** | ✅ Included (`/templates`) | ✅ Included (`/templates`) | **✅ 1-Click Launch from `/templates`** |
| **Commercial License** | ✅ Included | ✅ Included | ✅ Included |

---

### 💳 Subscriptions & Account Dashboard
- **Dedicated Account & Billing Dashboard (`/account`):** View active subscriptions, renewal dates, detailed AI credit spending logs, community review submission, and payment receipts.
- **Merchant of Record:** Paddle.com processes all transactions securely worldwide with automatic invoice generation and VAT calculation.
- **Paddle Buyer Hub:** Manage cards, update tax/VAT IDs, and download VAT invoice PDFs directly via `paddle.net`.
- **14-Day Money-Back Guarantee:** Eligible for unutilized accounts within 14 calendar days of initial purchase.
- **Digital Resource Consumption:** Once an account actively utilizes paid compute resources (consuming at least 1 AI generation or syncing projects to dedicated Firestore cloud storage), non-recoverable third-party server and API infrastructure costs are incurred on your behalf, and the service is considered fulfilled.
- **1-Click Cancellation:** Cancel anytime with zero penalties; full access remains until the end of your billing cycle.

---

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Testing:** [Vitest](https://vitest.dev/) automated unit test suite with 65+ tests and 100% path-alias resolution
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with modular slices (selection, ui, history, content), undo/redo history stack & local persistence
- **Canvas Rendering:** Native HTML5 Canvas 2D with high-DPI supersampling & LRU cache eviction
- **Export & Compression:** [JSZip](https://stuk.github.io/jszip/) & FileSaver
- **AI Backend:** Universal 5-provider failover engine (Google Gemini, OpenAI, Groq, Mistral, xAI Grok)
- **Security:** Firebase Admin ID token authentication, sliding window rate limiting, anti-SSRF protections, and SVG sandbox CSP

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/alexandrmotologa/snapframe.store.git
cd snapframe.store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your API keys in `.env.local`:
```env
# AI Providers (Gemini & Groq offer 100% free permanent tiers)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here

# Firebase Configuration (For Authentication & Cloud Project Saves)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 4. Run automated test suite
```bash
npm test
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
snapframe.store/
├── docs/                      # Comprehensive technical documentation
│   ├── ARCHITECTURE.md        # State management slices, canvas engine & layer pipeline
│   ├── AI_SUPERPOWERS.md      # AI multi-provider failover, Vision & ASO copilot
│   ├── DEVICES_AND_CANVAS.md  # Device matrix, vector frames, and tablet support
│   ├── EXPORT_AND_ASO.md      # Fastlane, store submission guidelines & ZIP builder
│   └── DEPLOYMENT.md          # Vercel & Firebase deployment guide
├── public/                    # Static assets, logos, device mockups & favicons
│   ├── logos/                 # High-resolution vector and 3D brand logo assets
│   └── mockups/               # SVG & PNG vector device frames
├── src/
│   ├── app/                   # Next.js App Router (pages, layouts, skeletons & API routes)
│   │   ├── account/           # User Account, Subscriptions, AI Credit Ledger & Paddle Hub (with loading skeleton)
│   │   ├── api/
│   │   │   ├── account/       # Billing & subscription management endpoint
│   │   │   ├── ai/            # AI endpoints (vision-screens, copywriter, store-listing, translate, palette)
│   │   │   └── webhooks/      # Paddle signature verification & subscription webhooks
│   │   ├── editor/[projectId]/# Main interactive studio workspace (with loading skeleton)
│   │   ├── projects/          # Dedicated Projects dashboard, search & management (with loading skeleton)
│   │   ├── pricing/           # Pricing plans & transparent comparison (with SEO layout)
│   │   ├── faq/               # Frequently asked questions & guides (with SEO layout)
│   │   ├── refunds/           # 14-day refund policy & dispute guidelines
│   │   ├── terms/             # Terms of Service & Commercial licensing
│   │   ├── privacy/           # Privacy Policy & Data protection (GDPR/CCPA)
│   │   └── page.tsx           # High-converting Landing page & Feature showcase
│   ├── components/
│   │   ├── auth/              # AuthModal, UserMenu & provider OAuth linking
│   │   ├── editor/            # Canvas, toolbar, timeline, filmstrip, background selector & modals
│   │   │   ├── card/          # Canvas screen card drawers, overlays, and interaction hooks
│   │   │   ├── panels/        # Sidebar panels (Text, Background, Platforms, Blocks, StoreListing, Localization, etc.)
│   │   │   ├── toolbar/       # Modular contextual toolbars (Text, Shape, Mockup, Screen)
│   │   │   ├── AIAutoPilotModal.tsx
│   │   │   ├── CanvasBackgroundSelector.tsx
│   │   │   ├── ExportModal.tsx
│   │   │   └── StorePreviewModal.tsx
│   │   ├── dashboard/         # Project cards, creation modal, rename modal & footer
│   │   ├── auth/              # Google & GitHub OAuth modal, User Menu & account linking
│   │   └── ui/                # UI primitives (HorizontalScrollRail, buttons, dropdowns, inputs, dialogs)
│   └── lib/
│       ├── ai/                # Unified server-side AI provider service
│       ├── canvasBackgrounds.ts # 8 workspace background patterns (Square Grid, Dots, Blueprint, Isometric, etc.)
│       ├── devices.ts         # Device database (iPhone, iPad, Pixel, Galaxy, Tabs)
│       ├── renderScreenToCanvas.ts # Universal 4K Canvas 2D rendering engine
│       ├── store/             # Modular Zustand store with slices (selection, ui, history, content)
│       └── types.ts           # Core TypeScript types & layer schemas
├── .env.example               # Environment variables template
└── package.json
```

---

## 📖 Documentation Index

For in-depth documentation, please explore the [`docs/`](./docs/) directory:
- [Technical Architecture & State Model](./docs/ARCHITECTURE.md)
- [AI Superpowers & Prompt Engine](./docs/AI_SUPERPOWERS.md)
- [Devices, Tablets & Vector Frames](./docs/DEVICES_AND_CANVAS.md)
- [Export Suite & ASO Metadata Guide](./docs/EXPORT_AND_ASO.md)
- [Deployment on Vercel & Firebase](./docs/DEPLOYMENT.md)

---

## 📄 License

This repository is licensed under the **Business Source License 1.1 (BSL 1.1)**. You are free to view, test, and contribute to the code, but you may not use it to operate a competing commercial SaaS or hosted screenshot service. See the [LICENSE](./LICENSE) file for details.
