# Devices, tablets, and canvas engine

This document details supported device models, vector bezel rendering, and tablet layout adaptations in SnapFrame.

## 1. Supported device matrix

SnapFrame provides pre-configured device models for Apple and Android platforms.

### Apple devices (iOS and iPadOS)
| Device model | Canvas resolution | Aspect ratio | Screen type | Available colors |
| :--- | :--- | :--- | :--- | :--- |
| iPhone 17 Pro | 1320 x 2868 px | 19.5:9 | Dynamic Island | Black, White, Natural, Desert Titanium |
| iPhone 16 Pro | 1320 x 2868 px | 19.5:9 | Dynamic Island | Black, White, Natural, Desert Titanium |
| iPhone 16 | 1290 x 2796 px | 19.5:9 | Dynamic Island | Black, White, Pink, Teal, Ultramarine |
| iPhone 15 Pro | 1290 x 2796 px | 19.5:9 | Dynamic Island | Black, White, Natural, Blue Titanium |
| iPhone 14 | 1170 x 2532 px | 19.5:9 | Notch | Midnight, Starlight, Blue, Purple, Red |
| iPad Pro 13" | 2048 x 2732 px | 4:3 | Slim Bezel / Tablet | Space Black, Silver |

### Android devices (Phones and tablets)
| Device model | Canvas resolution | Aspect ratio | Screen type | Available colors |
| :--- | :--- | :--- | :--- | :--- |
| Google Pixel 10/11 Pro XL | 1344 x 2992 px | 20:9 | Center Hole-Punch | Obsidian, Porcelain, Hazel, Rose Quartz |
| Google Pixel 10/11 Pro | 1280 x 2856 px | 20:9 | Center Hole-Punch | Obsidian, Porcelain, Hazel, Rose Quartz |
| Google Pixel 9 Pro XL | 1344 x 2992 px | 20:9 | Center Hole-Punch | Obsidian, Porcelain, Hazel, Rose Quartz |
| Google Pixel 9 Pro | 1280 x 2856 px | 20:9 | Center Hole-Punch | Obsidian, Porcelain, Hazel, Rose Quartz |
| Samsung Galaxy S25 Ultra | 1440 x 3120 px | 19.5:9 | Center Hole-Punch | Titanium Black, Gray, Silverblue, Whitesilver |
| Samsung Galaxy S24 Ultra | 1440 x 3120 px | 19.5:9 | Center Hole-Punch | Titanium Black, Gray, Violet, Yellow |
| Samsung Galaxy Tab S9 Ultra | 1848 x 2960 px | 16:10 | Mini Notch / Tablet | Graphite, Beige |
| Samsung Galaxy Tab S7 / S8 | 1600 x 2560 px | 16:10 | Slim Bezel / Tablet | Mystic Black, Mystic Silver |
| Samsung Galaxy Tab A | 1200 x 1920 px | 16:10 | Slim Bezel / Tablet | Dark Gray, Silver |

## 2. Vector bezel and frame rendering

Device frames are rendered using 2D Canvas vector paths:

1. Bezel scaling: Scaled as `physicalW * bezelRatio` to maintain hardware proportions.
2. Corner radius: Matches hardware squircle radiuses for each supported model.
3. Hardware buttons: Draws side rockers, power buttons, and action buttons.
4. Camera cutouts:
   - Dynamic Island: Pill-shaped cutout with camera aperture and sensor layout.
   - Hole-punch: Centered circular camera cutout with anti-aliasing.
   - Tablet mini-notch: Proportional top cutout for slim tablet bezels.

## 3. Manufacturer color mapping (`COLOR_HEX_MAP`)

Devices use color tokens matching manufacturer finishes in [devices.ts](file:///b:/workgit/simple-screenshot-market/src/lib/devices.ts):

```typescript
export const COLOR_HEX_MAP: Record<string, string> = {
  // Apple Titanium
  "black titanium": "#1c1b1f",
  "white titanium": "#e3e4e6",
  "natural titanium": "#9f9a94",
  "desert titanium": "#cbb29e",
  "blue titanium": "#3b4454",
  
  // Apple iPhone 16
  "ultramarine": "#4459b7",
  "teal": "#8cb5b5",
  "pink": "#e8a7ba",

  // Google Pixel
  "obsidian": "#28292c",
  "porcelain": "#f1eee9",
  "hazel": "#828679",
  "rose quartz": "#e8d2cb",

  // Samsung Galaxy
  "titanium black": "#1f1f21",
  "titanium gray": "#7b7b7f",
  "titanium silverblue": "#5b6d82",
  "graphite": "#262626",
};
```

## 4. Multi-set layout adaptation

When switching between phone and tablet sets:
- Phone sets (9:16 / 19.5:9): Position typography above or centered over device mockups.
- Tablet sets (4:3 / 16:10): Expand horizontal margins and adjust mockup scale to prevent excessive empty space.
