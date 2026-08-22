"use client";

import { useRef, useState, memo } from "react";
import {
  Plus, ChevronDown, Smartphone, Square, Circle,
  Sun, Moon, Link2, Upload, EyeOff, Eye, CopyCheck,
} from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";
import { ScreenSet, ScreenshotLayer } from "@/lib/types";
import { ScreenCard } from "@/components/editor/ScreenCard";
import { IOS_DEVICES, ANDROID_DEVICES, COLOR_HEX_MAP, isTabletDevice } from "@/lib/devices";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppleStoreIcon, GooglePlayIcon, APP_STORE_LABEL, GOOGLE_PLAY_LABEL } from "@/components/icons/StoreIcons";

export type FullBorderStyle =
  | "3D Realistic"
  | "Titanium Precision"
  | "Clay Matte"
  | "Liquid Glass"
  | "Neon Glow"
  | "Minimal Wireframe"
  | "Flat Frame"
  | "Minimal"
  | "Borderless";

export const FRAME_STYLES_LIST: { id: FullBorderStyle; label: string; desc: string }[] = [
  { id: "3D Realistic", label: "3D Realistic", desc: "Metallic bezel with buttons" },
  { id: "Titanium Precision", label: "Titanium Precision", desc: "Brushed metal & chamfers" },
  { id: "Clay Matte", label: "Clay Matte", desc: "Soft tactile 3D clay" },
  { id: "Liquid Glass", label: "Liquid Glass", desc: "Translucent frosted glass" },
  { id: "Neon Glow", label: "Neon Glow", desc: "Vibrant glowing outline" },
  { id: "Minimal Wireframe", label: "Minimal Wireframe", desc: "Clean 2px vector contour" },
  { id: "Flat Frame", label: "Flat Frame", desc: "Solid 2D border rim" },
  { id: "Minimal", label: "Minimal (Squircle)", desc: "Rounded screenshot, no frame" },
  { id: "Borderless", label: "Borderless", desc: "Raw screenshot, crisp edges" },
];

interface ScreenSetRowProps {
  screenSet: ScreenSet;
  isDragging?: boolean;
}

export const ScreenSetRow = memo(function ScreenSetRow({ screenSet, isDragging = false }: ScreenSetRowProps) {
  const {
    activeSetId, setActiveSet, setActiveScreen, addScreen, zoom,
    updateDevice, updateMockup, screenSets, updateLayer, 
    updateScreen,
  } = useEditorStore();

  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  const isActive = activeSetId === screenSet.id;
  const BASE_CARD_WIDTH = 300;
  const cardW = Math.round(BASE_CARD_WIDTH * zoom);
  const cardH = Math.round(cardW * (screenSet.preset.height / screenSet.preset.width));

  const devices = screenSet.store === "ios" ? IOS_DEVICES : ANDROID_DEVICES;
  const currentDevice = devices.find((d) => d.id === screenSet.deviceId) ?? devices[0];

  // Current color — derive from mockup.color string, matching device.colors
  const currentColorName = screenSet.mockup?.color ?? "Black";
  // Colors available for the selected device
  const availableColors = currentDevice?.colors ?? ["Black", "White"];
  // Hex approximations for swatch rendering
  const getHex = (name: string) => COLOR_HEX_MAP[name.toLowerCase()] ?? "#888";

  const isFrameOn = screenSet.mockup?.showFrame !== false;
  const isShadowOn = screenSet.mockup?.showShadow === true;
  const isSquircle = screenSet.mockup?.squircle === true;
  const isShowingScreenshots = screenSet.mockup?.showScreenshots !== false;

  const handleAddScreen = () => {
    if (screenSet.screens.length >= 10) return;
    setActiveSet(screenSet.id);
    addScreen(screenSet.id);
  };

  const borderStyle: FullBorderStyle = isFrameOn 
    ? (
        screenSet.mockup?.frameType === "titanium" ? "Titanium Precision" :
        screenSet.mockup?.frameType === "clay" ? "Clay Matte" :
        screenSet.mockup?.frameType === "glass" ? "Liquid Glass" :
        screenSet.mockup?.frameType === "neon" ? "Neon Glow" :
        screenSet.mockup?.frameType === "wireframe" ? "Minimal Wireframe" :
        screenSet.mockup?.frameType === "2d" ? "Flat Frame" :
        "3D Realistic"
      )
    : isSquircle ? "Minimal" : "Borderless";
    
  const setBorderStyle = (style: FullBorderStyle) => {
    if (style === "Borderless") updateMockup(screenSet.id, { showFrame: false, squircle: false });
    else if (style === "Minimal") updateMockup(screenSet.id, { showFrame: false, squircle: true });
    else if (style === "Flat Frame") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "2d" });
    else if (style === "3D Realistic") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "3d" });
    else if (style === "Titanium Precision") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "titanium" });
    else if (style === "Clay Matte") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "clay" });
    else if (style === "Liquid Glass") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "glass" });
    else if (style === "Neon Glow") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "neon" });
    else if (style === "Minimal Wireframe") updateMockup(screenSet.id, { showFrame: true, squircle: false, frameType: "wireframe" });
    useEditorStore.getState().recordHistory();
  };

  const isNotchOn = screenSet.mockup?.notch !== false;
  const isIslandOn = screenSet.mockup?.dynamicIsland !== false;
  const isReflectionOn = screenSet.mockup?.reflection === true;

  const toggleNotch = () => { updateMockup(screenSet.id, { notch: !isNotchOn }); useEditorStore.getState().recordHistory(); }
  const toggleIsland = () => { updateMockup(screenSet.id, { dynamicIsland: !isIslandOn }); useEditorStore.getState().recordHistory(); }
  const toggleReflection = () => { updateMockup(screenSet.id, { reflection: !isReflectionOn }); useEditorStore.getState().recordHistory(); }
  const toggleScreenshots = () => { updateMockup(screenSet.id, { showScreenshots: !isShowingScreenshots }); useEditorStore.getState().recordHistory(); }

  // Sync mockup settings to ALL sets
  const syncAll = () => {
    const currentMockup = screenSet.mockup || {};
    const firstBg = screenSet.screens[0]?.background;

    for (const ss of screenSets) {
      if (ss.id === screenSet.id) continue;
      
      // Sync Mockup Settings (except device model which is platform specific)
      updateMockup(ss.id, {
        showFrame: currentMockup.showFrame,
        showShadow: currentMockup.showShadow,
        shadowPreset: currentMockup.shadowPreset,
        shadowGlowColor: currentMockup.shadowGlowColor,
        cleanStatusBar: currentMockup.cleanStatusBar,
        statusBarTheme: currentMockup.statusBarTheme,
        color: currentMockup.color,
        frameType: currentMockup.frameType,
        squircle: currentMockup.squircle,
        notch: currentMockup.notch,
        dynamicIsland: currentMockup.dynamicIsland,
        reflection: currentMockup.reflection,
      });

      // Sync Backgrounds
      if (firstBg) {
        ss.screens.forEach(s => updateScreen(ss.id, s.id, { background: firstBg }));
      }
    }
    useEditorStore.getState().recordHistory();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    const reordered = Array.from(screenSet.screens);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    useEditorStore.setState((state) => ({
      screenSets: state.screenSets.map((ss) =>
        ss.id === screenSet.id ? { ...ss, screens: reordered } : ss
      ),
    }));
    useEditorStore.getState().recordHistory();
  };

  const isIOS = screenSet.store === "ios";
  const storeLabel = isIOS ? APP_STORE_LABEL : GOOGLE_PLAY_LABEL;
  const storeColor = isIOS
    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40 font-semibold"
    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40 font-semibold";
  const storeColorInactive = "bg-secondary text-muted-foreground hover:text-foreground border border-border/50";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 rounded-2xl transition-all select-none",
        isDragging && "opacity-60 ring-2 ring-primary shadow-2xl bg-card"
      )}
    >
      {/* ── Device Controls Row ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Store badge & count */}
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs",
            isActive ? storeColor : storeColorInactive
          )}
          onClick={() => {
            setActiveSet(screenSet.id);
            if (screenSet.screens[0]) setActiveScreen(screenSet.screens[0].id);
          }}
          title={`${storeLabel} — ${screenSet.screens.length} of 10 screenshots`}
        >
          {isIOS ? (
            <AppleStoreIcon className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <GooglePlayIcon className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{storeLabel}</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold tracking-tight ml-0.5",
              screenSet.screens.length >= 10
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                : "bg-background/80 dark:bg-black/40 text-foreground border border-border/40"
            )}
          >
            {screenSet.screens.length}/10
          </span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-border/50 mx-0.5" />

        {/* Device model dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-[13px] text-foreground transition-colors outline-none max-w-56">
            <Smartphone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{currentDevice?.name ?? "Select device"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
            {/* Phones Group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                {screenSet.store === "ios" ? "iPhone Models" : "Android Phones"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {devices.filter((d) => !isTabletDevice(d)).map((device) => (
                <DropdownMenuItem
                  key={device.id}
                  className={cn(
                    "text-xs gap-2 cursor-pointer",
                    screenSet.deviceId === device.id && "text-primary bg-primary/5 font-semibold"
                  )}
                  onClick={() => {
                    updateDevice(screenSet.id, device.id);
                    if (screenSet.mockup?.color && !device.colors.includes(screenSet.mockup.color)) {
                      updateMockup(screenSet.id, { color: device.colors[0] });
                    }
                    useEditorStore.getState().recordHistory();
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{device.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{device.width} × {device.height} px</p>
                  </div>
                  {screenSet.deviceId === device.id && <span className="text-primary shrink-0">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            {/* Tablets Group */}
            {devices.some((d) => isTabletDevice(d)) && (
              <>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-indigo-400 uppercase font-bold tracking-wider">
                    {screenSet.store === "ios" ? "iPad Tablets" : "Android Tablets"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {devices.filter((d) => isTabletDevice(d)).map((device) => (
                    <DropdownMenuItem
                      key={device.id}
                      className={cn(
                        "text-xs gap-2 cursor-pointer",
                        screenSet.deviceId === device.id && "text-primary bg-primary/5 font-semibold"
                      )}
                      onClick={() => {
                        updateDevice(screenSet.id, device.id);
                        if (screenSet.mockup?.color && !device.colors.includes(screenSet.mockup.color)) {
                          updateMockup(screenSet.id, { color: device.colors[0] });
                        }
                        useEditorStore.getState().recordHistory();
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{device.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{device.width} × {device.height} px</p>
                      </div>
                      {screenSet.deviceId === device.id && <span className="text-primary shrink-0">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Border Style dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-[13px] text-foreground transition-colors outline-none">
            <Smartphone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>{borderStyle}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">Frame Style</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FRAME_STYLES_LIST.map((styleItem) => (
                <DropdownMenuItem
                  key={styleItem.id}
                  className={cn(
                    "text-xs cursor-pointer flex items-center justify-between py-1.5",
                    borderStyle === styleItem.id && "text-primary bg-primary/5 font-semibold"
                  )}
                  onClick={() => setBorderStyle(styleItem.id)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{styleItem.label}</span>
                    <span className="text-[10px] text-muted-foreground font-normal truncate">{styleItem.desc}</span>
                  </div>
                  {borderStyle === styleItem.id && <span className="text-primary shrink-0 ml-2">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Color picker dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-[13px] text-foreground transition-colors outline-none">
            <span
              className="w-4 h-4 rounded-full border border-border/60 shrink-0 shadow-inner"
              style={{ background: getHex(currentColorName) }}
            />
            <span className="max-w-16 truncate capitalize">{currentColorName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs">Device Color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableColors.map((colorName) => (
                <DropdownMenuItem
                  key={colorName}
                  className={cn("text-xs gap-2 cursor-pointer", currentColorName === colorName && "text-primary bg-primary/5")}
                  onClick={() => {
                    updateMockup(screenSet.id, { color: colorName });
                    useEditorStore.getState().recordHistory();
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-border/60 shrink-0"
                    style={{ background: getHex(colorName) }}
                  />
                  <span className="capitalize">{colorName}</span>
                  {currentColorName === colorName && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggles Group */}
        <div className="flex items-center gap-2 min-[1200px]:gap-3.5 ml-1 min-[1200px]:ml-2">
          {screenSet.store === "ios" && (
            <>
              {/* Notch toggle */}
              {currentDevice?.notchType === "notch" && (
                <label className="flex items-center gap-1.5 cursor-pointer" title="Show/Hide Notch">
                  <div className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="4" />
                      <path d="M8 2v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2" />
                    </svg>
                  </div>
                  <span className="show-from-1200 text-xs font-medium text-muted-foreground mr-0.5">Notch</span>
                  <Switch checked={isNotchOn} onCheckedChange={toggleNotch} />
                </label>
              )}

              {/* Dynamic Island toggle */}
              {currentDevice?.notchType === "island" && (
                <label className="flex items-center gap-1.5 cursor-pointer" title="Show/Hide Dynamic Island">
                  <div className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="4" />
                      <rect x="9" y="5" width="6" height="2.5" rx="1.25" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <span className="show-from-1200 text-xs font-medium text-muted-foreground mr-0.5">Island</span>
                  <Switch checked={isIslandOn} onCheckedChange={toggleIsland} />
                </label>
              )}
            </>
          )}

          {screenSet.store === "android" && (
            <label className="flex items-center gap-1.5 cursor-pointer" title="Show/Hide Camera Hole">
              <div className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="4" />
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="show-from-1200 text-xs font-medium text-muted-foreground mr-0.5">Camera</span>
              <Switch checked={isNotchOn} onCheckedChange={toggleNotch} />
            </label>
          )}

          {/* Reflection toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer" title="Show/Hide Screen Reflection">
            <div className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="4" />
                <path d="M6 10l8-8" opacity="0.5" />
                <path d="M4 14l12-12" opacity="0.5" />
              </svg>
            </div>
            <span className="show-from-1200 text-xs font-medium text-muted-foreground mr-0.5">Reflection</span>
            <Switch checked={isReflectionOn} onCheckedChange={toggleReflection} />
          </label>

          {/* Show/Hide Screenshots toggle with Switch */}
          <label className="flex items-center gap-1.5 cursor-pointer" title="Toggle Screenshots Visibility">
            <div className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0">
              {isShowingScreenshots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </div>
            <span className="show-from-1200 text-xs font-medium text-muted-foreground mr-0.5">Screenshots</span>
            <Switch checked={isShowingScreenshots} onCheckedChange={toggleScreenshots} />
          </label>
        </div>

        {/* Sync to all sets */}
        {screenSets.length > 1 && (
          <>
            <button
              type="button"
              title="Apply all style and background settings to other platforms"
              onClick={() => setShowSyncConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-1 cursor-pointer"
            >
              <CopyCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="show-under-1200">Sync</span>
              <span className="show-from-1200">Sync Styles to all Platforms</span>
            </button>

            {/* Sync Styles Confirmation Modal */}
            <Dialog open={showSyncConfirm} onOpenChange={setShowSyncConfirm}>
              <DialogContent className="max-w-md rounded-2xl p-6 shadow-2xl border border-border/80">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Sync Styles Across All Platforms?</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    This will copy the current background, frame styling, colors, and effects from <span className="font-bold text-foreground">{storeLabel}</span> and apply them to all other platform screen sets.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex items-center justify-end gap-2 mt-5">
                  <Button variant="outline" size="sm" onClick={() => setShowSyncConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      syncAll();
                      setShowSyncConfirm(false);
                      toast.success("Styles synchronized across all platforms!");
                    }}
                  >
                    Sync Styles
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}


      </div>

      {/* ── Cards Row ──────────────────────────────────────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={screenSet.id} direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 items-start overflow-x-auto pb-2 pl-1 pt-1"
            >
              {screenSet.screens.map((screen, idx) => (
                <ScreenCard
                  key={screen.id}
                  screen={screen}
                  screenSet={screenSet}
                  index={idx}
                  hideScreenshots={!isShowingScreenshots}
                />
              ))}
              {provided.placeholder}

              {/* Add screen button or Max reached card */}
              {screenSet.screens.length < 10 ? (
                <div className="shrink-0 flex flex-col gap-1.5">
                  {/* Spacer to match ScreenCard header height (h-5) */}
                  <div className="h-5 pointer-events-none" />
                  <button
                    id={`add-screen-row-${screenSet.id}`}
                    onClick={handleAddScreen}
                    type="button"
                    className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-400/60 dark:border-slate-600/80 hover:border-primary dark:hover:border-primary bg-card/40 dark:bg-slate-900/40 hover:bg-primary/5 dark:hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                    style={{ width: cardW, height: cardH }}
                    title={`Add new screen (${screenSet.screens.length}/10)`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-secondary border border-border/80 group-hover:border-primary/50 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-xs group-hover:scale-105">
                      <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Add Screen</span>
                      <span className="text-[10px] text-muted-foreground font-mono font-medium">{screenSet.screens.length}/10</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="shrink-0 flex flex-col gap-1.5 opacity-60">
                  <div className="h-5 pointer-events-none" />
                  <div
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 bg-secondary/15 text-muted-foreground select-none"
                    style={{ width: cardW, height: cardH }}
                    title="Maximum 10 screenshots reached (Store Limit)"
                  >
                    <span className="text-xs font-semibold text-muted-foreground/90">10/10 Reached</span>
                    <span className="text-[10px] text-muted-foreground/60">Max store limit</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});
