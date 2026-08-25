# 🤖 AI Superpowers & Multi-Provider Prompt Engine

SnapFrame includes an enterprise-grade AI suite designed to eliminate the tedious parts of App Store screenshot creation and App Store Optimization (ASO).

---

## 1. Multi-Provider Architecture & Failover

All AI interactions run through [`src/lib/ai/aiService.ts`](file:///b:/workgit/simple-screenshot-market/src/lib/ai/aiService.ts) on Next.js Server-Side routes protected by Firebase ID Token Authentication (`Authorization: Bearer <idToken>`) and Rate Limiting.

```
API Request (Bearer Token) → serverAuth.ts → aiService.ts (Priority Cascade)
  ├─ 1. Google Gemini 3.6 Flash (GEMINI_API_KEY) ── [Primary: Vision + Speed]
  ├─ 2. OpenAI GPT-4o-mini (OPENAI_API_KEY) ── [Fallback 1: ASO & Multimodal]
  ├─ 3. Groq GPT-OSS 120B / Llama 3.2 Vision (GROQ_API_KEY) ── [Fallback 2: Ultra-low latency]
  ├─ 4. Mistral Small / Pixtral 12B Vision (MISTRAL_API_KEY) ── [Fallback 3: Localization & Vision]
  └─ 5. xAI Grok 3 / Grok 2 Vision (XAI_API_KEY) ── [Fallback 4: Advanced Reasoning & Vision]
```

If a provider encounters a **Rate Limit (429)**, timeout, or quota exhaustion, the failover runner seamlessly attempts the next configured key without throwing an error to the user. All providers in the chain support both text generation and multimodal screenshot vision analysis.

---

## 2. The 6 AI Superpowers

### 1️⃣ 1-Click Vision Auto-Pilot (`/api/ai/vision-screens`)
- **Endpoint:** `POST /api/ai/vision-screens`
- **Input:** Screenshots array (base64/data URLs), app name, category/niche, target language.
- **Workflow:**
  1. Multimodal vision models inspect each screenshot image to detect what feature is presented (e.g. Analytics chart, Dark mode toggle, Onboarding hero, Paywall / Subscription).
  2. Generates punchy headlines (≤ 30 chars) and benefit-oriented subcaptions.
  3. Formulates matching panoramic color gradient palettes based on the dominant colors found in the app UI.
  4. Automatically populates all screens in the active set with 1 click.

### 2️⃣ AI Store Listing & ASO Copilot (`/api/ai/store-listing`)
- **Endpoint:** `POST /api/ai/store-listing`
- **Input:** App name, category, keywords, target language, screen headlines.
- **Strict Store Character Constraints Enforced:**

| Store | Field | Maximum Character Limit | Format |
| :--- | :--- | :--- | :--- |
| **App Store (iOS)** | `name` | **30 characters** | High-conversion app title |
| **App Store (iOS)** | `subtitle` | **30 characters** | Core value proposition |
| **App Store (iOS)** | `promotionalText` | **170 characters** | Marketing announcement |
| **App Store (iOS)** | `keywords` | **100 characters** | Comma-separated, no spaces |
| **App Store (iOS)** | `description` | **4000 characters** | Formatted with emoji bullets |
| **App Store (iOS)** | `whatsNew` | **500 characters** | Release highlights |
| **Google Play** | `title` | **30 characters** | App title |
| **Google Play** | `shortDescription` | **80 characters** | Punchy summary |
| **Google Play** | `fullDescription` | **4000 characters** | Full feature breakdown |
| **Google Play** | `whatsNew` | **500 characters** | Version updates |

### 3️⃣ AI Copywriter & Tone Switcher (`/api/ai/copywriter`)
- **Endpoint:** `POST /api/ai/copywriter`
- **Supported Tones:**
  - `high-energy`: Bold, inspiring, active voice (e.g. "Crush Every Workout").
  - `minimalist`: Ultra-clean, 2-3 words (e.g. "Effortless Focus").
  - `benefit-driven`: Focuses on solved pain points (e.g. "Save 4 Hours Daily").
  - `fomo`: Social proof & hype (e.g. "Join 100K+ Creators").
  - `b2b`: Professional, enterprise credibility (e.g. "Bank-Grade Security").
- **Actions:**
  - `rewrite`: Rewrites text in selected tone.
  - `shorten`: Condenses text guaranteed to fit under 28–30 characters for mobile canvas widths.
  - `emojis`: Contextual emoji insertion for click-through rate optimization.
  - `benefit`: Conversion from technical feature description to customer-centric benefit proposition.
  - `punchy`: Increases emotional appeal and CTA power with active verbs.
  - `ideas`: Generates 5 distinct headline variations with character length meters.

### 4️⃣ AI Magic Theme Matcher (`/api/ai/palette`)
- **Endpoint:** `POST /api/ai/palette`
- **Generates 5 High-Conversion Themes:**
  1. **OLED Midnight:** Deep indigo and black luxury dark mode with luminous accents.
  2. **Clean Cupertino:** Minimalist Apple ice-white and cool slate gradients.
  3. **Vibrant Sunset:** Warm crimson, fiery coral, and violet flow.
  4. **Cyber Neon:** Electric cyan and magenta glow.
  5. **Pastel Aurora:** Aesthetic lavender, mint, and peach.
  6. **Emerald Matrix:** Deep emerald and forest dark tones.

### 5️⃣ Smart Clean Status Bar Cleaner
- Renders an authentic, crisp vector status bar directly on canvas over screenshots.
- Features `9:41` clock, full 4-bar cellular signal, `5G` badge, and 100% full battery indicator.
- Includes `🌙 Dark` (white icons) and `☀️ Light` (black icons) color switching.

### 6️⃣ Cultural Marketing Localization (`/api/ai/translate`)
- **Endpoint:** `POST /api/ai/translate`
- **Catalog:** Full support for 60+ App Store & Google Play global languages and regional locales.
- **Core Rule:** Translates contextually for natural marketing appeal rather than literal word-by-word translation.
- **Length Constraint:** Condenses longer languages (e.g., German, French) to prevent text overflow beyond mobile device headers.
