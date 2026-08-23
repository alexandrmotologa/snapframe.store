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
- **Continuous Panoramic Flow:** Connect seamless backgrounds, waves, gradients, or custom uploaded ultra-wide panoramas across multiple screens.
- **30+ Drag-and-Drop Block Elements:** Dynamic Islands, Live Activity workouts, iOS Toggle switches, Push Notification banners, Editors' Choice laurels, 30-Day Guarantee seals, Growth stats (+142%), and Before/After comparison cards.
- **Responsive & Adaptable Studio UI:** Built-in horizontal scroll rails with interactive chevrons, vertical-to-horizontal mouse wheel conversion, and automatic tab centering across all category filters (Templates, Block Elements, Color Themes, Stickers, Languages).
- **Ergonomic Template Cards & Controls:** Full-width titles with tooltip support, cleanly separated PRO and Screen-count indicators, responsive 2-column platform scope selectors ("All Platforms" vs "Active Only"), and a 5-column icon+label background switcher.
- **20+ Google Fonts:** Inter, Montserrat, Poppins, Outfit, Space Grotesk, Syne, Playfair Display, and more.
- **Lossless 2D Canvas Engine:** 100% visual parity between the real-time editor, Live Store Simulator, PNG clipboard copy, and production 4K ZIP export.

---

### 📦 Pro Export Suite & Store Submission
- **Structured Multi-Platform ZIP:** Dedicated non-colliding folders:
  - `App Store (iPhone)/`
  - `App Store (iPad)/`
  - `Google Play (Phone)/`
  - `Google Play (Tablet)/`
- **Fastlane & App Store Connect Package:** Structured text files (`name.txt`, `subtitle.txt`, `description.txt`, `keywords.txt`, etc.) and `store_listing.json`.
- **Live Store Simulator:** Interactive Apple App Store and Google Play preview with device switching and instant multi-language preview.
- **GIF Animator:** Export animated showcase GIFs of your screenshot sets.
- **1-Click 4K PNG Clipboard Copy:** Instantly copy active screens to clipboard for Figma, Slack, or Notion.

### 💎 Account Tiers & Architecture

| Feature | 👤 Guest Mode | 🟢 Free Registered (Google/GitHub) | ⭐ SnapFrame Pro ($9/mo or $69/yr) |
| :--- | :--- | :--- | :--- |
| **Max Projects** | 1 Active Project | **3 Projects** (Stored locally on device) | **Unlimited Projects** |
| **Cloud Synchronization** | ❌ Local Browser Only | ❌ Local Browser Only | **☁️ Multi-Device Real-Time Cloud Sync** (Google Firestore) |
| **Upgrade Migration** | N/A | Local projects automatically migrate to Cloud on Pro upgrade | Instant multi-device sync across Mac, PC, iPad |
| **AI Generations** | 🔒 Sign in required | **3 Complimentary AI Credits** | **500 AI Generations / Month** (Fair Usage) |
| **Video & Animated GIF Studio** | 🔒 Sign in required | **100% Free & Unlimited** (60fps MP4/WebM/GIF) | **100% Free & Unlimited** |
| **Store App Icon & Dev Packs** | 🔒 Sign in required | **100% Free & Unlimited** (Xcode & Android zips) | **100% Free & Unlimited** |
| **4K Lossless Master Exports** | ❌ Standard 1x/2x | Standard 1x/2x | **✅ 4K Ultra-HD Lossless Exports** |
| **Templates** | Standard templates | Standard templates | **All 6+ Pro Industry Niche Templates** |
| **Commercial License** | ✅ Included | ✅ Included | ✅ Included |

---

### 💳 Subscriptions & Account Dashboard
- **Dedicated Account & Billing Dashboard (`/account`):** View active subscriptions, renewal dates, detailed AI credit spending logs, and payment receipts.
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
- **Testing:** [Vitest](https://vitest.dev/) automated unit test suite with 100% path-alias resolution
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with undo/redo history stack & local persistence
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
│   ├── ARCHITECTURE.md        # State management, canvas engine & layer pipeline
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
│   │   │   ├── panels/        # Sidebar panels (Text, Background, Platforms, Blocks, StoreListing, Localization, etc.)
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
│       ├── store/             # Zustand stores (editorStore, projectStore, languageStore, authStore)
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
