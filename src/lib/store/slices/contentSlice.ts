import { StateCreator } from "zustand";
import { EditorStore, ContentSlice } from "./types";
import { Layer, Screen, ScreenSet, MockupSettings, UploadedAsset, Template } from "@/lib/types";
import { themeById } from "@/lib/themes";
import { nanoid } from "@/lib/utils";
import { ALL_DEVICES, isTabletDevice } from "@/lib/devices";

export const createContentSlice: StateCreator<EditorStore, [], [], ContentSlice> = (set, get) => ({
  projectId: null,
  themeId: "clean-light",
  screenSets: [],
  hiddenScreenSets: [],
  projectAssets: [],

  addProjectAsset: (asset) => {
    const existing = get().projectAssets;
    if (existing.some((a) => a.dataUrl === asset.dataUrl)) {
      return;
    }
    const id = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newAsset: UploadedAsset = {
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

  loadProject: (projectId, themeId, screenSets, hiddenScreenSets = []) => {
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
      if (ss.screens.every((s) => s.width === STD_W && s.height === STD_H)) return baseSet;
      return {
        ...baseSet,
        preset: { ...baseSet.preset, width: STD_W, height: STD_H },
        screens: baseSet.screens.map((s) => {
          if (s.width === STD_W && s.height === STD_H) return s;
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
          newLayers = JSON.parse(
            JSON.stringify(lastScreen.layers)
          ).map((l: Layer) => ({ ...l, id: nanoid() }));
        } else {
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
    get().recordHistory();
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
    get().updateScreenBackground(setId, screenId, background);
  },

  updateScreenBackground: (setId, screenId, background) => {
    get().updateScreen(setId, screenId, { background });
  },

  updateAllScreensBackground: (setId, background) => {
    get().recordHistory(true);
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
    const newLayer = { ...layer, id: nanoid() } as Layer;
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) =>
                s.id !== screenId
                  ? s
                  : { ...s, layers: [...s.layers, newLayer] }
              ),
            }
      ),
      activeLayerId: newLayer.id,
    }));
    get().recordHistory(true);
  },

  addLayers: (setId, screenId, layers) => {
    const newLayers = layers.map((l) => ({ ...l, id: nanoid() })) as Layer[];
    set((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id !== setId
          ? ss
          : {
              ...ss,
              screens: ss.screens.map((s) =>
                s.id !== screenId
                  ? s
                  : { ...s, layers: [...s.layers, ...newLayers] }
              ),
            }
      ),
      activeLayerId: newLayers[newLayers.length - 1]?.id ?? state.activeLayerId,
    }));
    get().recordHistory(true);
  },

  updateLayer: (setId, screenId, layerId, updates) => {
    get().recordHistory();
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
    get().recordHistory(true);
  },

  deleteSelectedLayers: () => {
    const { activeSetId, activeScreenId, selectedLayerIds } = get();
    if (!activeSetId || !activeScreenId || selectedLayerIds.length === 0) return;
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
    get().recordHistory(true);
  },

  reorderLayers: (setId, screenId, layerIds) => {
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
    get().recordHistory(true);
  },

  duplicateLayer: (setId, screenId, layerId) => {
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
    get().recordHistory(true);
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
    get().recordHistory(true);
  },

  sendBackward: (setId, screenId, layerId) => {
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
    get().recordHistory(true);
  },

  syncTextToScreens: (setId, srcScreenId, layerIndex) => {
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
    get().recordHistory(true);
  },

  syncTypographyToAllScreens: (setId, sourceLayerId) => {
    get().recordHistory(true);
    set((state) => {
      const targetSet = state.screenSets.find((ss) => ss.id === setId);
      if (!targetSet) return state;

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

      const newScreens = clone(sourceSet.screens).map((scr: Screen) => {
        const newScreenId = nanoid();
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

        const newLayers = scr.layers.map((l: Layer) => {
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
        const updatedSet: ScreenSet = {
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

      const newScreenSet: ScreenSet = {
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
    get().recordHistory(true);
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

  applyThemeToProject: (themeOrPalette) => {
    const isCustom = typeof themeOrPalette === "object";
    const theme = isCustom ? null : themeById(themeOrPalette);
    const palette = isCustom ? themeOrPalette : theme ? { bg: theme.bg, fg: theme.fg, gradient: theme.gradient } : null;
    if (!palette) return;

    set((state) => ({
      themeId: isCustom ? "custom" : themeOrPalette,
      screenSets: state.screenSets.map((ss) => ({
        ...ss,
        screens: ss.screens.map((s) => ({
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
          layers: s.layers.map((l) => {
            if (l.type === "text") {
              return { ...l, color: palette.fg };
            }
            return l;
          }),
        })),
      })),
    }));
    get().recordHistory(true);
  },

  applyCustomThemeToProject: (palette) => {
    get().applyThemeToProject(palette);
  },

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
    if (screenSets.length <= 1) return;
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
});
