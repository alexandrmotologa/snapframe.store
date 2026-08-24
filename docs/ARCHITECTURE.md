# 🏗️ Technical Architecture & Design System

This document outlines the core technical architecture, state management patterns, and canvas rendering pipeline of **SnapFrame**.

---

## 1. High-Level Architecture Overview

SnapFrame is structured as a modern **Next.js 16 (App Router)** single-page application with server-side AI API routes.

```mermaid
graph TD
  User[User / Designer] --> Dashboard[Dashboard / Projects Catalog]
  Dashboard --> Editor[Studio Workspace: /editor/projectId]
  
  subgraph Client State & Engine
    Editor --> EditorStore[Zustand: editorStore]
    Editor --> ProjectStore[Zustand: projectStore]
    Editor --> LanguageStore[Zustand: languageStore]
    
    EditorStore --> CanvasEngine[HTML5 Canvas 2D Engine: renderScreenToCanvas]
    CanvasEngine --> CanvasView[Interactive Canvas / Filmstrip]
    CanvasEngine --> SimulatorView[Live Store Preview Simulator]
    CanvasEngine --> ZipExport[4K Multi-Platform ZIP Exporter]
  end

  subgraph Server-Side AI Layer & Security
    Editor --> AuthCheck[serverAuth.ts: Firebase ID Token & Rate Limiter]
    AuthCheck --> AIAutoPilot[/api/ai/vision-screens]
    AuthCheck --> AICopywriter[/api/ai/copywriter]
    AuthCheck --> AIASO[/api/ai/store-listing]
    AuthCheck --> AITranslate[/api/ai/translate]
    AuthCheck --> AIPalette[/api/ai/palette]

    AIAutoPilot --> AIService[aiService.ts Universal Fallback Runner]
    AICopywriter --> AIService
    AIASO --> AIService
    AITranslate --> AIService
    AIPalette --> AIService

    AIService --> Gemini[Google Gemini 3.6 Flash - Text & Vision]
    AIService --> OpenAI[OpenAI GPT-4o-mini - Text & Vision]
    AIService --> Groq[Groq GPT-OSS 120B / Llama 3.2 Vision]
    AIService --> Mistral[Mistral Small / Pixtral Vision]
    AIService --> XAI[xAI Grok 3 / Grok 2 Vision]
  end
```

---

## 2. State Management Pipeline

SnapFrame uses three primary Zustand stores designed for reactivity, persistence, and non-blocking undo/redo history.

### 1. `editorStore.ts`
- **Active Selection:** `activeSetId`, `activeScreenId`, `activeLayerId`.
- **Screen Sets Hierarchy:** A project contains an array of `ScreenSet` objects (e.g. iPhone 16 Pro set, iPad Pro set, Android Phone set, Android Tablet set).
- **Screens & Layers:** Each `Screen` holds dimensions (`width`, `height`), `background`, `localizations`, and an ordered list of `Layer` objects.
- **Undo / Redo History Stack:** Maintains full immutable state snapshots with history recording on user actions (`recordHistory()`), supporting standard `Ctrl+Z` and `Ctrl+Y` shortcuts.

### 2. `projectStore.ts`
- **Project Metadata:** `id`, `name`, `thumbnail`, `createdAt`, `updatedAt`.
- **Store Listings Cache:** Per-language store listing metadata for both iOS (`name`, `subtitle`, `description`, `keywords`, `promotionalText`, `whatsNew`) and Android (`title`, `shortDescription`, `fullDescription`, `whatsNew`).
- **Persistence:** LocalStorage synchronization with optional Firebase cloud backup.

### 3. `languageStore.ts`
- **Active Language:** Currently active editing and viewing locale (e.g. `en`, `es`, `de`, `fr`, `ja`, `ro`).
- **Project Languages:** Array of configured languages enabled for multi-language export.
- **Language Registry:** 20+ supported locales with native flag emojis and locale codes.

### 4. `authStore.ts` & Billing Layer
- **Authentication & User Profile:** Firebase Auth integration with Google, GitHub OAuth, and Anonymous Guest accounts.
- **Account Linking & Cloud Sync:** Allows seamless migration from guest session to permanent account without losing active projects.
- **Environment Isolation:** Tags registered users with current deployment environment (`production`, `develop`, `localhost`).
- **Billing & Customer Portal (`/api/account/billing`):** Integrates Paddle Subscriptions with self-serve cancellation, Paddle Buyer Hub (`https://paddle.net`) invoice lookups, and real-time Firestore credit consumption audits (`users/{uid}/credit_logs`).
- **Paddle Webhook Pipeline (`/api/webhooks/paddle`):** Cryptographically verifies Paddle webhook signatures and updates Firestore user subscription status (`active`, `canceled`, `past_due`) in real-time.

### 5. `canvasBackgrounds.ts`
- **Workspace Canvas Patterns:** 8 theme-adaptive workspace background styles (Square Grid, Fine Dots, Bold Dots, Blueprint Grid, Technical Plus, Isometric 3D, Ambient Studio, Blank Solid).
- **Light/Dark Calibration:** Automatic opacity and color scaling using `currentColor` and `hsl(var(--foreground))`.

---

## 3. Universal Canvas 2D Rendering Engine (`renderScreenToCanvas.ts`)

The rendering engine guarantees **100% visual parity** between the live editor workspace, interactive store simulators, animated GIF exports, and lossless 4K production exports.

### LRU Image Memory Management (`imgCache`):
- `renderScreenToCanvas.ts` maintains an in-memory `imgCache` with a safety threshold (max 100 images).
- Accessing an existing cached image refreshes its recency key.
- When capacity is reached, the oldest unused image entries are evicted automatically, preventing browser RAM leakage during long editing sessions with multiple high-resolution uploads.
- Explicit non-fatal `console.warn` diagnostics track failed image asset loads without breaking fallback canvas rendering.

### Rendering Order Pipeline:
1. **Background Layer:**
   - Solid fill
   - Multi-stop Linear / Radial / Diagonal Gradients
   - 4-Corner Mesh Gradients (with radial diffusion)
   - Continuous Panoramic Image Slices
   - Pattern Overlays (Dots, Lines, Grid, Noise with custom opacity)
2. **Device Mockup & Screenshot Layer:**
   - Vector bezel frames with official device corner radiuses
   - Hardware buttons (Titanium side buttons, Action Button)
   - Dynamic Island, Camera Hole, or Notch
   - Inner screenshot clipping with `cover` / `contain` aspect fitting
   - Focus Card overlays (dimming unselected areas with blur)
   - **Smart Clean Status Bar:** 9:41 AM time, 100% battery pill, 4-bar cellular signal, and 5G badge
   - Glass reflection overlays
3. **Typography & Text Layers:**
   - Multi-line text wrapping with dynamic line height and letter spacing
   - Google Fonts real-time loading and rendering
   - Text highlights, badges, strokes, and drop shadows
4. **UI Block Components (30+ shapes):**
   - iOS Notification Banners
   - Dynamic Island Live Capsules
   - Apple Design Award Laurels & Editors' Choice Badges
   - 30-Day Streak and Guarantee Badges
   - Before/After Comparison Cards
   - Growth KPI Statistics (+142%)
   - Handwritten Callouts & Doodled Curved Arrows

---

## 4. Proportional Template Scaling Engine

When users add an **iPad Pro (2048 × 2732 px)** or **Android Tablet (1600 × 2560 px)** set to an existing project:
1. The engine calculates the aspect ratio and dimensional scaling factor relative to the source phone set.
2. Clones all layers, text properties, font sizes, positioning offsets, and backgrounds.
3. Automatically resizes and centers mockup frames to suit tablet proportions while maintaining exact typography hierarchy.

---

## 5. Security & Infrastructure Hardening

- **Server-Side Token Verification (`serverAuth.ts`):** All critical routes (`/api/account/billing`, `/api/ai/*`, `/api/uploadthing`) verify Firebase ID Tokens via `firebaseAdmin.ts` (`adminAuth.verifyIdToken`) preventing unauthorized impersonation.
- **Sliding-Window Rate Limiting (`rateLimiter.ts`):** In-memory sliding window rate limiting prevents scraping, DoS, and automated credential consumption across IP and user identifiers.
- **Unified AI Provider Abstraction (`aiService.ts`):** Consolidated `callOpenAICompatible` handler standardizes requests, timeouts, and error handling across OpenAI, Groq, Mistral, and xAI with Gemini as multimodal primary.
- **Anti-SSRF Protection (`/api/scrape-app`):** Strict DNS resolution filtering blocks requests to private IPv4 (RFC 1918), loopback, link-local, carrier-grade NAT, cloud metadata IP (169.254.169.254), and private IPv6 ranges.
- **SVG Sandbox Proxy (`/api/proxy-svg`):** Origin whitelisting, Content Security Policy (`sandbox; default-src 'none'`), and `X-Content-Type-Options: nosniff` prevent XSS via maliciously crafted vector SVGs.
- **HTTP Security Headers (`next.config.ts`):** Enforces HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Next.js App Router Boundaries & Skeletons:**
  - Dedicated route `loading.tsx` skeletons for `/projects`, `/account`, and `/editor/[projectId]` providing instantaneous feedback without layout shift.
  - Route-level `layout.tsx` metadata ensuring granular SEO, canonical URLs, and OpenGraph social preview tags across `/pricing`, `/faq`, `/projects`, and `/account`.
  - Root error boundaries (`not-found.tsx`, `error.tsx`, `global-error.tsx`).

---

## 6. Performance, Memoization & Automated Quality Assurance

### 6.1 Lazy-Loaded Template Architecture
- High-volume Figma template dictionaries (~12,000 lines) are partitioned into dynamic async chunks via `getAllTemplates(): Promise<Template[]>`.
- The synchronous `BASE_TEMPLATES` registry enables instant zero-latency initialization of the `NewProjectModal` and editor sidebar, asynchronously resolving community presets without blocking initial paint or inflating bundle size (>500KB bundle payload reduction).

### 6.2 Editor Component Memoization (`React.memo`)
- Critical multi-layer canvas controls and sidebar inspectors are wrapped in `React.memo`:
  - `ScreenCard.tsx`, `ScreenStrip.tsx`, `ScreenSetRow.tsx`
  - `PropertiesPanel.tsx`, `EditorSidebar.tsx`
  - `TextPanel.tsx`, `BackgroundPanel.tsx`, `PlatformsPanel.tsx`, `FlagsPanel.tsx`
- Prevents cascading re-renders across the studio filmstrip during active panning, zooming, and inspector adjustments.

### 6.3 Accessibility (A11y) & Keyboard Dismissal
- Modal overlays implement Escape key listeners (`keydown`) with non-blocking cleanup.
- Dialog containers enforce accessibility standards with semantic `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label` attributes on interactive icon buttons.

### 6.4 Automated Unit Test Suite (`vitest`)
- Automated unit test runner powered by **Vitest** configured in `vitest.config.ts` with path alias support (`@/*` -> `./src/*`).
- Coverage spans:
  - Utility math, formatting, CSS background generators, and ID generators (`utils.test.ts`).
  - Device matrices, official color HEX mappings, tablet detection, and store dimensions (`devices.test.ts`).
  - Template popularity algorithms, search filtering, and multi-field sorting (`templatePopularity.test.ts`).
  - AI string limit truncation, word boundary preservation, and provider key discovery (`aiService.test.ts`).

### 6.5 Responsive Sidebar & Horizontal Scroll Rail Architecture (`HorizontalScrollRail`)
- **Cross-Platform Mouse Wheel Conversion:** The `HorizontalScrollRail` primitive automatically maps vertical mouse wheel deltas (`deltaY`) to horizontal scroll offsets (`scrollLeft`), ensuring desktop mice seamlessly navigate wide category chip bars without requiring horizontal scroll gestures or Shift keys.
- **Directional Chevrons & Gradient Masks:** Interactive Left (`<`) and Right (`>`) scroll buttons automatically appear/disappear based on track scroll bounds and dynamic `ResizeObserver` measurements, with subtle gradient fade overlays preventing visual clipping.
- **Auto-Centering on Selection:** Active filter tabs trigger smooth programmatic scrolling (`scrollIntoView({ inline: 'center' })`), guaranteeing active chips remain in the user's viewport.
- **Panel Width & Ergonomics:** Standardized sidebar slide-out width (`w-80` / 320px) calibrated for 2-column card layouts, giving titles 100% horizontal real estate, non-overlapping badge anchors (PRO top-left, screen counts top-right), and structured segmented grid controls across `TemplatesPanel`, `BackgroundPanel`, `BlocksPanel`, `ThemesPanel`, `StickersPanel`, and `LocalizationPanel`.

### 6.6 3D Multi-Screen Dashboard Cover Architecture (`ProjectCoverShowcase`)
- **Live 3D Screen Deck & Perspective Fan-out:** Dashboard cards render a live layered stack of the project's first 2–3 screens with realistic device bezels, dynamic island notches, and perspective rotations (`rotate-[6deg]`, `rotate-[11deg]`).
- **Dynamic Ambient Glow Extraction:** Real-time color extraction from active screen backgrounds (`solid`, `gradient`, `mesh`, or `image`) renders an ambient lighting halo behind device mockups.
- **Interactive Screen Peek:** Micro-dot hover navigation allows rapid screen cycling directly on dashboard cards without triggering heavy editor navigations.
- **App Monogram & Contextual Teaser:** Generates consistent App Store-style squircle icons and extracts primary headline text for immediate project identification.

### 6.7 Real-Time Save State Engine & Onboarding Studio Guide (`EditorLayout` & `QuickTipsModal`)
- **Debounced Save Lifecycle:** Tracks real-time editing states (`saving` vs `saved`) with debounced Firestore batching (1200ms) and automatic thumbnail refresh.
- **Visual Breadcrumb & Inline Renaming:** Header breadcrumb navigation (`Projects / [Name]`) with hover editing affordance and 1-click force save capabilities.
- **Interactive 3-Step Quick Tips Modal:** Onboarding modal introducing multi-platform presets, 30+ conversion UI blocks, and AI Vision Auto-Pilot.

---

## 7. 3-Tier Monetization & Export Gating Matrix

SnapFrame enforces a conversion-optimized 3-tier architecture:

| Tier | Project Limit | Export Scope | Canvas & Social Presets | Clipboard Copy | Store Simulator | AI Generations | Cloud Sync | Pricing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **👤 Guest** | 1 Active Session Project | 1-Click Clipboard Copy only (ZIP prompts free sign-in) | Standard Store Sizes only | Active Screen only | 🔒 Locked (Prompts sign-in) | 🔒 Locked (Prompts sign-in) | ❌ Local memory | $0 (No sign-in) |
| **🟢 Free Registered** | Up to 3 Local Projects | Up to 3 screens per set (1 device platform, 1 language) | Standard Store Sizes only | Screens 1 to 3 | Phone Simulator (iPhone & Android) | 3 Complimentary Credits | ❌ LocalStorage | $0 (Google / GitHub) |
| **⭐ SnapFrame Pro** | Unlimited Projects | Full 10-Screen Multi-Platform ZIP (iOS + iPad + Android + Tablet), 40+ languages, Fastlane suite, 4K lossless, Dual Theme | Freeform W × H, Product Hunt, Twitter, IG, Web Hero & Mockup Scale (50%–150%) | All 10 screens lossless | Phone & Tablet Simulator (iPad Pro 13" & Tabs) | 500 Credits / Month | ✅ Google Firestore | $9/mo or $69/yr |





