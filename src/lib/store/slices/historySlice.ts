import { StateCreator } from "zustand";
import { EditorStore, HistorySlice } from "./types";

const MAX_HISTORY = 50;
let historyDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const doRecordHistory = (get: () => EditorStore, set: (partial: Partial<EditorStore>) => void) => {
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

export const createHistorySlice: StateCreator<EditorStore, [], [], HistorySlice> = (set, get) => ({
  history: [],
  historyIndex: -1,

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
    set({
      screenSets: history[newIndex].screenSets,
      hiddenScreenSets: history[newIndex].hiddenScreenSets,
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      screenSets: history[newIndex].screenSets,
      hiddenScreenSets: history[newIndex].hiddenScreenSets,
      historyIndex: newIndex,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
});
