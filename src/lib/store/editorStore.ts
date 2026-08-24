import { create } from "zustand";
import { Layer, Screen, ScreenSet, Background, MockupSettings, ThemeId } from "@/lib/types";
import { themeById } from "@/lib/themes";
import { nanoid } from "@/lib/utils";
import { ALL_DEVICES, isTabletDevice } from "@/lib/devices";
import { CanvasBackgroundId, getSavedCanvasBackground, saveCanvasBackground } from "@/lib/canvasBackgrounds";

interface HistoryEntry {
  screenSets: ScreenSet[];
  hiddenScreenSets?: ScreenSet[];
}

interface EditorStore {
  // Current project context
  projectId: string | null;
  themeId: ThemeId;
  screenSets: ScreenSet[];
  hiddenScreenSets: ScreenSet[];

  // Active selection
  activeSetId: string | null;
  activeScreenId: string | null;
  activeLayerId: string | null;
  /** IDs of layers in multi-select (Shift+click) */
  selectedLayerIds: string[];

  // Uploaded project media assets
  projectAssets: import("@/lib/types").UploadedAsset[];
  addProjectAsset: (asset: { name?: string; dataUrl: string; width?: number; height?: number }) => void;
  removeProjectAsset: (id: string) => void;
  clearProjectAssets: () => void;

  // UI state
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  canvasBackground: CanvasBackgroundId;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;

  // Actions: project loading
  loadProject: (projectId: string, themeId: ThemeId | undefined, screenSets: ScreenSet[], hiddenScreenSets?: ScreenSet[]) => void;
  getActiveSet: () => ScreenSet | undefined;
  getActiveScreen: () => Screen | undefined;
  getActiveLayer: () => Layer | undefined;

  // Actions: selection
  setActiveSet: (id: string) => void;
  setActiveScreen: (id: string) => void;
  setActiveLayer: (id: string | null) => void;
  toggleSelectLayer: (id: string) => void;
  clearSelection: () => void;
  clearAllSelection: () => void;

  // Actions: screens
  addScreen: (setId: string) => void;
  deleteScreen: (setId: string, screenId: string) => void;
  updateScreen: (setId: string, screenId: string, updates: Partial<Screen>) => void;
  reorderScreens: (setId: string, screenIds: string[]) => void;

  // Actions: background
  updateBackground: (setId: string, screenId: string, background: Background) => void;
  updateScreenBackground: (setId: string, screenId: string, background: Background) => void;
  updateAllScreensBackground: (setId: string, background: Background) => void;
  applyPanoramicBackground: (setId: string, imageUrl: string, naturalWidth: number, naturalHeight: number) => void;
  autoFillScreenshots: (setId: string, urls: string[]) => void;

  // Actions: layers
  addLayer: (setId: string, screenId: string, layer: any) => void;
  addLayers: (setId: string, screenId: string, layers: any[]) => void;
  updateLayer: (setId: string, screenId: string, layerId: string, updates: Partial<Layer>) => void;
  deleteLayer: (setId: string, screenId: string, layerId: string) => void;
  deleteSelectedLayers: () => void;
  reorderLayers: (setId: string, screenId: string, layerIds: string[]) => void;
  duplicateLayer: (setId: string, screenId: string, layerId: string) => void;
  lockLayer: (setId: string, screenId: string, layerId: string, locked: boolean) => void;
  bringForward: (setId: string, screenId: string, layerId: string) => void;
  sendBackward: (setId: string, screenId: string, layerId: string) => void;
  syncTextToScreens: (setId: string, srcScreenId: string, layerIndex: number) => void;
  syncTypographyToAllScreens: (setId: string, sourceLayerId: string) => void;
  generateDualThemeSet: (sourceSetId: string, targetMode: "dark" | "light") => void;

  // Actions: i18n localizations
  updateLayerLocalization: (setId: string, screenId: string, layerId: string, langCode: string, content: string) => void;
  clearLayerLocalization: (setId: string, screenId: string, layerId: string, langCode: string) => void;

  // Actions: mockup & device
  updateMockup: (setId: string, updates: Partial<MockupSettings>) => void;
  updateDevice: (setId: string, deviceId: string) => void;
  setCustomScreenDimensions: (setId: string, width: number, height: number, label?: string) => void;
  setMockupScale: (setId: string, scale: number) => void;
  setThemeId: (themeId: ThemeId) => void;
  applyThemeToProject: (themeId: ThemeId) => void;
  applyCustomThemeToProject: (palette: { bg: string; fg: string; gradient?: Background["gradient"] }) => void;

  // Actions: UI
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setCanvasBackground: (bg: CanvasBackgroundId) => void;

  // Actions: history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  recordHistory: (immediate?: boolean) => void;

  // Actions: templates
  applyTemplate: (setId: string | "all", template: any) => void;

  // Actions: screen sets
  addScreenSet: (store: "ios" | "android") => void;
  addTabletSet: (store?: "ios" | "android") => void;
  removeScreenSet: (setId: string) => void;
  updateScreenSet: (setId: string, updates: Partial<ScreenSet>) => void;
}

const MAX_HISTORY = 50;
let historyDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const doRecordHistory = (get: any, set: any) => {
  const { screenSets, hiddenScreenSets, history, historyIndex } = get();
  const newHistory = history.slice(0, historyIndex + 1);

  const clone = typeof structuredClone === "function"
    ? structuredClone
    : (obj: any) => JSON.parse(JSON.stringify(obj));

  newHistory.push({
    screenSets: clone(screenSets),
    hiddenScreenSets: clone(hiddenScreenSets),
  });

  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  set({ history: newHistory, historyIndex: newHistory.length - 1 });
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  projectId: null,
  themeId: "clean-light",
  screenSets: [],
  hiddenScreenSets: [],
  activeSetId: null,
  activeScreenId: null,
  activeLayerId: null,
  selectedLayerIds: [],
  projectAssets: [],

  addProjectAsset: (asset) => {
    const existing = get().projectAssets;
    if (existing.some((a) => a.dataUrl === asset.dataUrl)) {
      return;
    }
    const id = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newAsset: import("@/lib/types").UploadedAsset = {
      id,
      name: asset.name || "Screenshot",
      dataUrl: asset.dataUrl,
      width: asset.width,
      height: asset.height,
    };
    set({ projectAssets: [newAsset, ...existing] });
  },

  removeProjectAsset: (id) => {
    set({ projectAssets: get().projectAssets.filter((a) => a.id !== id) });
  },

  clearProjectAssets: () => {
    set({ projectAssets: [] });
  },

  zoom: 0.65,
  showGrid: false,
  showGuides: true,
  canvasBackground: getSavedCanvasBackground(),
  history: [],
  historyIndex: -1,

  loadProject: (projectId, themeId, screenSets, hiddenScreenSets = []) => {
    // ── Auto-migrate screenSets to ensure valid deviceId and standard resolution ─
    const STD_W = 1290;
    const STD_H = 2796;
    const migratedSets = screenSets.map((ss) => {
      const isIOS = ss.store === "ios";
      const isTab = isTabletDevice(ss.deviceId || ss.mockup?.device);
      const defaultDev = isTab
        ? (isIOS ? "ipad-pro-13" : "samsung-tab-s10-ultra")
        : (isIOS ? "iphone-17-pro-max" : "pixel-10-pro-xl");
      const effectiveDeviceId = ss.deviceId || ss.mockup?.device || defaultDev;

      const baseSet = {
        ...ss,
        deviceId: effectiveDeviceId,
        mockup: {
          ...ss.mockup,
          device: effectiveDeviceId,
        },
      };

      if (ss.store !== "android") return baseSet;
      // Already correct — skip
      if (ss.screens.every((s) => s.width === STD_W && s.height === STD_H)) return baseSet;
      return {
        ...baseSet,
        preset: { ...baseSet.preset, width: STD_W, height: STD_H },
        screens: baseSet.screens.map((s) => {
          if (s.width === STD_W && s.height === STD_H) return s;
          // Scale layer positions proportionally
          const scaleX = STD_W / s.width;
          const scaleY = STD_H / s.height;
          return {
            ...s,
            width: STD_W,
            height: STD_H,
            layers: s.layers.map((l) => ({
              ...l,
              x: Math.round(l.x * scaleX),
              y: Math.round(l.y * scaleY),
              width: Math.round(l.width * scaleX),
              height: Math.round(l.height * scaleY),
            })),
          };
        }),
      };
    });

    const firstSet = migratedSets[0];
    const firstScreen = firstSet?.screens[0];
    set({
      projectId,
      themeId: themeId || "clean-light",
      screenSets: migratedSets,
      hiddenScreenSets: hiddenScreenSets || [],
      activeSetId: firstSet?.id ?? null,
      activeScreenId: firstScreen?.id ?? null,
      activeLayerId: null,
      history: [{ screenSets: migratedSets, hiddenScreenSets: hiddenScreenSets || [] }],
      historyIndex: 0,
    });
  },

  getActiveSet: () => {
    const { screenSets, activeSetId } = get();
    return screenSets.find((s) => s.id === activeSetId) || screenSets[0];
  },

  getActiveScreen: () => {
    const { activeScreenId } = get();
    const set = get().getActiveSet();
    return set?.screens.find((s) => s.id === activeScreenId) || set?.screens[0];
  },

  getActiveLayer: () => {
    const { activeLayerId } = get();
    const screen = get().getActiveScreen();
    return screen?.layers.find((l) => l.id === activeLayerId);
  },

  setActiveSet: (id) => set((state) => (state.activeSetId === id ? { activeSetId: id } : { activeSetId: id, activeLayerId: null, selectedLayerIds: [] })),
  setActiveScreen: (id) => set((state) => (state.activeScreenId === id ? { activeScreenId: id } : { activeScreenId: id, activeLayerId: null, selectedLayerIds: [] })),
  setActiveLayer: (id) => set({ activeLayerId: id, selectedLayerIds: id ? [id] : [] }),

  toggleSelectLayer: (id) => {
    const { selectedLayerIds, activeLayerId } = get();
    const already = selectedLayerIds.includes(id);
    const next = already
      ? selectedLayerIds.filter((x) => x !== id)
      : [...selectedLayerIds, id];
    set({
      selectedLayerIds: next,
      activeLayerId: next.length > 0 ? (next[next.length - 1]) : activeLayerId,
    });
  },

  clearSelection: () => set({ selectedLayerIds: [], activeLayerId: null }),
  clearAllSelection: () => set({ selectedLayerIds: [], activeLayerId: null, activeScreenId: null }),

  addScreen: (setId) => {
    const targetSet = get().screenSets.find((s) => s.id === setId);
    if (targetSet && targetSet.screens.length >= 10) {
      return;
    }
    get().recordHistory(true);
    set((state) => {
      const sets = state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const lastScreen = ss.screens[ss.screens.length - 1];
        let newLayers: Layer[] = [];
        if (lastScreen) {
          // Copy all layers to repeat texts, mockup positioning, icons etc.
          newLayers = JSON.parse(
            JSON.stringify(lastScreen.layers)
          ).map((l: Layer) => ({ ...l, id: nanoid() }));
        } else {
          // Default phone layer if no previous screen
          newLayers = [{
            id: nanoid(),
            type: "screenshot",
            x: 129, y: 699,
            width: 1032, height: 1957,
            rotation: 0, opacity: 1,
            objectFit: "cover", cornerRadius: 55,
            showDeviceFrame: true,
            label: "Drop your screenshot here",
          } as Layer];
        }

        const newScreen: Screen = {
          id: nanoid(),
          name: `Screen ${ss.screens.length + 1}`,
          width: ss.preset.width,
          height: ss.preset.height,
          background: lastScreen ? JSON.parse(JSON.stringify(lastScreen.background)) : { type: "solid", color: "#6366f1" },
          layers: newLayers,
        };
        return { ...ss, screens: [...ss.screens, newScreen] };
      });
      const newScreen = sets.find((s) => s.id === setId)?.screens.slice(-1)[0];
      return {
        screenSets: sets,
        activeScreenId: newScreen?.id ?? state.activeScreenId,
      };
    });
  },

  deleteScreen: (setId, screenId) => {
    get().recordHistory(true);
    set((state) => {
      const sets = state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const screens = ss.screens.filter((s) => s.id !== screenId);
        return { ...ss, screens };
      });
      const activeSet = sets.find((s) => s.id === setId);
      const newActiveScreen =
        activeSet?.screens.find((s) => s.id !== screenId) ??
        activeSet?.screens[0];
      return {
        screenSets: sets,
        activeScreenId:
          state.activeScreenId === screenId
            ? (newActiveScreen?.id ?? null)
            : state.activeScreenId,
      };
    });
  },

  updateScreen: (setId, screenId, updates) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) =>
                s.id !== screenId ? s : { ...s, ...updates }
              ),
            }
      ),
    }));
  },

  reorderScreens: (setId, screenIds) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const reordered = screenIds.map(
          (id) => ss.screens.find((s) => s.id === id)!
        );
        return { ...ss, screens: reordered };
      }),
    }));
  },

  updateBackground: (setId, screenId, background) => {
    get().updateScreen(setId, screenId, { background });
  },

  updateScreenBackground: (setId, screenId, background) => {
    get().updateScreen(setId, screenId, { background });
  },

  updateAllScreensBackground: (setId, background) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) => ({ ...s, background })),
            }
      ),
    }));
  },

  addLayer: (setId, screenId, layer) => {
    get().recordHistory(true);
    const newLayer = { ...layer, id: nanoid() } as Layer;
    set((state: any) => ({
      screenSets: state.screenSets.map((ss: any) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s: any) =>
                s.id !== screenId
                  ? s
                  : { ...s, layers: [...s.layers, newLayer] }
              ),
            }
      ),
      activeLayerId: newLayer.id,
    }));
  },

  addLayers: (setId, screenId, layers) => {
    get().recordHistory(true);
    const newLayers = layers.map((l) => ({ ...l, id: l.id || nanoid() })) as Layer[];
    set((state: any) => ({
      screenSets: state.screenSets.map((ss: any) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s: any) =>
                s.id !== screenId
                  ? s
                  : { ...s, layers: [...s.layers, ...newLayers] }
              ),
            }
      ),
      activeLayerId: newLayers[newLayers.length - 1]?.id ?? null,
    }));
  },

  updateLayer: (setId, screenId, layerId, updates) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) =>
                s.id !== screenId
                  ? s
                  : {
                      ...s,
                      layers: s.layers.map((l) =>
                        l.id !== layerId ? l : ({ ...l, ...updates } as Layer)
                      ),
                    }
              ),
            }
      ),
    }));
  },

  deleteLayer: (setId, screenId, layerId) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) =>
                s.id !== screenId
                  ? s
                  : { ...s, layers: s.layers.filter((l) => l.id !== layerId) }
              ),
            }
      ),
      activeLayerId:
        state.activeLayerId === layerId ? null : state.activeLayerId,
    }));
  },

  reorderLayers: (setId, screenId, layerIds) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) => {
                if (s.id !== screenId) return s;
                const reordered = layerIds.map(
                  (id) => s.layers.find((l) => l.id === id)!
                );
                return { ...s, layers: reordered };
              }),
            }
      ),
    }));
  },

  duplicateLayer: (setId, screenId, layerId) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        return {
          ...ss,
          screens: ss.screens.map((s: Screen) => {
            if (s.id !== screenId) return s;
            const layer = s.layers.find((l) => l.id === layerId);
            if (!layer) return s;
            const duplicate = { ...layer, id: nanoid(), x: layer.x + 10, y: layer.y + 10 } as Layer;
            const idx = s.layers.findIndex((l) => l.id === layerId);
            const newLayers = [...s.layers];
            newLayers.splice(idx + 1, 0, duplicate);
            return { ...s, layers: newLayers };
          }),
        };
      }),
    }));
  },

  deleteSelectedLayers: () => {
    const { activeSetId, activeScreenId, selectedLayerIds } = get();
    if (!activeSetId || !activeScreenId || selectedLayerIds.length === 0) return;
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== activeSetId ? ss : {
          ...ss,
          screens: ss.screens.map((s) =>
            s.id !== activeScreenId ? s : {
              ...s,
              layers: s.layers.filter((l) => !selectedLayerIds.includes(l.id)),
            }
          ),
        }
      ),
      activeLayerId: null,
      selectedLayerIds: [],
    }));
  },

  lockLayer: (setId, screenId, layerId, locked) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? ss : {
          ...ss,
          screens: ss.screens.map((s) =>
            s.id !== screenId ? s : {
              ...s,
              layers: s.layers.map((l) =>
                l.id !== layerId ? l : { ...l, locked }
              ),
            }
          ),
        }
      ),
    }));
    get().recordHistory();
  },

  bringForward: (setId, screenId, layerId) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? ss : {
          ...ss,
          screens: ss.screens.map((s) => {
            if (s.id !== screenId) return s;
            const idx = s.layers.findIndex((l) => l.id === layerId);
            if (idx === -1 || idx === s.layers.length - 1) return s;
            const next = [...s.layers];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return { ...s, layers: next };
          }),
        }
      ),
    }));
  },

  sendBackward: (setId, screenId, layerId) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? ss : {
          ...ss,
          screens: ss.screens.map((s) => {
            if (s.id !== screenId) return s;
            const idx = s.layers.findIndex((l) => l.id === layerId);
            if (idx <= 0) return s;
            const next = [...s.layers];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return { ...s, layers: next };
          }),
        }
      ),
    }));
  },

  syncTextToScreens: (setId, srcScreenId, layerIndex) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const srcScreen = ss.screens.find((s) => s.id === srcScreenId);
        if (!srcScreen) return ss;
        const srcLayer = srcScreen.layers[layerIndex];
        if (!srcLayer || srcLayer.type !== "text") return ss;
        return {
          ...ss,
          screens: ss.screens.map((s) => {
            if (s.id === srcScreenId) return s;
            return {
              ...s,
              layers: s.layers.map((l, i) =>
                i !== layerIndex ? l : { ...l, content: (srcLayer as import("@/lib/types").TextLayer).content }
              ),
            };
          }),
        };
      }),
    }));
  },

  syncTypographyToAllScreens: (setId, sourceLayerId) => {
    get().recordHistory(true);
    set((state) => {
      const targetSet = state.screenSets.find((ss) => ss.id === setId);
      if (!targetSet) return state;

      // Find the source screen and source text layer
      let srcLayer: import("@/lib/types").TextLayer | null = null;
      let srcLayerIndex = -1;

      for (const scr of targetSet.screens) {
        const idx = scr.layers.findIndex((l) => l.id === sourceLayerId && l.type === "text");
        if (idx !== -1) {
          srcLayer = scr.layers[idx] as import("@/lib/types").TextLayer;
          srcLayerIndex = idx;
          break;
        }
      }

      if (!srcLayer) return state;

      const typographyProps = {
        fontFamily: srcLayer.fontFamily,
        fontWeight: srcLayer.fontWeight,
        fontSize: srcLayer.fontSize,
        color: srcLayer.color,
        gradientColor: srcLayer.gradientColor,
        gradientPresetId: srcLayer.gradientPresetId,
        glow: srcLayer.glow,
        shadow: srcLayer.shadow,
        stroke: srcLayer.stroke,
        highlight: srcLayer.highlight,
        textCase: srcLayer.textCase,
        letterSpacing: srcLayer.letterSpacing,
        lineHeight: srcLayer.lineHeight,
        align: srcLayer.align,
      };

      return {
        screenSets: state.screenSets.map((ss) => {
          if (ss.id !== setId) return ss;
          return {
            ...ss,
            screens: ss.screens.map((scr) => ({
              ...scr,
              layers: scr.layers.map((layer, idx) => {
                if (layer.type !== "text") return layer;
                const isTarget = idx === srcLayerIndex || scr.layers.filter((l) => l.type === "text").length === 1;
                if (!isTarget) return layer;
                return {
                  ...layer,
                  ...typographyProps,
                };
              }),
            })),
          };
        }),
      };
    });
  },

  generateDualThemeSet: (sourceSetId, targetMode) => {
    get().recordHistory(true);
    set((state) => {
      const sourceSet = state.screenSets.find((ss) => ss.id === sourceSetId);
      if (!sourceSet) return state;

      const newSetId = nanoid();
      const isDark = targetMode === "dark";
      const cleanedName = (sourceSet.name || "Screen Set").replace(/\s*\((Dark|Light)\)/gi, "").trim();
      const newSetName = `${cleanedName} (${isDark ? "Dark" : "Light"})`;

      const clone = typeof structuredClone === "function"
        ? structuredClone
        : (obj: any) => JSON.parse(JSON.stringify(obj));

      const newScreens = clone(sourceSet.screens).map((scr: import("@/lib/types").Screen) => {
        const newScreenId = nanoid();
        // Invert / map background
        const newBg: import("@/lib/types").Background = isDark
          ? {
              type: "gradient",
              gradient: {
                direction: "to-b",
                stops: [
                  { color: "#0F172A", position: 0 },
                  { color: "#020617", position: 100 },
                ],
              },
            }
          : {
              type: "gradient",
              gradient: {
                direction: "to-b",
                stops: [
                  { color: "#F8FAFC", position: 0 },
                  { color: "#E2E8F0", position: 100 },
                ],
              },
            };

        // Invert text layers
        const newLayers = scr.layers.map((l: import("@/lib/types").Layer) => {
          const newLayerId = nanoid();
          if (l.type === "text") {
            const tl = l as import("@/lib/types").TextLayer;
            const newTextColor = isDark ? "#FFFFFF" : "#0F172A";
            return {
              ...tl,
              id: newLayerId,
              color: newTextColor,
              gradientPresetId: isDark && tl.gradientPresetId === "midnight-titanium" ? "silver-chrome" : tl.gradientPresetId,
            };
          }
          return {
            ...l,
            id: newLayerId,
          };
        });

        return {
          ...scr,
          id: newScreenId,
          background: newBg,
          layers: newLayers,
        };
      });

      const existingIndex = state.screenSets.findIndex(
        (ss) =>
          ss.id !== sourceSet.id &&
          ((ss.name || "").toLowerCase() === newSetName.toLowerCase() ||
            (ss.store === sourceSet.store && (ss.name || "").toLowerCase().includes(`(${isDark ? "dark" : "light"})`)))
      );

      if (existingIndex >= 0) {
        const existingSet = state.screenSets[existingIndex];
        const updatedSet: import("@/lib/types").ScreenSet = {
          ...existingSet,
          name: newSetName,
          screens: newScreens,
          mockup: {
            ...existingSet.mockup,
            color: isDark ? "black" : "silver",
          },
        };
        const updatedList = [...state.screenSets];
        updatedList[existingIndex] = updatedSet;

        return {
          screenSets: updatedList,
          activeSetId: existingSet.id,
          activeScreenId: newScreens[0]?.id ?? null,
        };
      }

      const newScreenSet: import("@/lib/types").ScreenSet = {
        ...clone(sourceSet),
        id: newSetId,
        name: newSetName,
        screens: newScreens,
        mockup: {
          ...sourceSet.mockup,
          color: isDark ? "black" : "silver",
        },
      };

      return {
        screenSets: [...state.screenSets, newScreenSet],
        activeSetId: newSetId,
        activeScreenId: newScreens[0]?.id ?? null,
      };
    });
  },

  updateLayerLocalization: (setId, screenId, layerId, langCode, content) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? ss : {
          ...ss,
          screens: ss.screens.map((s) => {
            if (s.id !== screenId) return s;
            const existing = s.localizations ?? {};
            const langMap = existing[langCode] ?? {};
            return {
              ...s,
              localizations: {
                ...existing,
                [langCode]: {
                  ...langMap,
                  [layerId]: { ...(langMap[layerId] ?? {}), content },
                },
              },
            };
          }),
        }
      ),
    }));
    get().recordHistory();
  },

  clearLayerLocalization: (setId, screenId, layerId, langCode) => {
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? ss : {
          ...ss,
          screens: ss.screens.map((s) => {
            if (s.id !== screenId) return s;
            const existing = s.localizations ?? {};
            const langMap = { ...(existing[langCode] ?? {}) };
            delete langMap[layerId];
            return {
              ...s,
              localizations: { ...existing, [langCode]: langMap },
            };
          }),
        }
      ),
    }));
    get().recordHistory();
  },

  updateMockup: (setId, updates) => {
    get().recordHistory(true);
    const DEFAULT_MOCKUP: MockupSettings = {
      device: "iphone-16-pro",
      color: "black",
      showFrame: true,
      showReflection: false,
      showShadow: false,
      frameType: "3d",
    };
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              mockup: { ...DEFAULT_MOCKUP, ...ss.mockup, ...updates },
            }
      ),
    }));
  },

  updateDevice: (setId, deviceId) => {
    get().recordHistory(true);
    const newDevice = ALL_DEVICES.find((d) => d.id === deviceId);

    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const oldW = ss.preset.width || 1290;
        const oldH = ss.preset.height || 2796;
        const newW = newDevice?.width || oldW;
        const newH = newDevice?.height || oldH;

        const needsScale = newDevice && (oldW !== newW || oldH !== newH);
        const scaleX = newW / oldW;
        const scaleY = newH / oldH;
        const scaleAvg = (scaleX + scaleY) / 2;

        const updatedScreens: Screen[] = ss.screens.map((screen) => {
          if (!needsScale) return screen;
          return {
            ...screen,
            width: newW,
            height: newH,
            layers: screen.layers.map((layer) => {
              const base = {
                ...layer,
                x: Math.round(layer.x * scaleX),
                y: Math.round(layer.y * scaleY),
                width: Math.round(layer.width * scaleX),
                height: Math.round(layer.height * scaleY),
              };
              if (layer.type === "text") {
                return { ...base, fontSize: Math.round((layer.fontSize || 56) * scaleAvg) } as Layer;
              }
              if (layer.type === "shape") {
                return {
                  ...base,
                  cornerRadius: layer.cornerRadius !== undefined ? Math.round(layer.cornerRadius * scaleAvg) : undefined,
                  strokeWidth: layer.strokeWidth !== undefined ? Math.round(layer.strokeWidth * scaleAvg) : undefined,
                } as Layer;
              }
              if (layer.type === "image") {
                return {
                  ...base,
                  cornerRadius: Math.round((layer.cornerRadius || 0) * scaleAvg),
                } as Layer;
              }
              return base as Layer;
            }),
          };
        });

        return {
          ...ss,
          deviceId,
          mockup: { ...ss.mockup, device: deviceId },
          preset: {
            ...ss.preset,
            width: newW,
            height: newH,
            name: newDevice ? newDevice.name : ss.preset.name,
          },
          screens: updatedScreens,
        };
      }),
    }));

    get().recordHistory();
  },

  setCustomScreenDimensions: (setId, width, height, label) => {
    const clampedW = Math.max(400, Math.min(6000, Math.round(width)));
    const clampedH = Math.max(400, Math.min(6000, Math.round(height)));

    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const oldW = ss.preset.width || 1290;
        const oldH = ss.preset.height || 2796;
        const newW = clampedW;
        const newH = clampedH;

        if (oldW === newW && oldH === newH) return ss;

        const scaleX = newW / oldW;
        const scaleY = newH / oldH;
        const scaleAvg = (scaleX + scaleY) / 2;

        const updatedScreens: Screen[] = ss.screens.map((screen) => {
          return {
            ...screen,
            width: newW,
            height: newH,
            layers: screen.layers.map((layer) => {
              const base = {
                ...layer,
                x: Math.round(layer.x * scaleX),
                y: Math.round(layer.y * scaleY),
                width: Math.round(layer.width * scaleX),
                height: Math.round(layer.height * scaleY),
              };
              if (layer.type === "text") {
                return { ...base, fontSize: Math.round((layer.fontSize || 56) * scaleAvg) } as Layer;
              }
              if (layer.type === "shape") {
                return {
                  ...base,
                  cornerRadius: layer.cornerRadius !== undefined ? Math.round(layer.cornerRadius * scaleAvg) : undefined,
                  strokeWidth: layer.strokeWidth !== undefined ? Math.round(layer.strokeWidth * scaleAvg) : undefined,
                } as Layer;
              }
              if (layer.type === "image") {
                return {
                  ...base,
                  cornerRadius: Math.round((layer.cornerRadius || 0) * scaleAvg),
                } as Layer;
              }
              return base as Layer;
            }),
          };
        });

        const customName = label || `Custom (${newW} × ${newH})`;

        return {
          ...ss,
          preset: {
            ...ss.preset,
            width: newW,
            height: newH,
            name: customName,
          },
          screens: updatedScreens,
        };
      }),
    }));
  },

  setMockupScale: (setId, scale) => {
    const clampedScale = Math.max(0.4, Math.min(2.0, Number(scale.toFixed(2))));
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const currentScale = ss.mockup?.scale || 1;
        if (currentScale === clampedScale) return ss;

        const ratio = clampedScale / currentScale;

        const updatedScreens = ss.screens.map((screen) => ({
          ...screen,
          layers: screen.layers.map((l) => {
            if (l.type === "screenshot") {
              const cx = l.x + l.width / 2;
              const cy = l.y + l.height / 2;
              const nw = Math.round(l.width * ratio);
              const nh = Math.round(l.height * ratio);
              return {
                ...l,
                width: nw,
                height: nh,
                x: Math.round(cx - nw / 2),
                y: Math.round(cy - nh / 2),
              };
            }
            return l;
          }),
        }));

        return {
          ...ss,
          mockup: {
            ...ss.mockup,
            scale: clampedScale,
          },
          screens: updatedScreens,
        };
      }),
    }));
  },

  setThemeId: (themeId) => set({ themeId }),

  applyThemeToProject: (themeId) => {
    get().recordHistory(true);
    const theme = themeById(themeId);
    set((state) => ({
      themeId,
      screenSets: state.screenSets.map(ss => ({
        ...ss,
        screens: ss.screens.map(s => ({
          ...s,
          background: theme.gradient
            ? {
                ...s.background,
                type: "gradient",
                gradient: theme.gradient,
              }
            : {
                ...s.background,
                type: "solid",
                color: theme.bg,
              },
          layers: s.layers.map(l => {
            if (l.type === "text") {
              return { ...l, color: theme.fg };
            }
            return l;
          }),
        }))
      }))
    }));
  },

  applyCustomThemeToProject: (palette) => {
    get().recordHistory(true);
    set((state) => ({
      themeId: "custom",
      screenSets: state.screenSets.map(ss => ({
        ...ss,
        screens: ss.screens.map(s => ({
          ...s,
          background: palette.gradient
            ? {
                ...s.background,
                type: "gradient",
                gradient: palette.gradient,
              }
            : {
                ...s.background,
                type: "solid",
                color: palette.bg,
              },
          layers: s.layers.map(l => {
            if (l.type === "text") {
              return { ...l, color: palette.fg };
            }
            return l;
          }),
        }))
      }))
    }));
  },

  // UI
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.1, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  setCanvasBackground: (bg) => {
    saveCanvasBackground(bg);
    set({ canvasBackground: bg });
  },

  recordHistory: (immediate: boolean = false) => {
    if (historyDebounceTimer) {
      clearTimeout(historyDebounceTimer);
      historyDebounceTimer = null;
    }
    if (immediate) {
      doRecordHistory(get, set);
    } else {
      historyDebounceTimer = setTimeout(() => {
        doRecordHistory(get, set);
        historyDebounceTimer = null;
      }, 300);
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ screenSets: history[newIndex].screenSets, hiddenScreenSets: history[newIndex].hiddenScreenSets, historyIndex: newIndex });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ screenSets: history[newIndex].screenSets, hiddenScreenSets: history[newIndex].hiddenScreenSets, historyIndex: newIndex });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  applyTemplate: (setId, template) => {
    get().recordHistory(true);
    const { screenSets, activeSetId } = get();
    const isAll = setId === "all" || !setId;

    const updatedSets = screenSets.map((ss) => {
      if (!isAll && ss.id !== setId) return ss;
      const existingSrcs = ss.screens.flatMap((s) =>
        s.layers.filter((l) => l.type === "screenshot" && (l as any).src).map((l) => (l as any).src)
      );
      let srcIndex = 0;

      const newScreens = template.screens.map((tScreen: any, idx: number) => ({
        id: nanoid(),
        name: tScreen.name ?? `Screen ${idx + 1}`,
        width: ss.preset.width,
        height: ss.preset.height,
        caption: "",
        background: tScreen.background ?? { type: "solid", color: "#1a1a2e" },
        layers: (tScreen.layers ?? []).map((l: any): Layer => {
          const id = nanoid();
          if (l.type === "screenshot") {
            const src = existingSrcs[srcIndex] || undefined;
            srcIndex++;
            return {
              ...l,
              id,
              src,
              focusOverlay: l.focusOverlay?.enabled ? l.focusOverlay : undefined,
            } as Layer;
          }
          return { ...l, id } as Layer;
        }),
      }));
      return {
        ...ss,
        mockup: { ...ss.mockup, showShadow: false },
        screens: newScreens,
      };
    });

    const activeSetAfter = updatedSets.find((s) => s.id === activeSetId) || updatedSets[0];
    const newActiveScreenId = activeSetAfter?.screens[0]?.id ?? null;

    set({
      screenSets: updatedSets,
      activeSetId: activeSetAfter?.id ?? null,
      activeScreenId: newActiveScreenId,
      activeLayerId: null,
      selectedLayerIds: [],
    });
    get().recordHistory();
  },

  applyPanoramicBackground: (setId, imageUrl, naturalWidth, naturalHeight) => {
    const { screenSets } = get();
    set({
      screenSets: screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        const count = ss.screens.length;
        if (count === 0) return ss;
        const sliceWidth = naturalWidth / count;
        const sliceHeight = naturalHeight;
        return {
          ...ss,
          screens: ss.screens.map((s, idx) => ({
            ...s,
            background: {
              type: "image",
              imageUrl,
              imageSlice: {
                x: Math.round(idx * sliceWidth),
                y: 0,
                width: Math.round(sliceWidth),
                height: Math.round(sliceHeight),
              },
            },
          })),
        };
      }),
    });
    get().recordHistory();
  },

  autoFillScreenshots: (setId, urls) => {
    if (!urls || urls.length === 0) return;
    const { screenSets } = get();
    set({
      screenSets: screenSets.map((ss) => {
        if (ss.id !== setId) return ss;
        let urlIndex = 0;
        return {
          ...ss,
          screens: ss.screens.map((s) => {
            const hasScreenshotLayer = s.layers.some((l) => l.type === "screenshot");
            if (!hasScreenshotLayer && urlIndex < urls.length) {
              const newLayer: import("@/lib/types").ScreenshotLayer = {
                id: nanoid(),
                type: "screenshot",
                src: urls[urlIndex++],
                x: Math.round(s.width * 0.1),
                y: Math.round(s.height * 0.2),
                width: Math.round(s.width * 0.8),
                height: Math.round(s.height * 0.7),
                rotation: 0,
                opacity: 1,
                objectFit: "cover",
                cornerRadius: 40,
                showDeviceFrame: true,
                shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
              };
              return { ...s, layers: [...s.layers, newLayer] };
            }
            return {
              ...s,
              layers: s.layers.map((l) => {
                if (l.type === "screenshot" && urlIndex < urls.length) {
                  const updated = { ...l, src: urls[urlIndex] } as import("@/lib/types").ScreenshotLayer;
                  urlIndex++;
                  return updated;
                }
                return l;
              }),
            };
          }),
        };
      }),
    });
    get().recordHistory();
  },

  addScreenSet: (store) => {
    get().recordHistory(true);
    const { screenSets, hiddenScreenSets } = get();
    const existingHidden = hiddenScreenSets.find((s) => s.store === store);

    if (existingHidden) {
      const newHidden = hiddenScreenSets.filter((s) => s.id !== existingHidden.id);
      set({
        screenSets: [...screenSets, existingHidden],
        hiddenScreenSets: newHidden,
        activeSetId: existingHidden.id,
        activeScreenId: existingHidden.screens[0]?.id ?? null,
      });
      get().recordHistory();
      return;
    }

    const isIOS = store === "ios";
    const newId = nanoid();
    const deviceId = isIOS ? "iphone-17-pro-max" : "pixel-10-pro-xl";
    const deviceObj = ALL_DEVICES.find((d) => d.id === deviceId);

    const sourceSet = screenSets.find((s) => s.id === get().activeSetId) || screenSets[0];
    const newW = deviceObj?.width || (isIOS ? 1320 : 1344);
    const newH = deviceObj?.height || (isIOS ? 2868 : 2992);

    const oldW = sourceSet?.preset.width || 1290;
    const oldH = sourceSet?.preset.height || 2796;
    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const scaleAvg = (scaleX + scaleY) / 2;

    const newScreens: Screen[] = (sourceSet ? sourceSet.screens : []).map((screen, idx) => ({
      ...screen,
      id: nanoid(),
      name: screen.name || `Screen ${idx + 1}`,
      width: newW,
      height: newH,
      layers: screen.layers.map((layer) => {
        const baseLayer = {
          ...layer,
          id: nanoid(),
          x: Math.round(layer.x * scaleX),
          y: Math.round(layer.y * scaleY),
          width: Math.round(layer.width * scaleX),
          height: Math.round(layer.height * scaleY),
        };
        if (layer.type === "text") {
          return { ...baseLayer, fontSize: Math.round((layer.fontSize || 56) * scaleAvg) } as Layer;
        }
        if (layer.type === "shape") {
          return {
            ...baseLayer,
            cornerRadius: layer.cornerRadius !== undefined ? Math.round(layer.cornerRadius * scaleAvg) : undefined,
            strokeWidth: layer.strokeWidth !== undefined ? Math.round(layer.strokeWidth * scaleAvg) : undefined,
          } as Layer;
        }
        if (layer.type === "image") {
          return {
            ...baseLayer,
            cornerRadius: Math.round((layer.cornerRadius || 0) * scaleAvg),
          } as Layer;
        }
        return baseLayer as Layer;
      }),
    }));

    const newSet: ScreenSet = {
      id: newId,
      name: isIOS ? "App Store (iPhone 17 Pro Max)" : "Google Play (Pixel 10 Pro XL)",
      store,
      deviceId,
      preset: {
        name: isIOS ? 'iPhone 17 Pro Max (6.9")' : 'Google Pixel 10 Pro XL',
        width: newW,
        height: newH,
        store: isIOS ? "ios" : "android",
        description: isIOS ? "App Store — iPhone 6.9\"" : "Google Play — standard portrait",
      },
      mockup: {
        device: deviceId,
        color: isIOS ? "black" : "obsidian",
        showFrame: sourceSet?.mockup?.showFrame ?? true,
        showReflection: sourceSet?.mockup?.showReflection ?? false,
        showShadow: sourceSet?.mockup?.showShadow ?? false,
        frameType: sourceSet?.mockup?.frameType ?? "3d",
      },
      screens: newScreens.length > 0 ? newScreens : [
        {
          id: nanoid(),
          name: "Screen 1",
          width: newW,
          height: newH,
          caption: "",
          background: { type: "gradient", gradient: { direction: "to-br", stops: [{ color: "#6366f1", position: 0 }, { color: "#8b5cf6", position: 100 }] } },
          layers: [
            {
              id: nanoid(),
              type: "screenshot",
              x: Math.round(newW * 0.08),
              y: Math.round(newH * 0.28),
              width: Math.round(newW * 0.84),
              height: Math.round(newH * 0.72),
              rotation: 0,
              opacity: 1,
              objectFit: "cover",
              cornerRadius: 55,
              showDeviceFrame: true,
              shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
              label: "Drop your screenshot here",
            } as Layer
          ],
        },
      ],
    };
    set({
      screenSets: [...screenSets, newSet],
      activeSetId: newId,
      activeScreenId: newSet.screens[0]?.id ?? null,
    });
    get().recordHistory();
  },

  addTabletSet: (store = "ios") => {
    get().recordHistory(true);
    const isIOS = store === "ios";
    const tabletDeviceId = isIOS ? "ipad-pro-13" : "samsung-tab-s10-ultra";
    const tabletDevice = ALL_DEVICES.find((d) => d.id === tabletDeviceId);

    const sourceSet = get().screenSets.find((s) => s.store === store) || get().screenSets[0];
    const newId = nanoid();
    const newW = tabletDevice?.width || (isIOS ? 2048 : 1848);
    const newH = tabletDevice?.height || (isIOS ? 2732 : 2960);

    const oldW = sourceSet?.preset.width || 1290;
    const oldH = sourceSet?.preset.height || 2796;
    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const scaleAvg = (scaleX + scaleY) / 2;

    const newScreens = (sourceSet ? sourceSet.screens : []).map((screen, idx) => ({
      ...screen,
      id: nanoid(),
      name: `iPad Screen ${idx + 1}`,
      width: newW,
      height: newH,
      layers: screen.layers.map((layer) => {
        const baseLayer = {
          ...layer,
          id: nanoid(),
          x: Math.round(layer.x * scaleX),
          y: Math.round(layer.y * scaleY),
          width: Math.round(layer.width * scaleX),
          height: Math.round(layer.height * scaleY),
        };
        if (layer.type === "text") {
          return { ...baseLayer, fontSize: Math.round((layer.fontSize || 56) * scaleAvg) } as Layer;
        }
        if (layer.type === "shape") {
          return {
            ...baseLayer,
            cornerRadius: layer.cornerRadius !== undefined ? Math.round(layer.cornerRadius * scaleAvg) : undefined,
            strokeWidth: layer.strokeWidth !== undefined ? Math.round(layer.strokeWidth * scaleAvg) : undefined,
          } as Layer;
        }
        if (layer.type === "image") {
          return {
            ...baseLayer,
            cornerRadius: Math.round((layer.cornerRadius || 0) * scaleAvg),
          } as Layer;
        }
        return baseLayer as Layer;
      }),
    }));

    const newSet: ScreenSet = {
      id: newId,
      name: isIOS ? "App Store (iPad Pro 13\")" : "Google Play (Tablet 10\")",
      store,
      deviceId: tabletDeviceId,
      preset: {
        name: isIOS ? "iPad Pro 13\" (M4)" : "Galaxy Tab S10 Ultra",
        width: newW,
        height: newH,
        store,
        description: isIOS ? "App Store — iPad Pro 12.9\"/13\"" : "Google Play — Tablet 10\"",
      },
      mockup: {
        device: tabletDeviceId,
        color: isIOS ? "Space Black" : "Moonstone Gray",
        showFrame: true,
        showReflection: true,
        showShadow: false,
        frameType: "3d",
      },
      screens: newScreens.length > 0 ? newScreens : [
        {
          id: nanoid(),
          name: "Screen 1",
          width: newW,
          height: newH,
          caption: "",
          background: { type: "gradient", gradient: { direction: "to-br", stops: [{ color: "#6366f1", position: 0 }, { color: "#8b5cf6", position: 100 }] } },
          layers: [
            {
              id: nanoid(),
              type: "screenshot",
              x: Math.round(newW * 0.1),
              y: Math.round(newH * 0.25),
              width: Math.round(newW * 0.8),
              height: Math.round(newH * 0.7),
              rotation: 0,
              opacity: 1,
              objectFit: "cover",
              cornerRadius: 40,
              showDeviceFrame: true,
              shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
              label: "Drop tablet screenshot here",
            } as Layer
          ]
        }
      ],
    };

    set((state) => ({
      screenSets: [...state.screenSets, newSet],
      activeSetId: newId,
      activeScreenId: newSet.screens[0]?.id ?? null,
    }));

    get().recordHistory();
  },

  removeScreenSet: (setId) => {
    get().recordHistory(true);
    const { screenSets, hiddenScreenSets, activeSetId } = get();
    if (screenSets.length <= 1) return; // keep at least one set
    const setToHide = screenSets.find((s) => s.id === setId);
    if (!setToHide) return;
    const newSets = screenSets.filter((ss) => ss.id !== setId);
    const newHidden = [...hiddenScreenSets.filter((s) => s.id !== setToHide.id), setToHide];
    const newActiveSet = activeSetId === setId ? newSets[0] : newSets.find((ss) => ss.id === activeSetId);
    set({
      screenSets: newSets,
      hiddenScreenSets: newHidden,
      activeSetId: newActiveSet?.id ?? null,
      activeScreenId: newActiveSet?.screens[0]?.id ?? null,
    });
  },

  updateScreenSet: (setId, updates) => {
    get().recordHistory(true);
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId ? { ...ss, ...updates } : ss
      ),
    }));
  },
}));

// ── Pure Standalone Selectors (for memoized & efficient React subscriptions) ──
export const selectActiveSet = (state: EditorStore): ScreenSet | undefined => {
  return state.screenSets.find((s) => s.id === state.activeSetId) || state.screenSets[0];
};

export const selectActiveScreen = (state: EditorStore): Screen | undefined => {
  const set = selectActiveSet(state);
  return set?.screens.find((s) => s.id === state.activeScreenId) || set?.screens[0];
};

export const selectActiveLayer = (state: EditorStore): Layer | undefined => {
  const screen = selectActiveScreen(state);
  return screen?.layers.find((l) => l.id === state.activeLayerId);
};
