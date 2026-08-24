import { create } from "zustand";
import {
  EditorStore,
  createSelectionSlice,
  createUiSlice,
  createHistorySlice,
  createContentSlice,
} from "./slices";
import { Screen, ScreenSet, Layer } from "@/lib/types";

export type { EditorStore } from "./slices";

export const useEditorStore = create<EditorStore>()((...a) => ({
  ...createSelectionSlice(...a),
  ...createUiSlice(...a),
  ...createHistorySlice(...a),
  ...createContentSlice(...a),
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
