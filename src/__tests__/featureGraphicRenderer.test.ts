import { describe, it, expect } from "vitest";
import {
  FEATURE_GRAPHIC_FORMATS,
  FEATURE_GRAPHIC_PRESETS,
  FeatureGraphicConfig,
  renderFeatureGraphicToCanvas,
} from "@/lib/featureGraphicRenderer";

describe("Marketing Launch Pack & Feature Graphic Generator", () => {
  it("should have official dimensions for Product Hunt, Twitter, and Google Play", () => {
    expect(FEATURE_GRAPHIC_FORMATS["product-hunt"]).toBeDefined();
    expect(FEATURE_GRAPHIC_FORMATS["product-hunt"].width).toBe(1270);
    expect(FEATURE_GRAPHIC_FORMATS["product-hunt"].height).toBe(760);

    expect(FEATURE_GRAPHIC_FORMATS["twitter-landscape"]).toBeDefined();
    expect(FEATURE_GRAPHIC_FORMATS["twitter-landscape"].width).toBe(1200);
    expect(FEATURE_GRAPHIC_FORMATS["twitter-landscape"].height).toBe(675);

    expect(FEATURE_GRAPHIC_FORMATS["google-play"].width).toBe(1024);
    expect(FEATURE_GRAPHIC_FORMATS["google-play"].height).toBe(500);
  });

  it("should resize canvas to correct format dimensions on render", async () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        createLinearGradient: () => ({
          addColorStop: () => {},
        }),
        createRadialGradient: () => ({
          addColorStop: () => {},
        }),
        fillRect: () => {},
        fillText: () => {},
        measureText: () => ({ width: 100 }),
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        roundRect: () => {},
        clip: () => {},
        fill: () => {},
        stroke: () => {},
        translate: () => {},
        rotate: () => {},
        drawImage: () => {},
      }),
    } as unknown as HTMLCanvasElement;

    const config: FeatureGraphicConfig = {
      format: "product-hunt",
      layout: "triple-phone-perspective",
      appName: "SnapFrame Pro",
      tagline: "Benchmark Mobile Screenshot Studio",
      badgeText: "⭐️ 4.9 (50K+ Reviews)",
      category: "Design",
      showStoreBadges: true,
      bgGradient: FEATURE_GRAPHIC_PRESETS[0].bgGradient,
      ambientLighting: true,
      gridPattern: true,
      deviceTiltAngle: 8,
    };

    await renderFeatureGraphicToCanvas(canvas, config);
    expect(canvas.width).toBe(1270);
    expect(canvas.height).toBe(760);
  });
});
