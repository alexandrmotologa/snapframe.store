# SnapFrame JSON schema reference

SnapFrame projects and screenshot sets can be imported and exported programmatically as JSON. This enables automation in CI/CD pipelines, bulk generation scripts, or prompt workflows with models like ChatGPT, Claude, or Gemini.

## 1. Top-level structure

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
      "headline": "Track Workouts and Build Habits",
      "subheadline": "Targeted metrics and structured training plans",
      "badges": ["Smart Log", "500+ Exercises", "Apple Health Sync"]
    }
  ]
}
```

## 2. Fields reference

### `theme`
- `name` *(string)*: Theme label.
- `backgroundType` *(string)*: `"solid" | "gradient" | "mesh"`.
- `gradient` *(object)*:
  - `direction`: `"to-b" | "to-r" | "to-br" | "to-bl" | "to-tr" | "to-tl"`.
  - `stops`: Array of `{ "color": "#hex", "position": 0-100 }`.
- `textColor` *(string)*: Primary text hex color (for example, `"#ffffff"`).
- `accentColor` *(string)*: Accent hex color for badges and highlights.

### `mockup`
- `device` *(string)*: Device preset identifier:
  - iOS: `"iphone-17-pro-max" | "iphone-16-pro" | "ipad-pro-13"`
  - Android: `"pixel-10-pro-xl" | "samsung-s25-ultra" | "samsung-tab-s10-ultra"`
- `frameType` *(string)*: `"3d" | "flat" | "titanium" | "clay" | "glass" | "neon" | "wireframe"`.
- `showFrame` *(boolean)*: Toggles the device mockup frame.
- `showShadow` *(boolean)*: Toggles the drop shadow.

### `screens[]`
- `caption` *(string)*: Uppercase text above the headline.
- `headline` *(string)*: Primary feature headline (typically 25 to 40 characters).
- `subheadline` *(string, optional)*: Secondary supporting description.
- `badges` *(string[], optional)*: Feature pills or callouts.
- `background` *(object, optional)*: Overrides the background for this specific screen.

## 3. Working with prompts

To generate screenshot sets with external language models:
1. In the SnapFrame editor, open the JSON studio modal via the code icon in the top toolbar.
2. Copy the generation prompt provided in the dialog.
3. Paste the prompt into your model of choice (ChatGPT, Claude, or Gemini).
4. Copy the returned JSON and paste it into the "Import JSON" tab.
