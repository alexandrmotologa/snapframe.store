// Core types for the SnapFrame application

export type StoreType = "ios" | "android";

export type LayerType = "text" | "image" | "screenshot" | "shape" | "flag" | "emoji" | "brand" | "character";

export type ThemeCategory = "all" | "light" | "dark" | "vibrant" | "pastel" | "earthy" | "gradient" | "neon";

export type ThemeId = string;

export interface Theme {
  id: ThemeId;
  name: string;
  category?: ThemeCategory;
  bg: string;
  bgAlt?: string;
  fg: string;
  fgAlt?: string;
  accent?: string;
  muted?: string;
  gradient?: {
    direction: GradientDirection;
    stops: { color: string; position: number }[];
  };
}

export type SlideLayout =
  | "hero"
  | "device-bottom"
  | "device-top"
  | "two-devices"
  | "no-device"
  | "split-landscape"
  | "feature-graphic";


export type ShapeType =
  | "rectangle"
  | "circle"
  | "rounded-rectangle"
  | "star"
  | "triangle"
  | "hexagon"
  | "diamond"
  | "crescent"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "line"
  | "wave"
  | "appstore-badge"
  | "googleplay-badge"
  | "rating-badge"
  | "award-badge"
  | "users-badge"
  | "security-badge"
  | "notification-badge"
  | "search-badge"
  | "glow-orb"
  | "dynamic-island"
  | "live-activity"
  | "ios-toggle"
  | "editors-choice-badge"
  | "design-award-badge"
  | "streak-badge"
  | "guarantee-badge"
  | "growth-stat-card"
  | "comparison-card"
  | "curved-arrow"
  | "handwritten-callout"
  | "marker-highlight"
  | (string & {});

export type TextAlign = "left" | "center" | "right";

export type BackgroundType = "solid" | "gradient" | "image" | "mesh" | "pattern";

export type GradientDirection =
  | "to-b"
  | "to-r"
  | "to-br"
  | "to-bl"
  | "to-tr"
  | "to-tl";

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface MeshGradient {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

export type PatternType = "dots" | "lines" | "grid" | "noise";

export interface BackgroundPattern {
  type: PatternType;
  color: string;
  opacity: number; // 0-1
  size?: number;   // dot size / line width / grid cell
  spacing?: number;
  angle?: number;  // for lines
}

export interface Background {
  type: BackgroundType;
  color?: string;
  gradient?: {
    direction: GradientDirection;
    stops: GradientStop[];
  };
  imageUrl?: string;
  imageSlice?: { x: number; y: number; width: number; height: number };
  /** Mesh gradient — 4-corner colors */
  mesh?: MeshGradient;
  /** Background solid color to render behind image */
  backgroundColor?: string;
  /** Overlay pattern on top of any background */
  pattern?: BackgroundPattern;
}

export interface TextLayer {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  /** Optional gradient override: [startColor, endColor, direction] */
  gradientColor?: [string, string, "horizontal" | "vertical" | "diagonal"];
  /** Optional named metallic / glow gradient preset ID */
  gradientPresetId?: string;
  /** Optional glow / neon outer halo */
  glow?: {
    color: string;
    blur: number;
  };
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  groupId?: string;
  /** Canvas transform scale (applied on top of fontSize) */
  scale?: number;
  textCase?: "none" | "uppercase" | "lowercase" | "capitalize";
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  /** Text outline/stroke */
  stroke?: {
    color: string;
    width: number;
  };
  /** Highlight rectangle behind text */
  highlight?: {
    color: string;
    paddingX: number;
    paddingY: number;
    cornerRadius: number;
  };
}

export interface ImageLayer {
  id: string;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  cornerRadius: number;
  locked?: boolean;
  groupId?: string;
}

export interface FocusOverlay {
  enabled: boolean;
  cropTop: number;
  cropBottom: number;
  borderWidth: number;
  borderColor: string;
  roundedCorners: "none" | "sm" | "md" | "xl" | number;
  blurBackground: boolean;
  blurAmount?: number;
  overlayShadow: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

/**
 * ScreenshotLayer — the core concept of SnapFrame.
 * A reserved zone where the user's app screenshot is placed.
 * Shows a placeholder when no image is uploaded.
 * Can optionally have a device frame rendered on top.
 */
export interface ScreenshotLayer {
  id: string;
  type: "screenshot";
  /** The uploaded app screenshot (data URL or blob URL) */
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  /** How the image fills the zone */
  objectFit: "cover" | "contain" | "fill";
  /** Corner radius for clipping */
  cornerRadius: number;
  /** Whether to show a device frame overlay */
  showDeviceFrame: boolean;
  /** Drop shadow */
  shadow?: {
    blur: number;
    spread: number;
    color: string;
    offsetX: number;
    offsetY: number;
  };
  /** Slot label shown in placeholder (e.g. "Screenshot 1") */
  label?: string;
  /** Focus Overlay settings */
  focusOverlay?: FocusOverlay;
  /** Clean Status Bar (9:41 AM · 100% Battery · 5G) overlay */
  cleanStatusBar?: boolean;
  statusBarTheme?: "light" | "dark";
  locked?: boolean;
  groupId?: string;
}

export interface ShapeLayer {
  id: string;
  type: "shape";
  shape: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation: number;
  opacity: number;
  cornerRadius?: number;
  /** Primary custom text for badges, notification banners, search bars, cards */
  text?: string;
  /** Secondary custom text or subtitle / app name */
  subtext?: string;
  /** Optional group ID to link multiple layers together during move/drag */
  groupId?: string;
  shadow?: {
    blur: number;
    spread: number;
    color: string;
    offsetX: number;
    offsetY: number;
  };
  locked?: boolean;
}

export interface FlagLayer {
  id: string;
  type: "flag" | "emoji" | "brand";
  content: string; // emoji or SVG URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  groupId?: string;
}

export interface CharacterLayer {
  id: string;
  type: "character";
  characterId: string;
  poseId: string;
  /** SVG content or URL */
  svgContent: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  /** Optional tint color overlay */
  tintColor?: string;
  locked?: boolean;
  groupId?: string;
}


export type Layer = TextLayer | ImageLayer | ScreenshotLayer | ShapeLayer | FlagLayer | CharacterLayer;

// Device mockup definitions
export type DeviceColor = string; // e.g. "black", "white", "titanium-natural", "obsidian" etc.

export type FrameType = "3d" | "2d" | "clay" | "glass" | "neon" | "titanium" | "wireframe";

export type DeviceShadowPreset =
  | "none"
  | "soft-ambient"
  | "floating-studio"
  | "hard-isometric"
  | "neon-glow";

export interface MockupSettings {
  device: string;
  color: DeviceColor;
  showFrame: boolean;
  frameType?: FrameType;
  showReflection: boolean;
  showShadow: boolean;
  shadowPreset?: DeviceShadowPreset;
  shadowGlowColor?: string;
  /** Squircle (iOS-style rounded) corners for the card */
  squircle?: boolean;
  /** Show/hide screenshots (focus mode) */
  showScreenshots?: boolean;
  notch?: boolean;
  dynamicIsland?: boolean;
  reflection?: boolean;
  /** Clean Status Bar (9:41 AM · 100% Battery · 5G) overlay */
  cleanStatusBar?: boolean;
  statusBarTheme?: "light" | "dark";
  /** Pro feature: Mockup Frame scaling factor (0.4 to 2.0) */
  scale?: number;
}

// Store-specific size presets
export interface SizePreset {
  name: string;
  width: number;
  height: number;
  store: StoreType;
  description: string;
}

export const SIZE_PRESETS: SizePreset[] = [
  // iOS App Store
  {
    name: 'iPhone 6.9"',
    width: 1320,
    height: 2868,
    store: "ios",
    description: "Required for App Store",
  },
  {
    name: 'iPhone 6.7"',
    width: 1290,
    height: 2796,
    store: "ios",
    description: "App Store",
  },
  {
    name: 'iPhone 6.5"',
    width: 1242,
    height: 2688,
    store: "ios",
    description: "App Store",
  },
  {
    name: 'iPad Pro 12.9"',
    width: 2048,
    height: 2732,
    store: "ios",
    description: "App Store",
  },
  // Google Play
  {
    name: "Android 6.7\"",
    width: 1290,
    height: 2796,
    store: "android",
    description: "Google Play standard",
  },
];

// Per-layer localization overrides for a specific language
export type LayerLocalization = {
  content?: string;
  fontSize?: number;
};

// Screen-level localizations: { [langCode]: { [layerId]: LayerLocalization } }
export type ScreenLocalizations = {
  [langCode: string]: {
    [layerId: string]: LayerLocalization;
  };
};

// A single screen in a project
export interface Screen {
  id: string;
  name: string;
  /** Short caption shown above the headline, e.g. "Track Your Mood" */
  caption?: string;
  background: Background;
  layers: Layer[];
  mockup?: MockupSettings;
  width: number;
  height: number;
  /** Layout structure for dynamic positioning */
  layout?: SlideLayout;
  /** i18n: per-language text overrides for text layers */
  localizations?: ScreenLocalizations;
}

// A project contains multiple screen sets (one per store)
export interface ScreenSet {
  id: string;
  /** Display name for this set, e.g. "App Store (iOS)" */
  name?: string;
  store: StoreType;
  preset: SizePreset;
  mockup: MockupSettings;
  deviceId?: string;
  screens: Screen[];
  /** App Store / Play Store URL for reference */
  referenceUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  templateId: string | null;
  screenSets: ScreenSet[];
  hiddenScreenSets?: ScreenSet[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  /** ISO language codes enabled for this project, e.g. ['en', 'ro', 'de'] */
  languages?: string[];
  /** Currently active language in editor (not persisted) */
  activeLanguage?: string;
  /** Global theme for colors */
  themeId?: ThemeId;
  /** Store listing text metadata mapped by langCode (e.g. 'en', 'fr') */
  storeListing?: Record<string, {
    ios?: { name: string; subtitle: string; description: string; promotionalText: string; whatsNew: string };
    android?: { title: string; shortDescription: string; fullDescription: string; whatsNew: string };
  }>;
}

export type TemplateLayer = (
  | Omit<TextLayer, "id">
  | Omit<ImageLayer, "id">
  | Omit<ScreenshotLayer, "id">
  | Omit<ShapeLayer, "id">
  | Omit<FlagLayer, "id">
  | Omit<CharacterLayer, "id">
) & { id?: string };

// Template definition
export interface TemplateScreen {
  name: string;
  background: Background;
  layers: TemplateLayer[];
}

/** Visual layout style for template previews */
export type TemplateLayout =
  | "screenshot-top"      // screenshot top 65%, text bottom
  | "screenshot-bottom"   // text top, screenshot bottom 55%
  | "screenshot-float"    // screenshot floating center-right with shadow
  | "screenshot-float-reverse" // screenshot floating center-left
  | "screenshot-full"     // screenshot full-bleed, text overlay
  | "screenshot-split"    // 2 screenshots side-by-side
  | "text-only";          // no screenshot zone (pure text/graphic)

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  previewColor: string;
  previewGradient?: string[]; // gradient colors [from, to, ...stops]
  layout: TemplateLayout;
  screens: TemplateScreen[];
}

export interface UploadedAsset {
  id: string;
  name: string;
  dataUrl: string;
  width?: number;
  height?: number;
}

