import { describe, it, expect, vi } from "vitest";
import {
  APP_STORE_TRANSLATIONS,
  GOOGLE_PLAY_TRANSLATIONS,
  drawAppleLogo,
  drawGooglePlayLogo,
  drawStoreBadge,
} from "@/lib/badges/storeBadges";
import { ShapeLayer } from "@/lib/types";

describe("Official Localized Store Badges", () => {
  it("should have comprehensive multi-language translations for App Store and Google Play", () => {
    const requiredLocales = ["en", "ro", "de", "fr", "es", "it", "ja", "zh", "ko"];
    for (const loc of requiredLocales) {
      expect(APP_STORE_TRANSLATIONS[loc]).toBeDefined();
      expect(APP_STORE_TRANSLATIONS[loc].subtext).toBeTruthy();
      expect(APP_STORE_TRANSLATIONS[loc].title).toBeTruthy();

      expect(GOOGLE_PLAY_TRANSLATIONS[loc]).toBeDefined();
      expect(GOOGLE_PLAY_TRANSLATIONS[loc].subtext).toBeTruthy();
      expect(GOOGLE_PLAY_TRANSLATIONS[loc].title).toBeTruthy();
    }

    // Verify Romanian translation
    expect(APP_STORE_TRANSLATIONS.ro.subtext).toBe("Descărcați de pe");
    expect(GOOGLE_PLAY_TRANSLATIONS.ro.subtext).toBe("ACUM PE");
  });

  it("should draw Apple logo vector paths onto canvas context", () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D;

    drawAppleLogo(mockCtx, 10, 10, 50, "#FFFFFF");

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.translate).toHaveBeenCalledWith(10, 10);
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it("should draw Google Play logo 4-color vectors onto canvas context", () => {
    const fills: string[] = [];
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      set fillStyle(val: string) {
        fills.push(val);
      },
    } as unknown as CanvasRenderingContext2D;

    drawGooglePlayLogo(mockCtx, 20, 20, 60);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.translate).toHaveBeenCalledWith(20, 20);
    expect(mockCtx.fill).toHaveBeenCalledTimes(4); // 4 colored triangles
    expect(fills).toContain("#00c3ff");
    expect(fills).toContain("#00e676");
    expect(fills).toContain("#ff334b");
    expect(fills).toContain("#ffc400");
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it("should render localized store badge text and box onto canvas", () => {
    const filledTexts: string[] = [];
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fillText: vi.fn((text: string) => {
        filledTexts.push(text);
      }),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "left",
      textBaseline: "middle",
    } as unknown as CanvasRenderingContext2D;

    const layer: ShapeLayer = {
      id: "badge_1",
      type: "shape",
      shape: "appstore-badge",
      x: 50,
      y: 100,
      width: 240,
      height: 70,
      fill: "#000000",
      rotation: 0,
      opacity: 1,
    };

    drawStoreBadge(mockCtx, layer, "ro");

    expect(mockCtx.roundRect).toHaveBeenCalledWith(50, 100, 240, 70, expect.any(Number));
    expect(filledTexts).toContain("Descărcați de pe");
    expect(filledTexts).toContain("App Store");
  });
});
