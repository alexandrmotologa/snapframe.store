"use client";

import { useState, memo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ALL_DEVICES, isTabletDevice, IOS_DEVICES, ANDROID_DEVICES } from "@/lib/devices";
import { AppleStoreIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import {
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck,
  Smartphone, Tablet, Info, ChevronDown, ChevronUp, Eye, Trash2, Plus, Sparkles, Lock, Unlock, Maximize2, Ratio, Sliders,
  Split, Share2
} from "lucide-react";
import { Screen, ScreenshotLayer, ImageLayer, ScreenSet } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FRAME_STYLES_LIST, FullBorderStyle } from "@/components/editor/ScreenSetRow";
import { StorePreviewModal } from "@/components/editor/StorePreviewModal";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils";

export const SHADOW_PRESETS_LIST = [
  { id: "soft-ambient", label: "Soft Ambient", desc: "Natural studio elevation" },
  { id: "floating-studio", label: "Floating Studio", desc: "Deep cinematic 3D drop shadow" },
  { id: "hard-isometric", label: "Hard Isometric", desc: "Crisp architectural CAD shadow" },
  { id: "neon-glow", label: "Neon Glow Halo", desc: "Vibrant luminescent light halo" },
  { id: "none", label: "None (Flat)", desc: "Zero shadow" },
];

export interface CanvasDimensionPreset {
  id: string;
  label: string;
  desc: string;
  width: number;
  height: number;
  category: "appstore" | "marketing" | "social";
  isPro?: boolean;
}

export const CANVAS_PRESETS: CanvasDimensionPreset[] = [
  // App Store Standards (Free)
  { id: "iphone-69", label: 'iPhone 6.9"', desc: "1320 × 2868 (iPhone 16/17 Pro Max)", width: 1320, height: 2868, category: "appstore" },
  { id: "iphone-65", label: 'iPhone 6.5"', desc: "1284 × 2778 (iPhone 14 Plus, 11 Pro Max)", width: 1284, height: 2778, category: "appstore" },
  { id: "iphone-55", label: 'iPhone 5.5"', desc: "1242 × 2208 (iPhone 8 Plus)", width: 1242, height: 2208, category: "appstore" },
  { id: "ipad-13", label: 'iPad Pro 13"', desc: "2048 × 2732 (M4 / 12.9\")", width: 2048, height: 2732, category: "appstore" },
  { id: "android-phone", label: "Android Phone", desc: "1080 × 2400 (Google Play 9:16)", width: 1080, height: 2400, category: "appstore" },
  { id: "android-tablet", label: "Android Tablet 10\"", desc: "1920 × 1200 (Google Play 16:10)", width: 1920, height: 1200, category: "appstore" },

  // Marketing & Social Media Presets (PRO)
  { id: "product-hunt", label: "Product Hunt Gallery", desc: "1270 × 760 (Optimal gallery ratio)", width: 1270, height: 760, category: "marketing", isPro: true },
  { id: "twitter-post", label: "Twitter / X Post", desc: "1200 × 675 (16:9 Landscape)", width: 1200, height: 675, category: "social", isPro: true },
  { id: "instagram-square", label: "Instagram Post (1:1)", desc: "1080 × 1080 (Square feed)", width: 1080, height: 1080, category: "social", isPro: true },
  { id: "instagram-portrait", label: "Instagram Portrait (4:5)", desc: "1080 × 1350 (Vertical post)", width: 1080, height: 1350, category: "social", isPro: true },
  { id: "story-tiktok", label: "Story / TikTok / Reels", desc: "1080 × 1920 (9:16 Vertical)", width: 1080, height: 1920, category: "social", isPro: true },
  { id: "linkedin-banner", label: "LinkedIn Post", desc: "1200 × 627 (1.91:1 Feed)", width: 1200, height: 627, category: "social", isPro: true },
  { id: "web-hero", label: "Web Hero (16:9 HD)", desc: "1920 × 1080 (Landing page hero)", width: 1920, height: 1080, category: "marketing", isPro: true },
  { id: "4k-ultra-wide", label: "4K Ultra-HD Banner", desc: "3840 × 2160 (Lossless 4K)", width: 3840, height: 2160, category: "marketing", isPro: true },
];

const PRO_FRAME_STYLES = new Set(["Clay Matte", "Liquid Glass", "Neon Glow", "Minimal Wireframe"]);
const PRO_SHADOW_PRESETS = new Set(["floating-studio", "hard-isometric", "neon-glow"]);

export const PlatformsPanel = memo(function PlatformsPanel() {
  const {
    screenSets,
    addScreenSet,
    addTabletSet,
    removeScreenSet,
    updateMockup,
    updateDevice,
    setCustomScreenDimensions,
    setMockupScale,
    generateDualThemeSet,
    generateABVariantSet,
    addCustomPresetSet,
  } = useEditorStore();

  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);
  const [showSimulator, setShowSimulator] = useState(false);
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});
  const [customSizes, setCustomSizes] = useState<Record<string, { width: number; height: number; lock: boolean }>>({});

  const toggleExpand = (id: string) => {
    setExpandedSets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper to count screens with actual screenshot media uploaded
  const countScreensWithMedia = (screens: Screen[]) => {
    return screens.filter((screen) => {
      return screen.layers.some((l) => {
        if (l.type === "screenshot") {
          const sl = l as ScreenshotLayer;
          return typeof sl.src === "string" && sl.src.trim().length > 0;
        }
        if (l.type === "image") {
          const il = l as ImageLayer;
          return typeof il.src === "string" && il.src.trim().length > 0;
        }
        return false;
      });
    }).length;
  };

  const getSetValidation = (ss: ScreenSet) => {
    const isIOS = ss.store === "ios";
    const isTablet = isTabletDevice(ss.deviceId);
    const screens = ss.screens;
    const count = screens.length;
    const uploadedCount = countScreensWithMedia(screens);
    const w = ss.preset?.width ?? (isIOS ? 1290 : 1080);
    const h = ss.preset?.height ?? (isIOS ? 2796 : 2400);

    const maxScreens = isIOS ? 10 : 8;
    const countValid = count >= 2 && count <= maxScreens;
    const countStatus =
      count < 2
        ? `Min 2 required by ${isIOS ? "Apple" : "Google"}`
        : count > maxScreens
        ? `Max ${maxScreens} allowed`
        : `${count} / ${maxScreens} screens (Valid)`;

    let resValid = false;
    let resLabel = `${w} × ${h} px`;

    if (isIOS) {
      if (isTablet) {
        resValid = (w === 2048 && h === 2732) || (w === 1668 && h === 2388) || (w === 1640 && h === 2360) || (w === 1488 && h === 2266);
        resLabel = `${w} × ${h} px (iPad Retina)`;
      } else {
        const is69 = w === 1320 && h === 2868;
        const is67 = w === 1290 && h === 2796;
        const is65 = w === 1242 && h === 2688;
        const is55 = w === 1242 && h === 2208;
        resValid = is69 || is67 || is65 || is55 || (h / w >= 1.7 && h / w <= 2.2);
        resLabel = is69 ? '6.9" Display (1320 × 2868)' : is67 ? '6.7" Display (1290 × 2796)' : `${w} × ${h} px`;
      }
    } else {
      const minSideValid = Math.min(w, h) >= 720 && Math.max(w, h) >= 1080;
      const ratio = h / w;
      resValid = minSideValid && (isTablet ? ratio >= 1.35 && ratio <= 1.85 : ratio >= 1.5 && ratio <= 2.3);
      resLabel = isTablet ? `${w} × ${h} px (Tablet 16:10 / 4:3)` : `${w} × ${h} px (9:16 Standard)`;
    }

    const allUploaded = uploadedCount === count && count > 0;
    const mediaStatus = allUploaded
      ? `All ${count} screenshots loaded`
      : `${uploadedCount} of ${count} screenshots loaded`;

    const isReady = countValid && resValid && allUploaded;

    return {
      isIOS,
      isTablet,
      count,
      uploadedCount,
      countValid,
      countStatus,
      resValid,
      resLabel,
      allUploaded,
      mediaStatus,
      isReady,
    };
  };

  const getFrameStyle = (ss: ScreenSet): FullBorderStyle => {
    const isFrameOn = ss.mockup?.showFrame !== false;
    const isSquircle = ss.mockup?.squircle === true;
    if (!isFrameOn) return isSquircle ? "Minimal" : "Borderless";
    const ft = ss.mockup?.frameType;
    if (ft === "titanium") return "Titanium Precision";
    if (ft === "clay") return "Clay Matte";
    if (ft === "glass") return "Liquid Glass";
    if (ft === "neon") return "Neon Glow";
    if (ft === "wireframe") return "Minimal Wireframe";
    if (ft === "2d") return "Flat Frame";
    return "3D Realistic";
  };

  const handleFrameStyleChange = (setId: string, style: FullBorderStyle) => {
    if (PRO_FRAME_STYLES.has(style) && !isPro) {
      toast.info(`${style} frame style requires SnapFrame Pro. Upgrade to unlock luxury mockup styles.`);
      setUpgradeModalOpen(true);
      return;
    }
    if (style === "Borderless") updateMockup(setId, { showFrame: false, squircle: false });
    else if (style === "Minimal") updateMockup(setId, { showFrame: false, squircle: true });
    else if (style === "Flat Frame") updateMockup(setId, { showFrame: true, squircle: false, frameType: "2d" });
    else if (style === "3D Realistic") updateMockup(setId, { showFrame: true, squircle: false, frameType: "3d" });
    else if (style === "Titanium Precision") updateMockup(setId, { showFrame: true, squircle: false, frameType: "titanium" });
    else if (style === "Clay Matte") updateMockup(setId, { showFrame: true, squircle: false, frameType: "clay" });
    else if (style === "Liquid Glass") updateMockup(setId, { showFrame: true, squircle: false, frameType: "glass" });
    else if (style === "Neon Glow") updateMockup(setId, { showFrame: true, squircle: false, frameType: "neon" });
    else if (style === "Minimal Wireframe") updateMockup(setId, { showFrame: true, squircle: false, frameType: "wireframe" });
    useEditorStore.getState().recordHistory();
  };

  const handleCustomWidthChange = (setId: string, val: number, currentW: number, currentH: number) => {
    const isLocked = customSizes[setId]?.lock ?? true;
    const ratio = currentH / (currentW || 1);
    const newW = val;
    const newH = isLocked ? Math.round(newW * ratio) : (customSizes[setId]?.height ?? currentH);
    setCustomSizes((prev) => ({
      ...prev,
      [setId]: { width: newW, height: newH, lock: isLocked },
    }));
  };

  const handleCustomHeightChange = (setId: string, val: number, currentW: number, currentH: number) => {
    const isLocked = customSizes[setId]?.lock ?? true;
    const ratio = currentW / (currentH || 1);
    const newH = val;
    const newW = isLocked ? Math.round(newH * ratio) : (customSizes[setId]?.width ?? currentW);
    setCustomSizes((prev) => ({
      ...prev,
      [setId]: { width: newW, height: newH, lock: isLocked },
    }));
  };

  const toggleRatioLock = (setId: string, currentW: number, currentH: number) => {
    const currentLock = customSizes[setId]?.lock ?? true;
    setCustomSizes((prev) => ({
      ...prev,
      [setId]: {
        width: prev[setId]?.width ?? currentW,
        height: prev[setId]?.height ?? currentH,
        lock: !currentLock,
      },
    }));
  };

  const handleApplyCustomDimensions = (setId: string, currentW: number, currentH: number) => {
    if (!isPro) {
      toast.info("Custom Canvas Dimensions (Freeform Width × Height) is a SnapFrame Pro feature. Upgrade to unlock custom canvas sizes!");
      setUpgradeModalOpen(true);
      return;
    }
    const targetW = customSizes[setId]?.width ?? currentW;
    const targetH = customSizes[setId]?.height ?? currentH;
    setCustomScreenDimensions(setId, targetW, targetH);
    toast.success(`✨ Applied custom canvas resolution: ${targetW} × ${targetH} px`);
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3.5 space-y-4">
          {/* Header Description & Simulator button */}
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Platforms & Store Readiness
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Manage target devices (Phones & Tablets), frame styles, and verify App Store & Google Play pre-submission guidelines in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isGuest) {
                  setAuthModalOpen(true);
                  toast.info("Live Store Listing Simulator requires a free account. Sign in with Google or GitHub (100% Free) to unlock.");
                  return;
                }
                setShowSimulator(true);
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer",
                isGuest
                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              )}
            >
              {isGuest ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Preview in Store Simulator (Sign in)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>Preview in Live Store Simulator</span>
                </>
              )}
            </button>
          </div>

          {/* ── DYNAMIC LIST OF ACTIVE SCREEN SETS ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Active Target Devices ({screenSets.length})</span>
              </span>
              {screenSets.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const allExpanded = screenSets.every((s) => expandedSets[s.id]);
                    const next: Record<string, boolean> = {};
                    screenSets.forEach((s) => { next[s.id] = !allExpanded; });
                    setExpandedSets(next);
                  }}
                  className="text-[10.5px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  {screenSets.every((s) => expandedSets[s.id]) ? "Collapse all" : "Expand all"}
                </button>
              )}
            </div>

            {screenSets.map((ss) => {
              const validation = getSetValidation(ss);
              const isIOS = ss.store === "ios";
              const isTablet = isTabletDevice(ss.deviceId || ss.mockup?.device);
              const availableDevices = isIOS ? IOS_DEVICES : ANDROID_DEVICES;
              const currentDeviceId = ss.deviceId || ss.mockup?.device || (isTablet ? (isIOS ? "ipad-pro-13" : "galaxy-tab-s9-ultra") : (isIOS ? "iphone-17-pro-max" : "pixel-10-pro-xl"));
              const deviceObj = ALL_DEVICES.find((d) => d.id === currentDeviceId) || availableDevices[0];

              const setPlatformName = isIOS
                ? isTablet ? "App Store (iPad)" : "App Store (iPhone)"
                : isTablet ? "Google Play (Tablet)" : "Google Play (Phone)";

              const activeFrameStyle = getFrameStyle(ss);
              const currentShadowPresetId = ss.mockup?.shadowPreset || (ss.mockup?.showShadow ? "soft-ambient" : "none");
              const currentShadow = SHADOW_PRESETS_LIST.find((s) => s.id === currentShadowPresetId) || SHADOW_PRESETS_LIST[0];

              const isExpanded = expandedSets[ss.id] ?? false;

              return (
                <div
                  key={ss.id}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden",
                    isExpanded
                      ? "border-primary/40 bg-card ring-1 ring-primary/20"
                      : "border-border/60 bg-card/60 dark:bg-secondary/30 hover:border-border/90 hover:bg-card/80"
                  )}
                >
                  {/* Platform Card Header (Click to Expand / Collapse) */}
                  <div
                    onClick={() => toggleExpand(ss.id)}
                    className={cn(
                      "px-3 py-2.5 flex items-center justify-between transition-colors cursor-pointer select-none gap-2",
                      isExpanded
                        ? "bg-secondary/70 dark:bg-secondary/50 border-b border-border/40"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center text-foreground shadow-xs border border-border/60 shrink-0">
                        {isIOS ? (
                          <AppleStoreIcon className="w-3.5 h-3.5" />
                        ) : (
                          <GooglePlayIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11.5px] font-bold text-foreground truncate">
                            {isIOS ? (isTablet ? "App Store (iPad)" : "App Store") : (isTablet ? "Google Play (Tab)" : "Google Play")}
                          </span>
                          {isTablet && (
                            <span className="text-[8.5px] font-bold px-1 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shrink-0">
                              Tablet
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {deviceObj?.name || ss.preset?.name}
                        </span>
                      </div>
                    </div>

                    {/* Set actions: Readiness Pill, Delete, Expand Chevron */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Compact status badge */}
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-all",
                          validation.isReady
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                        )}
                      >
                        {validation.isReady ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            <span>Ready</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span>{validation.mediaStatus.includes("loaded") ? `${validation.mediaStatus.split(" ")[0]}/${validation.mediaStatus.split(" ")[2]}` : "Review"}</span>
                          </>
                        )}
                      </span>

                      {screenSets.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeScreenSet(ss.id);
                            toast.info(`Removed ${setPlatformName}`);
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title={`Delete ${setPlatformName} set`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <div className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground">
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded && "rotate-180 text-primary")} />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Details Body */}
                  {isExpanded && (
                    <div className="p-3 space-y-2.5 bg-card/90 dark:bg-card/40 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Status Indicator Pill */}
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold border ${
                          validation.isReady
                            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {validation.isReady ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <span>
                            {validation.isReady
                              ? isIOS ? "Ready for App Store Connect" : "Ready for Play Console"
                              : "Requires Attention"}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-background/80 dark:bg-background/50 border border-current/20">
                          {isIOS ? (isTablet ? "iPadOS" : "iOS") : "Android"}
                        </span>
                      </div>

                      {/* Live Requirements Checklist */}
                      <div className="space-y-1.5 pt-0.5">
                        {/* Screen Count */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {validation.countValid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                            Screen Count (2–{isIOS ? 10 : 8})
                          </span>
                          <span
                            className={`font-medium ${
                              validation.countValid
                                ? "text-foreground"
                                : "text-rose-600 dark:text-rose-400 font-semibold"
                            }`}
                          >
                            {validation.countStatus}
                          </span>
                        </div>

                        {/* Resolution */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {validation.resValid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            )}
                            Resolution & Ratio
                          </span>
                          <span className="text-foreground font-medium text-[10.5px]">
                            {validation.resLabel}
                          </span>
                        </div>

                        {/* Screenshot Media Uploaded */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {validation.allUploaded ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            )}
                            Screenshots Uploaded
                          </span>
                          <span
                            className={`font-medium ${
                              validation.allUploaded
                                ? "text-foreground"
                                : "text-amber-600 dark:text-amber-400 font-semibold"
                            }`}
                          >
                            {validation.mediaStatus}
                          </span>
                        </div>

                        {/* Device Selector */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {isTablet ? <Tablet className="w-3 h-3 text-muted-foreground shrink-0" /> : <Smartphone className="w-3 h-3 text-muted-foreground shrink-0" />}
                            Device Model
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-colors outline-none cursor-pointer max-w-44">
                              <span className="truncate">{deviceObj?.name || "Select device"}</span>
                              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 max-h-72 overflow-y-auto">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  {isIOS ? "iPhone Models" : "Android Phones"}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableDevices.filter((d) => !isTabletDevice(d)).map((d) => (
                                  <DropdownMenuItem
                                    key={d.id}
                                    className={cn("text-xs cursor-pointer", currentDeviceId === d.id && "text-primary font-bold bg-primary/5")}
                                    onClick={() => {
                                      updateDevice(ss.id, d.id);
                                      if (ss.mockup?.color && !d.colors.includes(ss.mockup.color)) {
                                        updateMockup(ss.id, { color: d.colors[0] });
                                      }
                                      useEditorStore.getState().recordHistory();
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{d.name}</p>
                                      <p className="text-[10px] text-muted-foreground font-mono">{d.width} × {d.height}</p>
                                    </div>
                                    {currentDeviceId === d.id && <span className="text-primary ml-1">✓</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>

                              <DropdownMenuSeparator className="my-1.5" />
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                                  {isIOS ? "iPad Tablets" : "Android Tablets"}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableDevices.filter((d) => isTabletDevice(d)).map((d) => (
                                  <DropdownMenuItem
                                    key={d.id}
                                    className={cn("text-xs cursor-pointer", currentDeviceId === d.id && "text-primary font-bold bg-primary/5")}
                                    onClick={() => {
                                      updateDevice(ss.id, d.id);
                                      if (ss.mockup?.color && !d.colors.includes(ss.mockup.color)) {
                                        updateMockup(ss.id, { color: d.colors[0] });
                                      }
                                      useEditorStore.getState().recordHistory();
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{d.name}</p>
                                      <p className="text-[10px] text-muted-foreground font-mono">{d.width} × {d.height}</p>
                                    </div>
                                    {currentDeviceId === d.id && <span className="text-primary ml-1">✓</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Canvas Resolution & Preset Selector */}
                        <div className="flex items-center justify-between pt-1.5 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Ratio className="w-3 h-3 text-muted-foreground shrink-0" />
                            Canvas Resolution
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-colors outline-none cursor-pointer max-w-44">
                              <span className="truncate">{ss.preset?.name || `${ss.preset?.width} × ${ss.preset?.height}`}</span>
                              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  App Store Standards (Free)
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {CANVAS_PRESETS.filter((p) => p.category === "appstore").map((p) => (
                                  <DropdownMenuItem
                                    key={p.id}
                                    className={cn("text-xs cursor-pointer", ss.preset?.width === p.width && ss.preset?.height === p.height && "text-primary font-bold bg-primary/5")}
                                    onClick={() => {
                                      setCustomScreenDimensions(ss.id, p.width, p.height, p.label);
                                      toast.success(`Applied ${p.label} (${p.width} × ${p.height})`);
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{p.label}</p>
                                      <p className="text-[10px] text-muted-foreground font-mono">{p.width} × {p.height}</p>
                                    </div>
                                    {ss.preset?.width === p.width && ss.preset?.height === p.height && <span className="text-primary ml-1">✓</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>

                              <DropdownMenuSeparator className="my-1.5" />

                              <DropdownMenuGroup>
                                <div className="flex items-center justify-between px-2 py-1.5">
                                  <DropdownMenuLabel className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider p-0">
                                    Social &amp; Marketing Presets
                                  </DropdownMenuLabel>
                                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                                </div>
                                <DropdownMenuSeparator />
                                {CANVAS_PRESETS.filter((p) => p.category === "social" || p.category === "marketing").map((p) => (
                                  <DropdownMenuItem
                                    key={p.id}
                                    className={cn("text-xs cursor-pointer flex items-center justify-between", ss.preset?.width === p.width && ss.preset?.height === p.height && "text-primary font-bold bg-primary/5")}
                                    onClick={() => {
                                      if (!isPro) {
                                        toast.info(`${p.label} requires SnapFrame Pro. Upgrade to unlock social media presets & custom canvas sizing!`);
                                        setUpgradeModalOpen(true);
                                        return;
                                      }
                                      setCustomScreenDimensions(ss.id, p.width, p.height, p.label);
                                      toast.success(`Applied ${p.label} (${p.width} × ${p.height})`);
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="font-medium truncate">{p.label}</p>
                                        {!isPro && <span className="text-[8.5px] px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground font-mono">{p.width} × {p.height}</p>
                                    </div>
                                    {ss.preset?.width === p.width && ss.preset?.height === p.height && <span className="text-primary ml-1">✓</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Custom Freeform Width & Height Input Box (PRO) */}
                        <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50 space-y-2 mt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Maximize2 className="w-3 h-3 text-primary" />
                              <span>Custom Size (W × H)</span>
                            </span>
                            {!isPro && (
                              <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 items-center text-xs">
                            <div className="col-span-2 space-y-0.5">
                              <label className="text-[9.5px] text-muted-foreground font-mono">Width</label>
                              <input
                                type="number"
                                min={400}
                                max={6000}
                                value={customSizes[ss.id]?.width ?? ss.preset?.width ?? 1290}
                                onChange={(e) => handleCustomWidthChange(ss.id, parseInt(e.target.value) || 1290, ss.preset?.width || 1290, ss.preset?.height || 2796)}
                                className="w-full px-2 py-1 rounded-lg bg-background border border-border/60 text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="col-span-1 flex flex-col items-center justify-end pb-0.5">
                              <button
                                type="button"
                                onClick={() => toggleRatioLock(ss.id, ss.preset?.width || 1290, ss.preset?.height || 2796)}
                                className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center border transition-colors cursor-pointer",
                                  (customSizes[ss.id]?.lock ?? true) ? "bg-primary/10 border-primary text-primary" : "bg-background border-border/60 text-muted-foreground"
                                )}
                                title={(customSizes[ss.id]?.lock ?? true) ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                              >
                                {(customSizes[ss.id]?.lock ?? true) ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </button>
                            </div>
                            <div className="col-span-2 space-y-0.5">
                              <label className="text-[9.5px] text-muted-foreground font-mono">Height</label>
                              <input
                                type="number"
                                min={400}
                                max={6000}
                                value={customSizes[ss.id]?.height ?? ss.preset?.height ?? 2796}
                                onChange={(e) => handleCustomHeightChange(ss.id, parseInt(e.target.value) || 2796, ss.preset?.width || 1290, ss.preset?.height || 2796)}
                                className="w-full px-2 py-1 rounded-lg bg-background border border-border/60 text-foreground text-xs font-mono focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCustomDimensions(ss.id, ss.preset?.width || 1290, ss.preset?.height || 2796)}
                            className="w-full py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                          >
                            {!isPro && <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>}
                            <span>Apply Custom Dimensions</span>
                          </button>
                        </div>

                        {/* Frame Style Control */}
                        <div className="flex items-center justify-between pt-1.5 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Smartphone className="w-3 h-3 text-muted-foreground shrink-0" />
                            Frame Style
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-colors outline-none cursor-pointer">
                              <span className="max-w-28 truncate">{FRAME_STYLES_LIST.find((f) => f.id === activeFrameStyle)?.label || activeFrameStyle}</span>
                              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-bold">Frame Style</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {FRAME_STYLES_LIST.map((item) => (
                                  <DropdownMenuItem
                                    key={item.id}
                                    className="text-xs cursor-pointer flex items-center justify-between py-1.5"
                                    onClick={() => handleFrameStyleChange(ss.id, item.id)}
                                  >
                                    <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium truncate">{item.label}</span>
                                        {PRO_FRAME_STYLES.has(item.id) && !isPro && (
                                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">PRO</span>
                                        )}
                                      </div>
                                      <span className="text-[9.5px] text-muted-foreground font-normal truncate">{item.desc}</span>
                                    </div>
                                    {activeFrameStyle === item.id && <span className="text-primary text-xs font-bold ml-2">✓</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Mockup Frame Scaling Slider (PRO) */}
                        <div className="space-y-1 pt-1.5 border-t border-border/40">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Sliders className="w-3 h-3 text-muted-foreground shrink-0" />
                              Mockup Frame Scale
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-foreground font-mono font-medium text-[10.5px]">
                                {Math.round((ss.mockup?.scale || 1) * 100)}%
                              </span>
                              {!isPro && (
                                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                              )}
                            </div>
                          </div>
                          <div
                            className="relative"
                            onClick={() => {
                              if (!isPro) {
                                toast.info("Custom Mockup Scaling (50%–150%) is a SnapFrame Pro feature.");
                                setUpgradeModalOpen(true);
                              }
                            }}
                          >
                            <input
                              type="range"
                              min="0.5"
                              max="1.5"
                              step="0.05"
                              disabled={!isPro}
                              value={ss.mockup?.scale || 1}
                              onChange={(e) => {
                                if (!isPro) return;
                                const scaleVal = parseFloat(e.target.value);
                                setMockupScale(ss.id, scaleVal);
                              }}
                              className={cn(
                                "w-full h-1.5 rounded-lg appearance-none accent-primary transition-all",
                                isPro
                                  ? "bg-secondary cursor-pointer"
                                  : "bg-secondary/40 cursor-not-allowed opacity-60 pointer-events-none"
                              )}
                            />
                          </div>
                        </div>

                        {/* Device Shadow Dropdown */}
                        <div className="flex items-center justify-between pt-1.5 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 inline-block" />
                            Device Shadow
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 bg-secondary/60 hover:bg-secondary text-[11px] font-medium text-foreground transition-colors outline-none cursor-pointer">
                              <span className="max-w-28 truncate">{currentShadow.label}</span>
                              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-bold">Shadow Effect</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {SHADOW_PRESETS_LIST.map((item) => (
                                  <DropdownMenuItem
                                    key={item.id}
                                    className="text-xs cursor-pointer flex items-center justify-between py-1.5"
                                    onClick={() => {
                                      if (PRO_SHADOW_PRESETS.has(item.id) && !isPro) {
                                        toast.info(`${item.label} requires SnapFrame Pro. Upgrade to unlock deep studio shadows.`);
                                        setUpgradeModalOpen(true);
                                        return;
                                      }
                                      if (item.id === "none") {
                                        updateMockup(ss.id, { showShadow: false, shadowPreset: "none" });
                                      } else {
                                        updateMockup(ss.id, { showShadow: true, shadowPreset: item.id as any });
                                      }
                                      useEditorStore.getState().recordHistory();
                                    }}
                                  >
                                    <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium">{item.label}</span>
                                        {PRO_SHADOW_PRESETS.has(item.id) && !isPro && (
                                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">PRO</span>
                                        )}
                                      </div>
                                      <span className="text-[9.5px] text-muted-foreground">{item.desc}</span>
                                    </div>
                                    {currentShadowPresetId === item.id && (
                                      <span className="text-primary text-xs font-bold ml-2">✓</span>
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Clean Status Bar Toggle */}
                        <div className="flex items-center justify-between pt-1.5 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5" title="9:41 AM, 100% Battery & full signal overlay">
                            <span>🧼</span>
                            Clean Status Bar
                          </span>
                          <div className="flex items-center gap-2">
                            {ss.mockup?.cleanStatusBar && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentTheme = ss.mockup?.statusBarTheme || "dark";
                                  updateMockup(ss.id, { statusBarTheme: currentTheme === "dark" ? "light" : "dark" });
                                  useEditorStore.getState().recordHistory();
                                }}
                                className="text-[9.5px] px-1.5 py-0.5 rounded bg-secondary/80 hover:bg-secondary font-mono border border-border/50 text-foreground cursor-pointer"
                                title="Toggle status bar icon color (light/dark)"
                              >
                                {ss.mockup?.statusBarTheme === "light" ? "☀️ Light" : "🌙 Dark"}
                              </button>
                            )}
                            <Switch
                              checked={ss.mockup?.cleanStatusBar ?? false}
                              onCheckedChange={(checked) => {
                                updateMockup(ss.id, { cleanStatusBar: checked });
                                useEditorStore.getState().recordHistory();
                                toast.info(checked ? "Clean Status Bar enabled (9:41 AM · 100%)" : "Clean Status Bar disabled");
                              }}
                            />
                          </div>
                        </div>

                        {/* Store Guidelines Note */}
                        <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground pt-1 bg-sky-500/5 dark:bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                          <Info className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                          <span>
                            {isIOS
                              ? isTablet
                                ? "App Store requires dedicated iPad (12.9\" / 13\") screenshots for universal iOS apps."
                                : "App Store requires 72 DPI RGB images without transparency."
                              : isTablet
                              ? "Google Play requires 7\" & 10\" tablet screenshots for Featured tab eligibility."
                              : "Google Play recommends 16:9 or 9:16 aspect ratio with min. 1080px."}
                          </span>
                        </div>

                        {/* Dual Theme Set Generator Button */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span>Dual Theme Generator</span>
                            </span>
                            <p className="text-[9.5px] text-muted-foreground truncate">
                              Auto-clone as {(ss.name || "").toLowerCase().includes("dark") ? "Light Mode" : "Dark Mode"} set
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isPro) {
                                toast.info("Dual Theme Generation (Light & Dark matching sets) is a SnapFrame Pro feature.");
                                setUpgradeModalOpen(true);
                                return;
                              }
                              const isDark = (ss.name || "").toLowerCase().includes("dark");
                              const targetMode = isDark ? "light" : "dark";
                              generateDualThemeSet(ss.id, targetMode);
                              toast.success(`✨ Generated matching ${targetMode === "dark" ? "Dark" : "Light"} Mode dual screen set!`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-[11px] font-semibold border border-border/60 hover:border-primary/40 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                          >
                            {!isPro && (
                              <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                            )}
                            <span>{(ss.name || "").toLowerCase().includes("dark") ? "☀️ Create Light Set" : "🌙 Create Dark Set"}</span>
                          </button>
                        </div>

                        {/* A/B Testing Variant Generator */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                              <Split className="w-3 h-3 text-indigo-400" />
                              <span>A/B Testing Variant</span>
                            </span>
                            <p className="text-[9.5px] text-muted-foreground truncate">
                              Auto-clone with high-conversion visual variation
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-semibold border border-indigo-500/30 hover:border-indigo-500/50 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0">
                              {!isPro && (
                                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                              )}
                              <span>⚡ A/B Variant</span>
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-xl">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                                Choose A/B Strategy
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (!isPro) {
                                    toast.info("A/B Testing Variant Generator is a SnapFrame Pro feature.");
                                    setUpgradeModalOpen(true);
                                    return;
                                  }
                                  generateABVariantSet(ss.id, "high-contrast-dark");
                                  toast.success("✨ Generated High-Contrast Dark A/B Variant set!");
                                }}
                                className="text-xs cursor-pointer flex flex-col items-start gap-0.5 py-1.5 px-2 rounded-lg"
                              >
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>🌙 High-Contrast Dark</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">Deep obsidian background & glowing text</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  if (!isPro) {
                                    toast.info("A/B Testing Variant Generator is a SnapFrame Pro feature.");
                                    setUpgradeModalOpen(true);
                                    return;
                                  }
                                  generateABVariantSet(ss.id, "minimalist-clean");
                                  toast.success("✨ Generated Minimalist Clean A/B Variant set!");
                                }}
                                className="text-xs cursor-pointer flex flex-col items-start gap-0.5 py-1.5 px-2 rounded-lg"
                              >
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>☀️ Minimalist Clean Studio</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">Crisp neutral light background with stark typography</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  if (!isPro) {
                                    toast.info("A/B Testing Variant Generator is a SnapFrame Pro feature.");
                                    setUpgradeModalOpen(true);
                                    return;
                                  }
                                  generateABVariantSet(ss.id, "vibrant-glow");
                                  toast.success("✨ Generated Vibrant Glow A/B Variant set!");
                                }}
                                className="text-xs cursor-pointer flex flex-col items-start gap-0.5 py-1.5 px-2 rounded-lg"
                              >
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>🎨 Vibrant Gradient Glow</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">Eye-catching multi-tone saturated gradient</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  if (!isPro) {
                                    toast.info("A/B Testing Variant Generator is a SnapFrame Pro feature.");
                                    setUpgradeModalOpen(true);
                                    return;
                                  }
                                  generateABVariantSet(ss.id, "bold-conversion");
                                  toast.success("✨ Generated Bold Conversion A/B Variant set!");
                                }}
                                className="text-xs cursor-pointer flex flex-col items-start gap-0.5 py-1.5 px-2 rounded-lg"
                              >
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>🔥 Bold Conversion Focus</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">Maximum contrast with highlighted callouts</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Bottom Collapse Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(ss.id)}
                        className="w-full text-center pt-2 pb-0.5 text-[10.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors border-t border-border/40 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Hide device settings & guidelines</span>
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── ADD MORE SETS SECTION ── */}
          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Add Target Platform</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground/90 bg-secondary/80 px-2 py-0.5 rounded border border-border/40">
                4 Presets
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Add iPad Pro */}
              <button
                type="button"
                onClick={() => {
                  addTabletSet("ios");
                  toast.success("iPad Pro 13\" set added with proportional scaling!");
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-indigo-500/40 transition-all cursor-pointer group text-left shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-indigo-500/20">
                    <AppleStoreIcon className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      + iPad Pro 13&quot; (App Store)
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      2048 × 2732 px · 4:3 Tablet
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 ml-1.5">
                  <Plus className="w-3 h-3" />
                </div>
              </button>

              {/* Add Android Tablet */}
              <button
                type="button"
                onClick={() => {
                  addTabletSet("android");
                  toast.success("Android Tablet set added with proportional scaling!");
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-emerald-500/40 transition-all cursor-pointer group text-left shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/20">
                    <GooglePlayIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">
                      + Android Tab (Google Play)
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      1848 × 2960 px · 16:10 Tablet
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 ml-1.5">
                  <Plus className="w-3 h-3" />
                </div>
              </button>

              {/* Add iPhone Set */}
              <button
                type="button"
                onClick={() => {
                  addScreenSet("ios");
                  toast.success("iPhone 17 Pro Max set added with proportional scaling!");
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-blue-500/40 transition-all cursor-pointer group text-left shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-blue-500/20">
                    <AppleStoreIcon className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-blue-400 transition-colors truncate">
                      + iPhone Set (iOS)
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      1320 × 2868 px · 19.5:9 Phone
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0 ml-1.5">
                  <Plus className="w-3 h-3" />
                </div>
              </button>

              {/* Add Android Phone */}
              <button
                type="button"
                onClick={() => {
                  addScreenSet("android");
                  toast.success("Pixel 10 Pro XL set added with proportional scaling!");
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-teal-500/40 transition-all cursor-pointer group text-left shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-teal-500/20">
                    <GooglePlayIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground group-hover:text-teal-400 transition-colors truncate">
                      + Android Phone (Google Play)
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      1344 × 2992 px · 20:9 Phone
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-teal-500 group-hover:text-white transition-all shrink-0 ml-1.5">
                  <Plus className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>

          {/* ── SOCIAL MEDIA & LAUNCH PRESETS ── */}
          <div className="space-y-2.5 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span>Social &amp; Launch Presets</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                PRO SUITE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CANVAS_PRESETS.filter((p) => p.category === "marketing" || p.category === "social").map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (!isPro) {
                      toast.info("Social Media & Product Hunt presets are a SnapFrame Pro feature.");
                      setUpgradeModalOpen(true);
                      return;
                    }
                    addCustomPresetSet({
                      name: preset.label,
                      width: preset.width,
                      height: preset.height,
                      description: preset.desc,
                    });
                    toast.success(`✨ Added ${preset.label} (${preset.width} × ${preset.height}) set with proportional scaling!`);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/70 hover:border-primary/40 transition-all cursor-pointer group text-left shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {preset.label}
                      </p>
                      {!isPro && (
                        <span className="text-[8.5px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {preset.desc}
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 ml-1.5">
                    <Plus className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {showSimulator && (
        <StorePreviewModal open={showSimulator} onOpenChange={setShowSimulator} />
      )}
    </div>
  );
});
