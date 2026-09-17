import { describe, it, expect } from "vitest";
import { Screen, ScreenSet, ScreenshotLayer, TextLayer } from "@/lib/types";

describe("Panoramic Seam Spanning", () => {
  const createMockScreenSet = (): { screen0: Screen; screen1: Screen; screenSet: ScreenSet } => {
    const screen0: Screen = {
      id: "scr_0",
      name: "Screen 1",
      caption: "Screen 1",
      width: 1290,
      height: 2796,
      background: { type: "solid", color: "#000000" },
      layers: [
        {
          id: "mockup_spanning",
          type: "screenshot",
          x: 800,
          y: 400,
          width: 1000,
          height: 2000,
          rotation: 0,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 44,
          showDeviceFrame: true,
          spanNextScreen: true,
        } as ScreenshotLayer,
        {
          id: "normal_text",
          type: "text",
          content: "Hello",
          x: 100,
          y: 100,
          width: 400,
          height: 100,
          fontSize: 60,
          fontFamily: "Inter",
          fontWeight: 700,
          color: "#ffffff",
          align: "center",
          lineHeight: 1.2,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
        } as TextLayer,
      ],
    };

    const screen1: Screen = {
      id: "scr_1",
      name: "Screen 2",
      caption: "Screen 2",
      width: 1290,
      height: 2796,
      background: { type: "solid", color: "#000000" },
      layers: [
        {
          id: "scr1_text",
          type: "text",
          content: "Second Screen Headline",
          x: 80,
          y: 150,
          width: 500,
          height: 120,
          fontSize: 60,
          fontFamily: "Inter",
          fontWeight: 700,
          color: "#ffffff",
          align: "center",
          lineHeight: 1.2,
          letterSpacing: 0,
          rotation: 0,
          opacity: 1,
        } as TextLayer,
      ],
    };

    const screenSet: ScreenSet = {
      id: "set_1",
      name: "Main Set",
      store: "ios",
      preset: { name: 'iPhone 6.7"', width: 1290, height: 2796, store: "ios", description: "" },
      mockup: { device: "iphone-15-pro", color: "black", showFrame: true, showReflection: true, showShadow: true },
      screens: [screen0, screen1],
    };

    return { screen0, screen1, screenSet };
  };

  it("should accurately compute projected layer coordinates on subsequent screen", () => {
    const { screen1, screenSet } = createMockScreenSet();
    const screenIndex = screenSet.screens.findIndex((s) => s.id === screen1.id);
    expect(screenIndex).toBe(1);

    const prevScreen = screenSet.screens[screenIndex - 1];
    expect(prevScreen).toBeDefined();

    const spanningLayers = prevScreen.layers
      .filter((l) => (l as any).spanNextScreen)
      .map((l) => ({
        ...l,
        id: `${l.id}_span`,
        x: l.x - prevScreen.width,
      }));

    expect(spanningLayers).toHaveLength(1);
    const projected = spanningLayers[0];
    expect(projected.id).toBe("mockup_spanning_span");
    // Original x: 800, width: 1290 -> 800 - 1290 = -490
    expect(projected.x).toBe(800 - 1290);
    expect(projected.width).toBe(1000);
    // On screen 1, the layer starts at -490 and extends to -490 + 1000 = +510px, perfectly continuing from screen 0
    expect(projected.x + projected.width).toBe(510);
  });

  it("should not project any layers when spanNextScreen is false or screen is index 0", () => {
    const { screen0, screenSet } = createMockScreenSet();
    const screenIndex = screenSet.screens.findIndex((s) => s.id === screen0.id);
    const prevScreen = screenIndex > 0 ? screenSet.screens[screenIndex - 1] : null;

    const spanningLayers = prevScreen
      ? prevScreen.layers.filter((l) => (l as any).spanNextScreen)
      : [];

    expect(spanningLayers).toHaveLength(0);
  });
});
