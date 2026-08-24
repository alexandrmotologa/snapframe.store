import { StateCreator } from "zustand";
import { EditorStore, SelectionSlice } from "./types";

export const createSelectionSlice: StateCreator<EditorStore, [], [], SelectionSlice> = (set, get) => ({
  activeSetId: null,
  activeScreenId: null,
  activeLayerId: null,
  selectedLayerIds: [],

  getActiveSet: () => {
    const { screenSets, activeSetId } = get();
    return screenSets.find((s) => s.id === activeSetId) || screenSets[0];
  },

  getActiveScreen: () => {
    const { activeScreenId } = get();
    const currentSet = get().getActiveSet();
    return currentSet?.screens.find((s) => s.id === activeScreenId) || currentSet?.screens[0];
  },

  getActiveLayer: () => {
    const { activeLayerId } = get();
    const screen = get().getActiveScreen();
    return screen?.layers.find((l) => l.id === activeLayerId);
  },

  setActiveSet: (id) =>
    set((state) =>
      state.activeSetId === id
        ? { activeSetId: id }
        : { activeSetId: id, activeLayerId: null, selectedLayerIds: [] }
    ),

  setActiveScreen: (id) =>
    set((state) =>
      state.activeScreenId === id
        ? { activeScreenId: id }
        : { activeScreenId: id, activeLayerId: null, selectedLayerIds: [] }
    ),

  setActiveLayer: (id) =>
    set({
      activeLayerId: id,
      selectedLayerIds: id ? [id] : [],
    }),

  toggleSelectLayer: (id) => {
    const { selectedLayerIds, activeLayerId } = get();
    const already = selectedLayerIds.includes(id);
    const next = already
      ? selectedLayerIds.filter((x) => x !== id)
      : [...selectedLayerIds, id];
    set({
      selectedLayerIds: next,
      activeLayerId: next.length > 0 ? next[next.length - 1] : activeLayerId,
    });
  },

  clearSelection: () => set({ selectedLayerIds: [], activeLayerId: null }),
  clearAllSelection: () => set({ selectedLayerIds: [], activeLayerId: null, activeScreenId: null }),
});
