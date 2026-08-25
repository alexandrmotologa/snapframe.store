# SnapFrame JSON Schema Reference

SnapFrame projects and screenshot sets can be generated, edited, imported, and exported programmatically as JSON. This is ideal for CI/CD pipelines, bulk generation, or AI-assisted workflows (ChatGPT, Claude, Gemini).

---

## 1. Top-Level Structure

```json
{
  "version": "1.2",
  "appName": "FitPulse",
  "store": "ios",
  "device": "iphone-17-pro-max",
  "theme": {
    "name": "OLED Midnight",
    "backgroundType": "gradient",
    "gradient": {
      "direction": "to-br",
      "stops": [
        { "color": "#060810", "position": 0 },
        { "color": "#1e1b4b", "position": 100 }
      ]
    },
    "textColor": "#ffffff",
    "accentColor": "#6366f1"
  },
  "mockup": {
    "device": "iphone-17-pro-max",
    "color": "black",
    "frameType": "3d",
    "showFrame": true,
    "showShadow": true
  },
  "screens": [
    {
      "caption": "AI FITNESS COACH",
      "headline": "Track Workouts & Transform Faster",
      "subheadline": "Precision metrics and personalized AI training plans",
      "badges": ["Smart Log", "500+ Exercises", "Apple Health Sync"]
    }
  ]
}
```

---

## 2. Fields Reference

### `theme`
- `name` *(string)*: Human-readable theme name.
- `backgroundType` *(string)*: `"solid" | "gradient" | "mesh"`.
- `gradient` *(object)*:
  - `direction`: `"to-b" | "to-r" | "to-br" | "to-bl" | "to-tr" | "to-tl"`.
  - `stops`: Array of `{ "color": "#hex", "position": 0-100 }`.
- `textColor` *(string)*: Primary text hex code (e.g. `"#ffffff"`).
- `accentColor` *(string)*: Accent hex code for badges & highlights.

### `mockup`
- `device` *(string)*: Device preset ID:
  - iOS: `"iphone-17-pro-max" | "iphone-16-pro" | "ipad-pro-13"`
  - Android: `"pixel-10-pro-xl" | "samsung-s25-ultra" | "samsung-tab-s10-ultra"`
- `frameType` *(string)*: `"3d" | "flat" | "titanium" | "clay" | "glass" | "neon" | "wireframe"`.
- `showFrame` *(boolean)*: Toggle device mockup frame.
- `showShadow` *(boolean)*: Toggle ambient drop shadow.

### `screens[]`
- `caption` *(string)*: Uppercase eyebrow / badge text above the headline.
- `headline` *(string)*: Main bold feature headline (25-40 chars recommended).
- `subheadline` *(string, optional)*: Secondary supporting description.
- `badges` *(string[], optional)*: Feature pills or callouts.
- `background` *(object, optional)*: Override background for this specific slide.

---

## 3. How to use with ChatGPT / Claude (Prompt-to-Deck)

In the SnapFrame editor, open the **AI Prompt / JSON** studio (or click the `<Code2 />` button in the top toolbar), copy the generated prompt, paste it into ChatGPT / Claude, and paste the returned JSON back into the **Import JSON** tab!
