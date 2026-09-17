# Export package, Fastlane structure, and store submission

This document outlines the multi-device export pipeline, Fastlane metadata generation, and store compliance checks in SnapFrame.

## 1. Export package structure (ZIP archive)

When exporting an entire project, SnapFrame builds a structured ZIP file using [ExportModal.tsx](file:///b:/workgit/simple-screenshot-market/src/components/editor/ExportModal.tsx):

```
My_App_Screenshots.zip
├── App Store (iPhone)/
│   ├── MyApp_iPhone_01@1x.png  (1290 x 2796 px)
│   ├── MyApp_iPhone_02@1x.png
│   └── ...
├── App Store (iPad)/
│   ├── MyApp_iPad_01@1x.png    (2048 x 2732 px)
│   ├── MyApp_iPad_02@1x.png
│   └── ...
├── Google Play (Phone)/
│   ├── MyApp_Android_Phone_01@1x.png (1080 x 2400 px)
│   ├── MyApp_Android_Phone_02@1x.png
│   └── ...
├── Google Play (Tablet)/
│   ├── MyApp_Android_Tablet_01@1x.png (1600 x 2560 px)
│   ├── MyApp_Android_Tablet_02@1x.png
│   └── ...
├── fastlane/
│   └── metadata/
│       ├── ios/
│       │   ├── en-US/
│       │   │   ├── name.txt
│       │   │   ├── subtitle.txt
│       │   │   ├── promotional_text.txt
│       │   │   ├── keywords.txt
│       │   │   ├── description.txt
│       │   │   └── release_notes.txt
│       │   └── ro/
│       │       └── ...
│       └── android/
│           ├── en-US/
│           │   ├── title.txt
│           │   ├── short_description.txt
│           │   └── full_description.txt
│           └── ...
├── store_listing/
│   ├── App_Store_Listing_EN.txt
│   ├── Google_Play_Listing_EN.txt
│   └── store_listing.json
└── metadata.json
```

## 2. Store submission checks

Before exporting, SnapFrame checks screenshot dimensions against store criteria:

1. Resolution standards:
   - Apple 6.7" / 6.9" displays: 1290 x 2796 px or 1320 x 2868 px.
   - Apple 13" iPad displays: 2048 x 2732 px.
   - Google Play: 16:9 or 9:16 aspect ratio with minimum dimension of 1080 px.
2. Color profile: 72 DPI, 24-bit sRGB color space.
3. No alpha channel transparency: Flattens transparency to prevent App Store Connect upload rejections.
4. Validation badge: Displays confirmation in the export dialog once criteria pass.

## 3. Fastlane metadata structure

The export builder generates files compatible with Fastlane Deliver (iOS) and Fastlane Supply (Android):

- iOS (`deliver`): Creates `name.txt`, `subtitle.txt`, `promotional_text.txt`, `keywords.txt`, `description.txt`, and `release_notes.txt` per language.
- Android (`supply`): Creates `title.txt`, `short_description.txt`, and `full_description.txt`.
- Root `metadata.json`: Machine-readable summary containing export timestamps, device models, and localized file paths.

## 4. Clipboard copy

- Available in the top editor navigation bar and inside the export dialog.
- Renders the active screen on an off-screen canvas and writes it directly to the system clipboard via the `navigator.clipboard.write()` API for pasting into Figma, Slack, or Notion.

## 5. Lossless Video and Animated GIF Studio

- WebAssembly FFmpeg pipeline (`src/lib/video/ffmpegVideoRenderer.ts`):
  - Uses `@ffmpeg/ffmpeg` 0.12 WebAssembly core executing entirely in the browser without server video processing costs.
  - Broadcast-grade H.264 MP4 export (`-c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart`).
  - App Store compliance: Constant 60 FPS or 30 FPS pacing with BT.709 YUV420p color matrix and zero dropped frames.
  - Smooth transitions: Slide, cross-fade, and instantaneous cut transitions using cubic ease interpolation ($p^2 \times (3 - 2p)$).
  - WebM & GIF export: Preserves HTML5 MediaRecorder stream capture for instant WebM previews and FFmpeg two-pass palette optimization (`palettegen` / `paletteuse`) for looping animated GIFs.

## 6. Account tier export limits

- Guest: 1-click clipboard copy for the active screen. ZIP downloads prompt for a free account.
- Free Registered ($0): Export up to 3 screenshots per set for 1 platform in 1 language, clipboard copy for screens 1 to 3, standard 1x/2x resolution.
- SnapFrame Pro ($9/mo or $69/yr): Full 10-screen multi-platform ZIP package (iOS, iPad, Android, Tablet), custom canvas dimensions, social media presets, mockup frame scaling (50% to 150%), clipboard copy on all screens, dual light/dark set generation, store simulator, batch 40+ language localizations, Fastlane metadata package, and 4K lossless export (@3x).
