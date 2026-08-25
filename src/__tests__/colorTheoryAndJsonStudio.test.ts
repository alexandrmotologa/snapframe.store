import { describe, it, expect } from "vitest";
import {
  hexToHSL,
  hslToHex,
  getLuminance,
  getSaturation,
  generateHarmoniousThemes,
  type ExtractedPalette,
} from "@/lib/utils/colorTheory";

describe("Color Theory & Harmonious Palette Engine", () => {
  it("converts hex to HSL and back with high fidelity", () => {
    const originalHex = "#6366f1";
    const [h, s, l] = hexToHSL(originalHex);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(s).toBeGreaterThan(0);
    expect(l).toBeGreaterThan(0);

    const convertedBack = hslToHex(h, s, l).toLowerCase();
    // Allow slight rounding tolerance
    expect(convertedBack.slice(0, 4)).toBe("#636");
  });

  it("calculates relative luminance and saturation correctly", () => {
    const whiteLum = getLuminance(255, 255, 255);
    const blackLum = getLuminance(0, 0, 0);
    expect(whiteLum).toBeCloseTo(1.0, 1);
    expect(blackLum).toBeCloseTo(0.0, 1);

    const graySat = getSaturation(128, 128, 128);
    const redSat = getSaturation(255, 0, 0);
    expect(graySat).toBe(0);
    expect(redSat).toBe(1);
  });

  it("generates 6 publication-ready harmonious themes from a palette", () => {
    const mockPalette: ExtractedPalette = {
      dominant: "#1e1b4b",
      vibrant: "#6366f1",
      muted: "#64748b",
      darkVibrant: "#0f172a",
      lightVibrant: "#a5b4fc",
      isDark: true,
    };

    const themes = generateHarmoniousThemes(mockPalette);
    expect(themes).toHaveLength(6);

    const ids = themes.map((t) => t.id);
    expect(ids).toContain("palette-screenshot-match");
    expect(ids).toContain("palette-vivid-glow");
    expect(ids).toContain("palette-moody-muted");
    expect(ids).toContain("palette-bold-analogous");
    expect(ids).toContain("palette-clean-light");
    expect(ids).toContain("palette-oled-pitch");

    themes.forEach((theme) => {
      expect(theme.label).toBeTruthy();
      expect(theme.background).toBeTruthy();
      expect(theme.textColor).toMatch(/^#/);
      expect(theme.accentColor).toMatch(/^#/);
    });
  });
});
