# AI provider architecture and tools

SnapFrame includes AI tools for screenshot layout suggestions, copywriting, and App Store Optimization (ASO) metadata generation.

## 1. Multi-provider architecture and failover

All AI interactions run through [`src/lib/ai/aiService.ts`](file:///b:/workgit/simple-screenshot-market/src/lib/ai/aiService.ts) on Next.js server-side routes protected by Firebase ID token authentication (`Authorization: Bearer <idToken>`) and sliding-window rate limiting.

```
API Request (Bearer Token) -> serverAuth.ts -> aiService.ts (Priority Cascade)
  ├─ 1. Google Gemini 3.6 Flash (GEMINI_API_KEY) [Primary: Vision + Speed]
  ├─ 2. OpenAI GPT-4o-mini (OPENAI_API_KEY) [Fallback 1: ASO + Multimodal]
  ├─ 3. Groq GPT-OSS 120B / Llama 3.2 Vision (GROQ_API_KEY) [Fallback 2: Latency]
  ├─ 4. Mistral Small / Pixtral 12B Vision (MISTRAL_API_KEY) [Fallback 3: Localization + Vision]
  └─ 5. xAI Grok 3 / Grok 2 Vision (XAI_API_KEY) [Fallback 4: Reasoning + Vision]
```

If a provider returns a rate limit error (HTTP 429), timeout, or quota exhaustion, the runner calls the next configured provider. All providers in the chain support text generation and multimodal screenshot analysis.

## 2. Tool endpoints

### Vision auto-pilot (`/api/ai/vision-screens`)
- Endpoint: `POST /api/ai/vision-screens`
- Input: Screenshot image array (base64 data URLs), app name, category, and target language.
- Process:
  1. Inspects each screenshot to identify the feature shown (such as an analytics chart, settings view, onboarding screen, or paywall).
  2. Generates headlines (30 characters or fewer) and descriptive subtitles.
  3. Proposes matching background color gradients based on dominant colors in the app interface.
  4. Populates all screens in the active set with the drafted copy and themes.

### Store listing and ASO generator (`/api/ai/store-listing`)
- Endpoint: `POST /api/ai/store-listing`
- Input: App name, category, keywords, target language, and screen headlines.
- Store character constraints enforced:

| Store | Field | Maximum character limit | Format |
| :--- | :--- | :--- | :--- |
| App Store (iOS) | `name` | 30 characters | App title |
| App Store (iOS) | `subtitle` | 30 characters | Primary value proposition |
| App Store (iOS) | `promotionalText` | 170 characters | Marketing announcement |
| App Store (iOS) | `keywords` | 100 characters | Comma-separated list without spaces |
| App Store (iOS) | `description` | 4000 characters | Formatted text |
| App Store (iOS) | `whatsNew` | 500 characters | Release notes |
| Google Play | `title` | 30 characters | App title |
| Google Play | `shortDescription` | 80 characters | Summary |
| Google Play | `fullDescription` | 4000 characters | Feature description |
| Google Play | `whatsNew` | 500 characters | Version updates |

### Copywriter and tone switcher (`/api/ai/copywriter`)
- Endpoint: `POST /api/ai/copywriter`
- Supported tones:
  - `high-energy`: Active verbs and concise phrasing.
  - `minimalist`: 2 to 3 words.
  - `benefit-driven`: Focuses on solved problems.
  - `fomo`: Social proof and momentum.
  - `b2b`: Professional business terminology.
- Actions:
  - `rewrite`: Rewrites text in the selected tone.
  - `shorten`: Condenses text under 30 characters to fit mobile canvas widths.
  - `emojis`: Inserts relevant emojis.
  - `benefit`: Converts technical feature descriptions into user benefits.
  - `punchy`: Focuses on active verbs.
  - `ideas`: Generates 5 distinct headline variations.

### Palette matcher (`/api/ai/palette`)
- Endpoint: `POST /api/ai/palette`
- Generates preset gradient themes:
  1. OLED Midnight: Deep indigo and black dark palette.
  2. Clean Cupertino: Slate and off-white gradients.
  3. Vibrant Sunset: Coral, crimson, and violet transitions.
  4. Cyber Neon: Cyan and magenta accents.
  5. Pastel Aurora: Lavender, mint, and peach tones.
  6. Emerald Matrix: Forest green and dark slate tones.

### Clean status bar
- Renders a vector status bar directly on canvas over screenshots.
- Displays 9:41 time, signal bars, network indicator, and full battery icon.
- Supports light (black icons) and dark (white icons) color switching.

### Marketing localization (`/api/ai/translate`)
- Endpoint: `POST /api/ai/translate`
- Catalog: Supports 60+ App Store and Google Play languages.
- Translation approach: Adapts copy for natural marketing reading rather than literal word-by-word substitution.
- Length constraints: Condenses longer target languages (such as German or French) to avoid text truncation on mobile canvas headers.
