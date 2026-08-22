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
