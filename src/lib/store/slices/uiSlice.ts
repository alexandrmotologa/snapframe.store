import { StateCreator } from "zustand";
import { EditorStore, UiSlice } from "./types";
import { getSavedCanvasBackground, saveCanvasBackground } from "@/lib/canvasBackgrounds";
import { DEFAULT_ZOOM } from "@/lib/constants";

export const createUiSlice: StateCreator<EditorStore, [], [], UiSlice> = (set) => ({
  zoom: DEFAULT_ZOOM,
  showGrid: false,

  showGuides: true,
  canvasBackground: getSavedCanvasBackground(),

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.1, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  setCanvasBackground: (bg) => {
    saveCanvasBackground(bg);
    set({ canvasBackground: bg });
  },
});
