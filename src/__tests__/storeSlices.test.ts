import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/lib/store/editorStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { ScreenSet, Template, TextLayer } from "@/lib/types";

describe("Zustand Store Slices & Features", () => {
  const mockScreenSets: ScreenSet[] = [
    {
      id: "set-1",
      name: "iOS Set",
      store: "ios",
      deviceId: "iphone-16-pro",
      preset: {
        name: "iPhone 16 Pro",
        description: "6.9 inch display",
        width: 1290,
        height: 2796,
        store: "ios",
      },
      mockup: {
        device: "iphone-16-pro",
        color: "black",
        showFrame: true,
        showReflection: false,
        showShadow: false,
        frameType: "3d",
      },
      screens: [
        {
          id: "screen-1",
          name: "Screen 1",
          width: 1290,
          height: 2796,
          background: { type: "solid", color: "#111827" },
          layers: [
            {
              id: "layer-1",
              type: "text",
              content: "Welcome to App",
              x: 100,
              y: 200,
              width: 800,
              height: 120,
              rotation: 0,
              opacity: 1,
              fontFamily: "Inter",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: 0,
              color: "#FFFFFF",
              align: "center",
            },
            {
              id: "layer-2",
              type: "shape",
              shape: "arrow-right",
              x: 150,
              y: 400,
              width: 300,
              height: 150,
              rotation: 0,
              opacity: 1,
              fill: "#6366F1",
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    useEditorStore.getState().loadProject("test-proj", "clean-light", mockScreenSets);
  });

  describe("SelectionSlice", () => {
    it("should manage active set, screen, and layer selections", () => {
      const store = useEditorStore.getState();
      expect(store.activeSetId).toBe("set-1");
      expect(store.activeScreenId).toBe("screen-1");

      store.setActiveLayer("layer-1");
      expect(useEditorStore.getState().activeLayerId).toBe("layer-1");
      expect(useEditorStore.getState().selectedLayerIds).toEqual(["layer-1"]);

      store.toggleSelectLayer("layer-2");
      expect(useEditorStore.getState().selectedLayerIds).toEqual(["layer-1", "layer-2"]);
      expect(useEditorStore.getState().activeLayerId).toBe("layer-2");

      store.clearSelection();
      expect(useEditorStore.getState().activeLayerId).toBeNull();
      expect(useEditorStore.getState().selectedLayerIds).toEqual([]);
    });

    it("should retrieve active elements via slice helper getters", () => {
      const store = useEditorStore.getState();
      store.setActiveLayer("layer-1");

      expect(store.getActiveSet()?.id).toBe("set-1");
      expect(store.getActiveScreen()?.id).toBe("screen-1");
      expect(store.getActiveLayer()?.id).toBe("layer-1");
    });
  });

  describe("UiSlice", () => {
    it("should clamp zoom between 0.1 and 2.0", () => {
      const store = useEditorStore.getState();
      store.setZoom(0.85);
      expect(useEditorStore.getState().zoom).toBe(0.85);

      store.setZoom(5.0);
      expect(useEditorStore.getState().zoom).toBe(2.0);

      store.setZoom(0.01);
      expect(useEditorStore.getState().zoom).toBe(0.1);
    });

    it("should toggle grid and guides", () => {
      const store = useEditorStore.getState();
      expect(store.showGrid).toBe(false);
      store.toggleGrid();
      expect(useEditorStore.getState().showGrid).toBe(true);

      expect(store.showGuides).toBe(true);
      store.toggleGuides();
      expect(useEditorStore.getState().showGuides).toBe(false);
    });
  });

  describe("HistorySlice", () => {
    it("should record history and perform undo/redo correctly", () => {
      const store = useEditorStore.getState();
      expect(store.canUndo()).toBe(false);

      // Add a layer which triggers history recording after state mutation
      store.addLayer("set-1", "screen-1", {
        type: "text",
        content: "New Subtitle",
        x: 100,
        y: 600,
        width: 500,
        height: 80,
        rotation: 0,
        opacity: 1,
        fontFamily: "Inter",
        fontSize: 32,
        fontWeight: 400,
        color: "#E2E8F0",
        align: "center",
      });

      const updatedScreens = useEditorStore.getState().screenSets[0].screens[0];
      expect(updatedScreens.layers.length).toBe(3);
      expect(useEditorStore.getState().canUndo()).toBe(true);

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().screenSets[0].screens[0].layers.length).toBe(2);
      expect(useEditorStore.getState().canRedo()).toBe(true);

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().screenSets[0].screens[0].layers.length).toBe(3);
    });
  });

  describe("ContentSlice & Polymorphic Theme Unification", () => {
    it("should apply theme by ThemeId string", () => {
      const store = useEditorStore.getState();
      store.applyThemeToProject("midnight-navy");

      const current = useEditorStore.getState();
      expect(current.themeId).toBe("midnight-navy");
      expect(current.screenSets[0].screens[0].background.type).toBe("solid");
      const textLayer = current.screenSets[0].screens[0].layers[0] as TextLayer;
      expect(textLayer.color).toBe("#F8FAFC");
    });

    it("should apply custom theme palette object with gradient", () => {
      const store = useEditorStore.getState();
      store.applyThemeToProject({
        bg: "#ff0077",
        fg: "#ffff00",
        gradient: {
          direction: "to-r",
          stops: [
            { color: "#10b981", position: 0 },
            { color: "#06b6d4", position: 100 },
          ],
        },
      });

      const current = useEditorStore.getState();
      expect(current.themeId).toBe("custom");
      expect(current.screenSets[0].screens[0].background.type).toBe("gradient");
      const textLayer = current.screenSets[0].screens[0].layers[0] as TextLayer;
      expect(textLayer.color).toBe("#ffff00");
    });

    it("should duplicate and delete layers properly", () => {
      const store = useEditorStore.getState();
      store.duplicateLayer("set-1", "screen-1", "layer-1");

      const layers = useEditorStore.getState().screenSets[0].screens[0].layers;
      expect(layers.length).toBe(3);
      const dup = layers.find((l) => (l as TextLayer).content === "Welcome to App" && l.id !== "layer-1");
      expect(dup).toBeDefined();
      expect(dup?.x).toBe(110);

      store.deleteLayer("set-1", "screen-1", dup!.id);
      expect(useEditorStore.getState().screenSets[0].screens[0].layers.length).toBe(2);
    });

    it("should apply templates strictly typed", () => {
      const mockTemplate: Template = {
        id: "tpl-modern",
        name: "Modern Showcase",
        description: "Modern app showcase template",
        category: "app",
        tags: ["modern", "clean"],
        previewColor: "#0f172a",
        layout: "screenshot-bottom",
        screens: [
          {
            name: "Hero Screen",
            background: { type: "solid", color: "#0f172a" },
            layers: [
              {
                id: "t-layer-1",
                type: "text",
                content: "Discover Next Gen",
                x: 80,
                y: 150,
                width: 700,
                height: 100,
                rotation: 0,
                opacity: 1,
                fontFamily: "Inter",
                fontSize: 48,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: 0,
                color: "#38bdf8",
                align: "center",
              },
            ],
          },
        ],
      };

      const store = useEditorStore.getState();
      store.applyTemplate("set-1", mockTemplate);

      const currentSet = useEditorStore.getState().screenSets[0];
      expect(currentSet.screens.length).toBe(1);
      expect(currentSet.screens[0].name).toBe("Hero Screen");
      const textLayer = currentSet.screens[0].layers[0] as TextLayer;
      expect(textLayer.content).toBe("Discover Next Gen");
    });
  });

  describe("LanguageStore Persistence", () => {
    it("should switch language and update store", () => {
      const langStore = useLanguageStore.getState();
      expect(langStore.activeLang).toBeDefined();

      langStore.setActiveLang("ro");
      expect(useLanguageStore.getState().activeLang).toBe("ro");
    });
  });
});
