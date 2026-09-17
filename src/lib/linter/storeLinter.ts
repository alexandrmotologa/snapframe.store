import { ScreenSet, Screen, TextLayer, ScreenshotLayer, ShapeLayer } from "@/lib/types";

export type IssueSeverity = "error" | "warning" | "info";

export interface LinterIssue {
  id: string;
  rule: string;
  severity: IssueSeverity;
  message: string;
  suggestion: string;
  screenId: string;
  screenIndex: number;
  layerId?: string;
}

export interface StoreLinterResult {
  score: number; // 0 to 100
  passed: boolean;
  issueCounts: {
    error: number;
    warning: number;
    info: number;
  };
  issues: LinterIssue[];
}

/**
 * Google Play metadata & screenshot policy banned phrases
 * https://support.google.com/googleplay/android-developer/answer/9867159
 */
const GOOGLE_PLAY_PROHIBITED_PATTERNS = [
  { pattern: /\b#1\b/i, name: "Ranking claim (#1)" },
  { pattern: /\bno\.?\s*1\b/i, name: "Ranking claim (No. 1)" },
  { pattern: /\btop\s+rated\b/i, name: "Subjective claim (Top Rated)" },
  { pattern: /\bbest\s+(app|game|tool|product)\b/i, name: "Subjective superlatives (Best ...)" },
  { pattern: /\b(100%\s+)?free\b/i, name: "Price / incentive claim (Free)" },
  { pattern: /\b(discount|sale|deal|save\s*\$)\b/i, name: "Commercial discount claim" },
  { pattern: /\bdownload\s+now\b/i, name: "Direct call to action (Download Now)" },
  { pattern: /[★⭐]{3,}/u, name: "Depicting store review stars" },
];

/**
 * Parses hex or rgb/rgba color string into [r, g, b, a] in 0-1 range.
 */
export function parseColorToRgba(colorStr?: string): [number, number, number, number] {
  if (!colorStr) return [0, 0, 0, 1];
  const s = colorStr.trim().toLowerCase();

  // Hex color (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16) / 255;
      const g = parseInt(hex[1] + hex[1], 16) / 255;
      const b = parseInt(hex[2] + hex[2], 16) / 255;
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return [r, g, b, a];
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    }
  }

  // rgb/rgba
  const rgbMatch = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = parseFloat(rgbMatch[1]) / 255;
    const g = parseFloat(rgbMatch[2]) / 255;
    const b = parseFloat(rgbMatch[3]) / 255;
    const a = rgbMatch[4] != null ? parseFloat(rgbMatch[4]) : 1;
    return [r, g, b, a];
  }

  return [0, 0, 0, 1];
}

/**
 * Calculates standard WCAG relative luminance (0 to 1).
 */
export function getRelativeLuminance(rgba: [number, number, number, number]): number {
  const [r, g, b] = rgba.map((val) => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG contrast ratio between two colors (1 to 21).
 */
export function getContrastRatio(fgRgba: [number, number, number, number], bgRgba: [number, number, number, number]): number {
  const l1 = getRelativeLuminance(fgRgba);
  const l2 = getRelativeLuminance(bgRgba);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * Runs a pre-flight compliance, policy, and design audit on a ScreenSet.
 */
export function lintScreenSet(screenSet: ScreenSet): StoreLinterResult {
  const issues: LinterIssue[] = [];
  const isAndroid = screenSet.store === "android";
  const isApple = screenSet.store === "ios";

  screenSet.screens.forEach((screen, screenIndex) => {
    const W = screen.width || 1290;
    const H = screen.height || 2796;
    const bg = screen.background;

    // ── Rule 1: Apple Alpha Transparency Audit ──────────────────────────────
    if (isApple) {
      if ((bg.type as string) === "transparent") {
        issues.push({
          id: `apple-alpha-${screen.id}`,
          rule: "apple-no-alpha",
          severity: "error",
          message: "Apple App Store rejects screenshots with transparent backgrounds.",
          suggestion: "Set a solid or gradient background color before exporting for App Store Connect.",
          screenId: screen.id,
          screenIndex,
        });
      } else if (bg.type === "solid" && bg.color) {
        const [, , , a] = parseColorToRgba(bg.color);
        if (a < 0.99) {
          issues.push({
            id: `apple-alpha-semi-${screen.id}`,
            rule: "apple-no-alpha",
            severity: "error",
            message: `Background color has transparency (alpha: ${Math.round(a * 100)}%). Apple requires 100% opaque PNGs.`,
            suggestion: "Change background color to 100% opacity.",
            screenId: screen.id,
            screenIndex,
          });
        }
      }
    }

    // Estimate screen background luminance for contrast check
    let screenBgRgba: [number, number, number, number] = [0.05, 0.07, 0.12, 1]; // default dark
    if (bg.type === "solid" && bg.color) {
      screenBgRgba = parseColorToRgba(bg.color);
    } else if (bg.type === "gradient" && bg.gradient?.stops?.[0]?.color) {
      screenBgRgba = parseColorToRgba(bg.gradient.stops[0].color);
    }

    // ── Rule 2: Layers Audit ─────────────────────────────────────────────────
    let hasScreenshotLayer = false;
    let hasUploadedScreenshot = false;

    screen.layers.forEach((layer) => {
      // Check Text Layers
      if (layer.type === "text") {
        const tl = layer as TextLayer;
        const text = tl.content || "";

        // Banned Google Play marketing words
        for (const item of GOOGLE_PLAY_PROHIBITED_PATTERNS) {
          if (item.pattern.test(text)) {
            issues.push({
              id: `play-policy-${layer.id}-${item.name}`,
              rule: "google-play-policy",
              severity: isAndroid ? "error" : "warning",
              message: `Contains prohibited store text: "${item.name}" found in "${text.slice(0, 30)}..."`,
              suggestion: isAndroid
                ? "Google Play rejects listings with ranking, pricing, or review star claims. Rephrase focusing on app functionality."
                : "Avoid superlative ranking claims to adhere to store editorial standards.",
              screenId: screen.id,
              screenIndex,
              layerId: layer.id,
            });
          }
        }

        // Search Thumbnail Legibility (< 40px relative to standard 1290px canvas)
        const minHeadlineSize = Math.round(W * 0.032); // ~41px on 1290x2796
        if (tl.fontSize < minHeadlineSize && text.length < 80) {
          issues.push({
            id: `thumbnail-legibility-${layer.id}`,
            rule: "search-thumbnail-legibility",
            severity: "warning",
            message: `Text font size (${tl.fontSize}px) may be illegible in App Store search thumbnails.`,
            suggestion: `Increase font size to at least ${Math.round(minHeadlineSize * 1.3)}px for prominent readability on mobile search feeds.`,
            screenId: screen.id,
            screenIndex,
            layerId: layer.id,
          });
        }

        // Contrast Check
        const fgRgba = parseColorToRgba(tl.color);
        const contrast = getContrastRatio(fgRgba, screenBgRgba);
        if (contrast < 2.5) {
          issues.push({
            id: `low-contrast-${layer.id}`,
            rule: "wcag-contrast",
            severity: "warning",
            message: `Low text contrast ratio (${contrast.toFixed(1)}:1). WCAG guidelines recommend at least 3.0:1.`,
            suggestion: "Adjust text color or background brightness to improve readability.",
            screenId: screen.id,
            screenIndex,
            layerId: layer.id,
          });
        }
      }

      // Check Screenshot Layers
      if (layer.type === "screenshot") {
        hasScreenshotLayer = true;
        const sl = layer as ScreenshotLayer;
        if (sl.src) {
          hasUploadedScreenshot = true;
        }
      }

      // Check Shape Layers for Google Play stars policy
      if (layer.type === "shape") {
        const sh = layer as ShapeLayer;
        if (isAndroid && sh.shape === "rating-badge") {
          issues.push({
            id: `play-rating-badge-${sh.id}`,
            rule: "google-play-policy",
            severity: "error",
            message: "Simulated rating & review stars badge is strictly prohibited by Google Play store guidelines.",
            suggestion: "Remove the rating stars block for Android screen sets or replace with an award or feature callout.",
            screenId: screen.id,
            screenIndex,
            layerId: sh.id,
          });
        }
      }
    });

    // Rule 5: Placeholder check
    if (hasScreenshotLayer && !hasUploadedScreenshot) {
      issues.push({
        id: `missing-screenshot-${screen.id}`,
        rule: "empty-screenshot-placeholder",
        severity: "warning",
        message: `Screen #${screenIndex + 1} contains a mockup slot without an uploaded screenshot.`,
        suggestion: "Upload an app screenshot or apply Smart Framing before publishing.",
        screenId: screen.id,
        screenIndex,
      });
    }
  });

  // Calculate health score: 100 base, -20 per error, -8 per warning
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const penalty = errorCount * 20 + warningCount * 8 + infoCount * 2;
  const score = Math.max(0, 100 - penalty);
  const passed = errorCount === 0;

  return {
    score,
    passed,
    issueCounts: {
      error: errorCount,
      warning: warningCount,
      info: infoCount,
    },
    issues,
  };
}
