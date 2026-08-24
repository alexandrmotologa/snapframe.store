import { Layer, Screen, ScreenSet, Background, MockupSettings, ThemeId, UploadedAsset } from "@/lib/types";
import { CanvasBackgroundId } from "@/lib/canvasBackgrounds";

export interface HistoryEntry {
  screenSets: ScreenSet[];
  hiddenScreenSets?: ScreenSet[];
}

export interface SelectionSlice {
  activeSetId: string | null;
  activeScreenId: string | null;
  activeLayerId: string | null;
  selectedLayerIds: string[];

  getActiveSet: () => ScreenSet | undefined;
  getActiveScreen: () => Screen | undefined;
  getActiveLayer: () => Layer | undefined;

  setActiveSet: (id: string) => void;
  setActiveScreen: (id: string) => void;
  setActiveLayer: (id: string | null) => void;
  toggleSelectLayer: (id: string) => void;
  clearSelection: () => void;
  clearAllSelection: () => void;
}

export interface UiSlice {
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  canvasBackground: CanvasBackgroundId;

  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setCanvasBackground: (bg: CanvasBackgroundId) => void;
}

export interface HistorySlice {
  history: HistoryEntry[];
  historyIndex: number;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  recordHistory: (immediate?: boolean) => void;
}

export interface ContentSlice {
  projectId: string | null;
  themeId: ThemeId;
  screenSets: ScreenSet[];
  hiddenScreenSets: ScreenSet[];
  projectAssets: UploadedAsset[];

  loadProject: (projectId: string, themeId: ThemeId | undefined, screenSets: ScreenSet[], hiddenScreenSets?: ScreenSet[]) => void;
  addProjectAsset: (asset: { name?: string; dataUrl: string; width?: number; height?: number }) => void;
  removeProjectAsset: (id: string) => void;
  clearProjectAssets: () => void;

  addScreen: (setId: string) => void;
  deleteScreen: (setId: string, screenId: string) => void;
  updateScreen: (setId: string, screenId: string, updates: Partial<Screen>) => void;
  reorderScreens: (setId: string, screenIds: string[]) => void;

  updateBackground: (setId: string, screenId: string, background: Background) => void;
  updateScreenBackground: (setId: string, screenId: string, background: Background) => void;
  updateAllScreensBackground: (setId: string, background: Background) => void;
  applyPanoramicBackground: (setId: string, imageUrl: string, naturalWidth: number, naturalHeight: number) => void;
  autoFillScreenshots: (setId: string, urls: string[]) => void;

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

  updateLayerLocalization: (setId: string, screenId: string, layerId: string, langCode: string, content: string) => void;
  clearLayerLocalization: (setId: string, screenId: string, layerId: string, langCode: string) => void;

  updateMockup: (setId: string, updates: Partial<MockupSettings>) => void;
  updateDevice: (setId: string, deviceId: string) => void;
  setCustomScreenDimensions: (setId: string, width: number, height: number, label?: string) => void;
  setMockupScale: (setId: string, scale: number) => void;
  setThemeId: (themeId: ThemeId) => void;
  applyThemeToProject: (themeOrPalette: ThemeId | { bg: string; fg: string; gradient?: Background["gradient"] }) => void;
  applyCustomThemeToProject: (palette: { bg: string; fg: string; gradient?: Background["gradient"] }) => void;

  applyTemplate: (setId: string | "all", template: any) => void;

  addScreenSet: (store: "ios" | "android") => void;
  addTabletSet: (store?: "ios" | "android") => void;
  removeScreenSet: (setId: string) => void;
  updateScreenSet: (setId: string, updates: Partial<ScreenSet>) => void;
}

export type EditorStore = SelectionSlice & UiSlice & HistorySlice & ContentSlice;
