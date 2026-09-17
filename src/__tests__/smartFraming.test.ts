import { describe, it, expect } from "vitest";
import {
  analyzeFocalRegionFromRawData,
  analyzeFocalRegion,
  TARGET_ANALYSIS_WIDTH,
  TARGET_ANALYSIS_HEIGHT,
} from "@/lib/ai/smartFraming";

/**
 * Helper to generate RGBA test buffers
 */
function createMockBuffer(
  width: number,
  height: number,
  filler: (x: number, y: number) => [number, number, number, number]
): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = filler(x, y);
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }
  return buf;
}

describe("Smart Framing AI Saliency Detector", () => {
  const W = TARGET_ANALYSIS_WIDTH;
  const H = TARGET_ANALYSIS_HEIGHT;

  it("should return safe defaults on uniform/solid color image", () => {
    const uniform = createMockBuffer(W, H, () => [128, 128, 128, 255]);
    const result = analyzeFocalRegionFromRawData(uniform, W, H);

    expect(result.optimalYOffset).toBe(0.25);
    expect(result.headerClearanceNeeded).toBe(false);
    expect(result.bottomBarDetected).toBe(false);
    expect(result.confidenceScore).toBe(0.5);
  });

  it("should return safe defaults on empty or invalid buffer dimensions", () => {
    const emptyBuf = new Uint8ClampedArray(0);
    const result = analyzeFocalRegionFromRawData(emptyBuf, 0, 0);

    expect(result.optimalYOffset).toBe(0.25);
    expect(result.confidenceScore).toBe(0.5);
  });

  it("should detect top-heavy headers and adjust offset downwards for clearance", () => {
    // Sharp high-contrast horizontal bars only in the header zone (y < 25)
    const topHeavy = createMockBuffer(W, H, (x, y) => {
      if (y >= 5 && y <= 25) {
        // High frequency alternating stripes (simulating text, back buttons, titles)
        const stripe = (x % 4 === 0 || y % 3 === 0) ? 255 : 0;
        return [stripe, stripe, stripe, 255];
      }
      return [245, 245, 245, 255]; // Plain background elsewhere
    });

    const result = analyzeFocalRegionFromRawData(topHeavy, W, H);

    expect(result.headerClearanceNeeded).toBe(true);
    expect(result.bottomBarDetected).toBe(false);
    // When content is concentrated at top, optimalYOffset should provide extra clearance (> 0.25)
    expect(result.optimalYOffset).toBeGreaterThan(0.25);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.55);
  });

  it("should detect bottom navigation bars and pull offset upwards", () => {
    // Sharp high-contrast bar in the bottom 15% (y > 205)
    const bottomHeavy = createMockBuffer(W, H, (x, y) => {
      if (y >= 210 && y <= 235) {
        // High frequency icons / tabs
        const pattern = (x % 6 === 0 || y % 4 === 0) ? 255 : 20;
        return [pattern, pattern, pattern, 255];
      }
      return [240, 240, 240, 255];
    });

    const result = analyzeFocalRegionFromRawData(bottomHeavy, W, H);

    expect(result.bottomBarDetected).toBe(true);
    expect(result.headerClearanceNeeded).toBe(false);
    // When bottom bar is detected, frame should be pulled up (< 0.25) to avoid clipping
    expect(result.optimalYOffset).toBeLessThan(0.25);
  });

  it("should calculate balanced framing for full-screen content", () => {
    // Scattered UI elements across header, body cards, and tab bar
    const fullUI = createMockBuffer(W, H, (x, y) => {
      if (y >= 10 && y <= 25) return [(x % 5 === 0) ? 255 : 50, 50, 50, 255]; // Nav
      if (y >= 40 && y <= 160) return [(x % 8 === 0 || y % 8 === 0) ? 200 : 80, 100, 150, 255]; // Cards
      if (y >= 210 && y <= 235) return [(x % 5 === 0) ? 255 : 50, 50, 50, 255]; // Bottom bar
      return [255, 255, 255, 255];
    });

    const result = analyzeFocalRegion({
      width: W,
      height: H,
      data: fullUI,
    });

    expect(result.optimalYOffset).toBeGreaterThanOrEqual(0.15);
    expect(result.optimalYOffset).toBeLessThanOrEqual(0.35);
    expect(result.confidenceScore).toBeGreaterThan(0.6);
  });
});
