import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/lib/store/editorStore";
import { selectActiveSet, selectActiveScreen, selectActiveLayer } from "@/lib/store/editorStore";
import { ScreenSet } from "@/lib/types";

describe("Editor Store Selectors & Hooks Logic", () => {
  beforeEach(() => {
    const mockSet: ScreenSet = {
      id: "set-1",
      name: "iOS - iPhone 16 Pro Max",
      store: "ios",
      preset: {
        name: "iPhone 6.7\"",
        width: 1290,
        height: 2796,
        store: "ios",
        description: "App Store standard",
      },
      mockup: {
        device: "iphone-16-pro-max",
        color: "natural-titanium",
        showFrame: true,
        showReflection: true,
        showShadow: true,
      },
      screens: [
        {
          id: "screen-1",
          name: "Screen 1",
          width: 1290,
          height: 2796,
          background: { type: "solid", color: "#0f172a" },
          layers: [
            {
              id: "layer-text-1",
              type: "text",
              content: "Header text",
              x: 100,
              y: 150,
              width: 1090,
              height: 100,
              fontSize: 64,
              fontFamily: "Inter",
              fontWeight: 700,
              color: "#ffffff",
              align: "center",
              lineHeight: 1.2,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
            },
          ],
        },
      ],
    };

    useEditorStore.setState({
      screenSets: [mockSet],
      activeSetId: "set-1",
      activeScreenId: "screen-1",
      activeLayerId: "layer-text-1",
      zoom: 0.65,
      themeId: "default",
      history: [],
      historyIndex: -1,
    });
  });

  it("selectActiveSet returns the active screen set", () => {
    const state = useEditorStore.getState();
    const activeSet = selectActiveSet(state);
    expect(activeSet).toBeDefined();
    expect(activeSet?.id).toBe("set-1");
  });

  it("selectActiveScreen returns the active screen within active set", () => {
    const state = useEditorStore.getState();
    const activeScreen = selectActiveScreen(state);
    expect(activeScreen).toBeDefined();
    expect(activeScreen?.id).toBe("screen-1");
    expect(activeScreen?.name).toBe("Screen 1");
  });

  it("selectActiveLayer returns the active layer", () => {
    const state = useEditorStore.getState();
    const activeLayer = selectActiveLayer(state);
    expect(activeLayer).toBeDefined();
    expect(activeLayer?.id).toBe("layer-text-1");
    expect(activeLayer?.type).toBe("text");
  });

  it("returns fallback first set when activeSetId does not match", () => {
    useEditorStore.setState({ activeSetId: "non-existent-id" });
    const state = useEditorStore.getState();
    const activeSet = selectActiveSet(state);
    expect(activeSet?.id).toBe("set-1");
  });
});
