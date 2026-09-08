# Technical architecture and state model

This document outlines the state management structure, canvas rendering pipeline, and security mechanisms in SnapFrame.

## 1. Architecture overview

SnapFrame is built as a Next.js 16 (App Router) single-page application with server-side AI API routes.

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

    AIService --> Gemini[Google Gemini 3.6 Flash: Text & Vision]
    AIService --> OpenAI[OpenAI GPT-4o-mini: Text & Vision]
    AIService --> Groq[Groq GPT-OSS 120B / Llama 3.2 Vision]
    AIService --> Mistral[Mistral Small / Pixtral Vision]
    AIService --> XAI[xAI Grok 3 / Grok 2 Vision]
  end
```

## 2. State management pipeline

SnapFrame uses three primary Zustand stores for reactivity, persistence, and history tracking.

### `editorStore.ts` (Modular slice architecture)
The studio store is split into single-responsibility Zustand slices composed into a unified hook:
- `SelectionSlice` (`selectionSlice.ts`): Tracks `activeSetId`, `activeScreenId`, `activeLayerId`, and `selectedLayerIds` (multi-select), with getter helpers (`getActiveSet()`, `getActiveScreen()`, `getActiveLayer()`).
- `UiSlice` (`uiSlice.ts`): Manages `zoom` (clamped between 0.1 and 2.0), `showGrid`, `showGuides`, and `canvasBackground`.
- `HistorySlice` (`historySlice.ts`): Maintains an immutable snapshot stack for state recovery, recording actions via `recordHistory()` with debouncing for high-frequency updates, and providing `undo()` and `redo()`.
- `ContentSlice` (`contentSlice.ts`): Provides CRUD operations for screen sets, screens, and individual layers (text, screenshot, shape, sticker), alongside dual-theme generation, theme application, and template instantiation.

### `projectStore.ts`
- Project metadata: Stores `id`, `name`, `thumbnail`, `createdAt`, and `updatedAt`.
- Store listings cache: Caches per-language store listing metadata for iOS (`name`, `subtitle`, `description`, `keywords`, `promotionalText`, `whatsNew`) and Android (`title`, `shortDescription`, `fullDescription`, `whatsNew`).
- Persistence: Synchronizes to browser local storage, with cloud synchronization for Pro users.

### `languageStore.ts`
- Active language: Currently selected language locale (such as `en`, `es`, `de`, `fr`, `ja`, `ro`).
- Project languages: Array of enabled languages for batch export.
- Language registry: Supported locales with display names and locale codes.

### `authStore.ts` and billing
- Authentication: Firebase Auth integration supporting Google OAuth, GitHub OAuth, and guest accounts.
- Account linking: Migrates guest projects to a registered account upon sign-in.
- Billing portal (`/api/account/billing`): Integrates with Paddle Subscriptions for self-serve management, `paddle.net` receipt lookups, and credit consumption tracking (`users/{uid}/credit_logs`).
- Paddle webhook pipeline (`/api/webhooks/paddle`): Verifies incoming webhook signatures and updates Firestore user subscription status (`active`, `canceled`, `past_due`).

### `canvasBackgrounds.ts`
- Workspace canvas patterns: 8 workspace background styles (Square Grid, Fine Dots, Bold Dots, Blueprint Grid, Technical Plus, Isometric 3D, Ambient Studio, and Blank Solid).
- Theme adaptation: Adjusts opacity and contrast using `currentColor` and theme CSS variables.

## 3. Canvas 2D rendering engine (`renderScreenToCanvas.ts`)

The rendering engine generates consistent graphics across the live editor, store simulator, animated GIF export, and 4K production exports.

### Image memory cache (`imgCache`)
- `renderScreenToCanvas.ts` maintains an in-memory image cache with an eviction ceiling of 100 images.
- Cache hits refresh the recency key.
- When full, the oldest unreferenced image entries are evicted to maintain predictable memory usage during extended editing sessions.
- Non-fatal warnings log failed image asset loads without interrupting the canvas pipeline.

### Layer rendering order
1. Background layer:
   - Solid color fill
   - Linear, radial, or diagonal gradients
   - 4-corner mesh gradients with radial blending
   - Continuous panorama slices
   - Pattern overlays (dots, lines, grid, noise)
2. Device mockup and screenshot layer:
   - Vector bezels with device-specific corner radiuses
   - Hardware buttons (titanium rockers and action button)
   - Cutouts for Dynamic Island, notch, or camera hole
   - Inner screenshot clipping with cover or contain scaling
   - Focus card overlays (dimming unselected areas with blur)
   - Status bar: 9:41 clock, battery pill, signal bars, and network badge
   - Glass reflection overlays
3. Typography and text layers:
   - Multi-line text wrapping with line height and letter spacing
   - Dynamic Google Fonts loading
   - Text strokes, highlights, and drop shadows
4. UI block components:
   - iOS notification banners
   - Dynamic Island live pills
   - Editors' choice and award badges
   - Guarantee seals
   - Before and after comparison cards
   - Metric callouts (+142%)
   - Callout shapes and arrows

## 4. Proportional template scaling

When adding an iPad Pro (2048 x 2732 px) or Android Tablet (1600 x 2560 px) set to an existing project:
1. The engine calculates the dimensional ratio relative to the phone layout.
2. Clones layers, text properties, font sizes, offsets, and background styles.
3. Repositions and scales device frames to fit tablet proportions while maintaining typography hierarchy.

## 5. Security and infrastructure

- Token verification (`serverAuth.ts`): Protected routes (`/api/account/billing`, `/api/ai/*`, `/api/uploadthing`) verify Firebase ID tokens through `firebaseAdmin.ts` (`adminAuth.verifyIdToken`).
- Rate limiting (`rateLimiter.ts`): Sliding-window rate limiting restricts request spikes per IP and user account.
- AI provider abstraction (`aiService.ts`): Standardizes timeouts, retries, and error handling across OpenAI, Groq, Mistral, and xAI, with Gemini as the multimodal default.
- Anti-SSRF filtering (`/api/scrape-app`): DNS resolution checks block requests to private IPv4 ranges (RFC 1918), loopback, link-local, carrier-grade NAT, metadata endpoints (169.254.169.254), and private IPv6 ranges.
- SVG sandbox proxy (`/api/proxy-svg`): Content Security Policy (`sandbox; default-src 'none'`) and `X-Content-Type-Options: nosniff` headers prevent script execution in user-supplied SVG files.
- HTTP security headers (`next.config.ts`): Enforces HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- App Router loading states:
  - Route skeletons in `loading.tsx` for `/projects`, `/account`, and `/editor/[projectId]`.
  - OpenGraph metadata and canonical links configured per route in `layout.tsx`.
  - Error boundaries (`not-found.tsx`, `error.tsx`, `global-error.tsx`).

## 6. Performance, memoization, and testing

### 6.1 Template chunking
- Large Figma template libraries are partitioned into asynchronous chunks via `getAllTemplates(): Promise<Template[]>`.
- The synchronous `BASE_TEMPLATES` registry provides immediate initialization for the new project dialog, while additional community presets load in the background.

### 6.2 Component memoization
- Multi-layer canvas controls and inspector panels use `React.memo` to avoid unnecessary re-renders during active canvas panning and zooming:
  - `ScreenCard.tsx`, `ScreenStrip.tsx`, `ScreenSetRow.tsx`
  - `PropertiesPanel.tsx`, `EditorSidebar.tsx`
  - `TextPanel.tsx`, `BackgroundPanel.tsx`, `PlatformsPanel.tsx`, `FlagsPanel.tsx`

### 6.3 Accessibility
- Modals register Escape key listeners with proper event cleanup on unmount.
- Dialog containers include `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label` attributes on icon buttons.

### 6.4 Automated test suite
- Automated unit test runner powered by Vitest, configured in `vitest.config.ts` with path aliases (`@/*` -> `./src/*`).
- Test coverage covers:
  - Math helpers, formatting, CSS generators, and ID creation (`utils.test.ts`).
  - Device dimensions, color mappings, tablet flags, and store resolutions (`devices.test.ts`).
  - Template search filtering and sorting (`templatePopularity.test.ts`).
  - AI string limit truncation and provider discovery (`aiService.test.ts`).

### 6.5 Horizontal scroll rails (`HorizontalScrollRail`)
- Mouse wheel conversion: Converts vertical wheel delta (`deltaY`) to horizontal scroll (`scrollLeft`) for horizontal category bars.
- Directional chevrons: Left and right buttons toggle based on scroll boundaries and `ResizeObserver` measurements.
- Selection auto-centering: Active tabs scroll into view via `scrollIntoView({ inline: 'center' })`.

### 6.6 Dashboard project preview (`ProjectCoverShowcase`)
- Layered screen stack: Dashboard cards render the project's first 2 to 3 screens with device bezels and angled offsets.
- Ambient lighting: Derives a subtle background glow from the active screen colors.
- Screen peek: Dot indicators let users cycle through screens on the dashboard without opening the full editor.

### 6.7 Project saving lifecycle
- State tracking: Reflects saving and saved states with debounced persistence (1200ms) and automatic thumbnail creation.
- Breadcrumb navigation: Header path (`Projects / [Name]`) allows direct inline renaming and manual saving.

### 6.8 Clipboard paste and Fastlane exports
- Clipboard paste listener: Intercepts `Ctrl+V` / `Cmd+V` image payloads to insert screenshots directly into the active device mockup.
- Fastlane package: Exports a Ruby `Deliverfile`, `README-FASTLANE.md`, and locale metadata directories for terminal deployment with `fastlane deliver`.

### 6.9 History snapshots
- Pre-mutation recording: Structural changes (`addScreen`, `deleteScreen`, `reorderScreens`, `addScreenSet`, `applyTemplate`) call `recordHistory(true)` before modifying state, ensuring `undo()` restores the exact baseline.
- Debounced slider adjustments: Continuous adjustments like color pickers and size sliders debounce history commits at 300ms intervals.

### 6.10 Credit verification and search
- Server authentication: Verifies Firebase ID tokens using RS256 algorithm enforcement, expiration checks, and clock-skew tolerance.
- Pre-flight credit checks: Client components check credit balance via `checkAiCreditAvailable()` before sending requests, consuming credits only after a successful response.
- Sticker search: Keyword dictionary maps search terms to emoji elements in `StickersPanel.tsx`.

### 6.11 Productivity tools
- Batch captions editor (`BatchCaptionsWidget`): Tabular editing mode to review and update headlines and subtitles across all screens simultaneously.
- Project brand kit (`BrandKitPalette.tsx`): Stores custom project colors for application across backgrounds, text, and shapes.

## 7. Account tiers and export access

| Tier | Project limit | Export scope | Presets | Clipboard copy | Store simulator | AI generations | Cloud sync | Pricing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Guest | 1 session project | Single-screen clipboard copy | Standard store sizes | Active screen | Sign-in required | Sign-in required | Local memory | $0 |
| Free Registered | Up to 3 projects | Up to 3 screens per set (1 platform, 1 language) | Standard store sizes | Screens 1 to 3 | Phone simulator (iPhone and Android) | 3 trial credits | Browser storage | $0 |
| SnapFrame Pro | Unlimited projects | Full 10-screen package across iOS, iPad, Android, and Tablet; 40+ languages; Fastlane package; 4K exports | Custom dimensions and social media presets; mockup scaling (50% to 150%) | All 10 screens | Phone and tablet simulator | Unlimited (Fair usage: 1,500/mo) | Google Firestore | $9/mo or $69/yr |
