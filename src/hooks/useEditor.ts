import { useEditorStore, selectActiveSet, selectActiveScreen, selectActiveLayer } from "@/lib/store/editorStore";
import { ScreenSet, Screen, Layer } from "@/lib/types";

/**
 * Returns the currently active ScreenSet (iOS, Android, etc.) with shallow memoization
 */
export function useActiveSet(): ScreenSet | undefined {
  return useEditorStore(selectActiveSet);
}

/**
 * Returns the currently active Screen within the active ScreenSet
 */
export function useActiveScreen(): Screen | undefined {
  return useEditorStore(selectActiveScreen);
}

/**
 * Returns the currently selected Layer on the active screen
 */
export function useActiveLayer(): Layer | undefined {
  return useEditorStore(selectActiveLayer);
}

/**
 * Returns undo/redo controls and availability states
 */
export function useEditorHistory() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    historyIndex,
    historyLength,
  };
}

/**
 * Returns zoom level and zoom manipulation actions
 */
export function useEditorZoom() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);

  return {
    zoom,
    setZoom,
    zoomIn: () => setZoom(Math.min(2.0, zoom + 0.1)),
    zoomOut: () => setZoom(Math.max(0.2, zoom - 0.1)),
    resetZoom: () => setZoom(0.65),
  };
}

/**
 * Returns theme state and theme application actions
 */
export function useEditorTheme() {
  const themeId = useEditorStore((s) => s.themeId);
  const setThemeId = useEditorStore((s) => s.setThemeId);
  const applyThemeToProject = useEditorStore((s) => s.applyThemeToProject);
  const applyCustomThemeToProject = useEditorStore((s) => s.applyCustomThemeToProject);

  return {
    themeId,
    setThemeId,
    applyThemeToProject,
    applyCustomThemeToProject,
  };
}
