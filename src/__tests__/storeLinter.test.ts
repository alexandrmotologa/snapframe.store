import { describe, it, expect } from "vitest";
import {
  lintScreenSet,
  getContrastRatio,
  getRelativeLuminance,
  parseColorToRgba,
} from "@/lib/linter/storeLinter";
import { ScreenSet, Screen, TextLayer, ScreenshotLayer, ShapeLayer } from "@/lib/types";

describe("Pre-Submission Store Linter", () => {
  it("should calculate correct color luminance and contrast ratio", () => {
    const whiteRgba = parseColorToRgba("#ffffff");
    const blackRgba = parseColorToRgba("#000000");

    expect(getRelativeLuminance(whiteRgba)).toBeCloseTo(1, 2);
    expect(getRelativeLuminance(blackRgba)).toBeCloseTo(0, 2);

    const contrast = getContrastRatio(whiteRgba, blackRgba);
    expect(contrast).toBeCloseTo(21, 0); // Max contrast is 21:1
  });

  it("should detect Google Play policy violations on Android screen sets", () => {
    const screenSet: ScreenSet = {
      id: "set_android",
      name: "Play Store Listing",
      store: "android",
      preset: { name: "Android 6.7\"", width: 1080, height: 1920, store: "android", description: "" },
      mockup: { device: "pixel-8-pro", color: "obsidian", showFrame: true, showReflection: true, showShadow: true },
      screens: [
        {
          id: "s1",
          name: "Screen 1",
          caption: "Banned words screen",
          width: 1080,
          height: 1920,
          background: { type: "solid", color: "#111827" },
          layers: [
            {
              id: "t1",
              type: "text",
              content: "#1 Best App in the World! 100% Free Download Now",
              fontSize: 64,
              color: "#ffffff",
              x: 50,
              y: 100,
              width: 900,
              height: 120,
              fontFamily: "Inter",
              fontWeight: 700,
              align: "center",
              lineHeight: 1.2,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
            } as TextLayer,
            {
              id: "sh1",
              type: "shape",
              shape: "rating-badge",
              x: 100,
              y: 300,
              width: 400,
              height: 80,
              fill: "#000000",
              rotation: 0,
              opacity: 1,
            } as ShapeLayer,
          ],
        },
      ],
    };

    const result = lintScreenSet(screenSet);
    expect(result.passed).toBe(false);
    expect(result.issueCounts.error).toBeGreaterThan(0);

    const rules = result.issues.map((i) => i.rule);
    expect(rules).toContain("google-play-policy");
  });

  it("should detect alpha transparency on Apple App Store screen sets", () => {
    const screenSet: ScreenSet = {
      id: "set_ios",
      name: "App Store Listing",
      store: "ios",
      preset: { name: 'iPhone 6.7"', width: 1290, height: 2796, store: "ios", description: "" },
      mockup: { device: "iphone-15-pro", color: "black", showFrame: true, showReflection: true, showShadow: true },
      screens: [
        {
          id: "s1",
          name: "Screen 1",
          caption: "Transparent screen",
          width: 1290,
          height: 2796,
          background: { type: "transparent" as any },
          layers: [
            {
              id: "t1",
              type: "text",
              content: "Awesome Features",
              fontSize: 80,
              color: "#ffffff",
              x: 100,
              y: 200,
              width: 1000,
              height: 160,
              fontFamily: "Inter",
              fontWeight: 800,
              align: "center",
              lineHeight: 1.2,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
            } as TextLayer,
          ],
        },
      ],
    };

    const result = lintScreenSet(screenSet);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.rule === "apple-no-alpha" && i.severity === "error")).toBe(true);
  });

  it("should pass clean compliant screen sets with a score of 100", () => {
    const screenSet: ScreenSet = {
      id: "set_clean",
      name: "Compliant Listing",
      store: "ios",
      preset: { name: 'iPhone 6.7"', width: 1290, height: 2796, store: "ios", description: "" },
      mockup: { device: "iphone-15-pro", color: "black", showFrame: true, showReflection: true, showShadow: true },
      screens: [
        {
          id: "s1",
          name: "Screen 1",
          caption: "Clean screen",
          width: 1290,
          height: 2796,
          background: { type: "solid", color: "#0f172a" },
          layers: [
            {
              id: "t1",
              type: "text",
              content: "Track Habits Seamlessly",
              fontSize: 88,
              color: "#ffffff",
              x: 100,
              y: 200,
              width: 1090,
              height: 160,
              fontFamily: "Inter",
              fontWeight: 800,
              align: "center",
              lineHeight: 1.2,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
            } as TextLayer,
            {
              id: "m1",
              type: "screenshot",
              src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
              x: 150,
              y: 500,
              width: 990,
              height: 2000,
              rotation: 0,
              opacity: 1,
              objectFit: "cover",
              cornerRadius: 44,
              showDeviceFrame: true,
            } as ScreenshotLayer,
          ],
        },
      ],
    };

    const result = lintScreenSet(screenSet);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issueCounts.error).toBe(0);
    expect(result.issueCounts.warning).toBe(0);
  });
});
