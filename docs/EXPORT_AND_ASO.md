# 📦 Export Suite, Fastlane Package & Store Submission

This document outlines the multi-device export pipeline, Fastlane metadata generation, and App Store / Google Play submission compliance checks.

---

## 1. Export Package Structure (ZIP Architecture)

When exporting an entire project, SnapFrame builds a structured, non-colliding ZIP file using [ExportModal.tsx](file:///b:/workgit/simple-screenshot-market/src/components/editor/ExportModal.tsx):

```
My_Awesome_App_Screenshots.zip
├── App Store (iPhone)/
│   ├── MyApp_iPhone_01@1x.png  (1290 × 2796 px)
│   ├── MyApp_iPhone_02@1x.png
│   └── ...
├── App Store (iPad)/
│   ├── MyApp_iPad_01@1x.png    (2048 × 2732 px)
│   ├── MyApp_iPad_02@1x.png
│   └── ...
├── Google Play (Phone)/
│   ├── MyApp_Android_Phone_01@1x.png (1080 × 2400 px)
│   ├── MyApp_Android_Phone_02@1x.png
│   └── ...
├── Google Play (Tablet)/
│   ├── MyApp_Android_Tablet_01@1x.png (1600 × 2560 px)
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

---

## 2. Store Submission Validator

Before exporting, SnapFrame automatically verifies the project against official developer guidelines:

1. **Resolution Compliance:**
   - Apple 6.7" / 6.9" displays: 1290 × 2796 px or 1320 × 2868 px.
   - Apple 13" iPad displays: 2048 × 2732 px.
   - Google Play: 16:9 / 9:16 aspect ratio with minimum dimension of 1080px.
2. **Color Profile:** 72 DPI, 24-bit sRGB color profile.
3. **No Alpha Channel Transparency:** Eliminates transparency artifacts that can trigger App Store Connect upload rejections.
4. **Validation Badge:** Renders `100% Store Submission Verified (PASSED)` in the export dialog.

---

## 3. Fastlane Metadata Automation

The export suite generates ready-to-deploy **Fastlane Deliver** and **Fastlane Supply** metadata structures:

- **iOS (`deliver`):** Automatically creates `name.txt`, `subtitle.txt`, `promotional_text.txt`, `keywords.txt`, `description.txt`, and `release_notes.txt` per language.
- **Android (`supply`):** Automatically creates `title.txt`, `short_description.txt`, and `full_description.txt`.
- **Root `metadata.json`:** Machine-readable JSON summary containing export timestamps, platform versions, resolutions, and localization catalogs.

---

## 4. 1-Click Lossless 4K Clipboard Copy

- Available directly in the top editor navbar and inside the export dialog.
- Generates a full-resolution PNG on an off-screen canvas and writes it directly to the system clipboard via the `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])` API for instant pasting into Figma, Slack, Keynote, or Notion.

---

## 5. Tier-Based Export Capabilities

- **👤 Guest Mode (Unregistered):** 1-Click Clipboard copy is 100% free for quick mockups. ZIP downloads prompt a free Google/GitHub sign-in.
- **🟢 Free Registered ($0):** Free export of up to 3 screenshots per set for 1 primary device platform in 1 language, standard resolution (1x/2x).
- **⭐ SnapFrame Pro ($9/mo or $69/yr):** Complete 10-screen multi-platform ZIP package (iOS + iPad + Android + Tablet), batch 40+ language localizations, Fastlane metadata suite, and 4K lossless master resolution.

