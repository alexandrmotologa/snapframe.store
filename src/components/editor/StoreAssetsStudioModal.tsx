"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Download,
  Smartphone,
  Share2,
  Sliders,
  Check,
  FolderArchive,
  Palette,
  SunMedium,
  CircleDot,
  Type,
  Smile,
  Upload,
  Zap,
} from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { toast } from "@/lib/store/toastStore";
import {
  IconStyleConfig,
  ICON_GRADIENT_PRESETS,
  POPULAR_ICON_GLYPHS,
  renderIconToCanvas,
  exportXcodeAppIconSet,
  exportAndroidIconBundle,
  exportWebFaviconPack,
  downloadBlob,
} from "@/lib/iconGenerator";
import {
  FeatureGraphicConfig,
  FEATURE_GRAPHIC_PRESETS,
  renderFeatureGraphicToCanvas,
} from "@/lib/featureGraphicRenderer";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId?: string;
}

export function StoreAssetsStudioModal({ open, onClose, projectId }: Props) {
  const { screenSets } = useEditorStore();
  const { getProject, projects } = useProjectStore();

  const project = projectId ? getProject(projectId) : projects[0];
  const appName = project?.name || "My App";

  const [activeTab, setActiveTab] = useState<"icon" | "feature-graphic" | "social">("icon");
  const [isExporting, setIsExporting] = useState(false);

  // ── 1. App Icon State ───────────────────────────────────────────────────────
  const [iconMask, setIconMask] = useState<"squircle" | "circle" | "none" | "custom">("squircle");
  const [cornerRadius, setCornerRadius] = useState<number>(22.4); // 0 to 50%
  const [iconConfig, setIconConfig] = useState<IconStyleConfig>({
    type: "glyph",
    symbolName: "Sparkles",
    emoji: "🚀",
    customText: appName.slice(0, 2),
    iconColor: "#ffffff",
    iconSizeRatio: 0.52,
    iconOffsetY: 0,
    bgType: "gradient",
    bgGradient: ICON_GRADIENT_PRESETS[0],
    bgColor: "#4f46e5",
    gleamHighlight: true,
    innerShadow: true,
    ambientGlow: true,
    glowColor: "rgba(255, 255, 255, 0.4)",
    metallicRing: "none",
  });

  const iconCanvasRef = useRef<HTMLCanvasElement>(null);
  const iconUploadRef = useRef<HTMLInputElement>(null);

  // ── 2. Feature Graphic & Social State ───────────────────────────────────────
  // Find screenshots from current project
  const availableScreenshots: string[] = [];
  screenSets.forEach((set) => {
    set.screens.forEach((sc) => {
      const sl = sc.layers.find((l) => l.type === "screenshot" || l.type === "image");
      if (sl && "src" in sl && typeof sl.src === "string" && sl.src.length > 0) {
        availableScreenshots.push(sl.src);
      }
    });
  });

  const [featureConfig, setFeatureConfig] = useState<FeatureGraphicConfig>({
    format: "google-play",
    layout: "hero-right",
    appName: appName,
    tagline: "Design, organize, and elevate your daily mobile productivity.",
    badgeText: "⭐️ 4.9 Rating • Editor's Choice",
    category: "Productivity",
    showStoreBadges: true,
    screenshotSrc: availableScreenshots[0] || "",
    secondaryScreenshotSrc: availableScreenshots[1] || "",
    bgGradient: FEATURE_GRAPHIC_PRESETS[0].bgGradient,
    ambientLighting: true,
    gridPattern: true,
    deviceTiltAngle: 8,
  });

  const featureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Re-render Icon Canvas
  const updateIconCanvas = useCallback(async () => {
    if (!iconCanvasRef.current) return;
    await renderIconToCanvas(iconCanvasRef.current, iconConfig, 1024, {
      mask: iconMask,
      cornerRadiusRatio: cornerRadius / 100,
    });
  }, [iconConfig, iconMask, cornerRadius]);

  // Re-render Feature Graphic Canvas
  const updateFeatureCanvas = useCallback(async () => {
    if (!featureCanvasRef.current) return;
    
    // Generate icon dataURL for preview in feature graphic
    let generatedIconSrc = "";
    if (iconCanvasRef.current) {
      generatedIconSrc = iconCanvasRef.current.toDataURL("image/png");
    }

    await renderFeatureGraphicToCanvas(featureCanvasRef.current, {
      ...featureConfig,
      iconSrc: generatedIconSrc || featureConfig.iconSrc,
    });
  }, [featureConfig]);

  // Sync canvas on changes
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (activeTab === "icon") {
          updateIconCanvas();
        } else {
          updateFeatureCanvas();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, activeTab, updateIconCanvas, updateFeatureCanvas]);

  // Handle Custom Image Upload for Icon
  const handleUploadIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setIconConfig((prev) => ({
        ...prev,
        type: "image",
        imageSrc: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ── Export Handlers ────────────────────────────────────────────────────────
  const handleDownloadIconMaster = async (size: number, label: string) => {
    try {
      setIsExporting(true);
      const offscreen = document.createElement("canvas");
      await renderIconToCanvas(offscreen, iconConfig, size, { mask: "none" });
      offscreen.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${appName.toLowerCase().replace(/\s+/g, "-")}-icon-${size}x${size}.png`);
          toast.success(`Exported ${label} (${size}×${size} PNG)!`);
        }
        setIsExporting(false);
      }, "image/png");
    } catch {
      toast.error("Failed to export icon.");
      setIsExporting(false);
    }
  };

  const handleExportXcodeBundle = async () => {
    try {
      setIsExporting(true);
      await exportXcodeAppIconSet(iconConfig, appName);
      toast.success("✨ Exported full Xcode AppIcon.appiconset archive!");
    } catch {
      toast.error("Failed to package Xcode bundle.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAndroidBundle = async () => {
    try {
      setIsExporting(true);
      await exportAndroidIconBundle(iconConfig, appName);
      toast.success("✨ Exported full Android res/mipmap bundle!");
    } catch {
      toast.error("Failed to package Android bundle.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFaviconPack = async () => {
    try {
      setIsExporting(true);
      await exportWebFaviconPack(iconConfig, appName);
      toast.success("✨ Exported Web Favicon Package!");
    } catch {
      toast.error("Failed to package favicon bundle.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadFeatureGraphic = async (format: "png" | "jpeg") => {
    try {
      setIsExporting(true);
      const offscreen = document.createElement("canvas");
      let iconSrc = "";
      if (iconCanvasRef.current) {
        iconSrc = iconCanvasRef.current.toDataURL("image/png");
      }

      await renderFeatureGraphicToCanvas(offscreen, {
        ...featureConfig,
        iconSrc: iconSrc || featureConfig.iconSrc,
      });

      const mime = format === "png" ? "image/png" : "image/jpeg";
      const ext = format === "png" ? "png" : "jpg";

      offscreen.toBlob((blob) => {
        if (blob) {
          const dims = featureConfig.format === "google-play" ? "1024x500" : "1200x630";
          downloadBlob(blob, `${appName.toLowerCase().replace(/\s+/g, "-")}-feature-graphic-${dims}.${ext}`);
          toast.success(`Exported ${featureConfig.format === "google-play" ? "Google Play 1024×500" : "Social 1200×630"} Graphic!`);
        }
        setIsExporting(false);
      }, mime, 0.98);
    } catch {
      toast.error("Failed to export feature graphic.");
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 flex flex-col bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
        {/* Header with Navigation Tabs */}
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                Store Assets &amp; Icon Studio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Pro Suite
                </span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Generate official App Store &amp; Google Play icons, 1024×500 feature graphics, and launch assets.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/80 border border-border/70 shadow-inner self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("icon")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "icon"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>App Icon Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("feature-graphic");
                setFeatureConfig((p) => ({ ...p, format: "google-play" }));
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "feature-graphic"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Play 1024×500</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("social");
                setFeatureConfig((p) => ({ ...p, format: "social-og" }));
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "social"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social 1200×630</span>
            </button>
          </div>
        </DialogHeader>

        {/* Content Body: Left Preview, Right Controls */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT: Live Canvas Stage */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-center bg-secondary/30 border-r border-border/50 relative overflow-auto">
            {activeTab === "icon" ? (
              <div className="flex flex-col items-center gap-6">
                {/* Mask Frame Preset Bar */}
                <div className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-xl bg-card border border-border/80 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIconMask("squircle");
                      setCornerRadius(22.4);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      Math.abs(cornerRadius - 22.4) < 0.2
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🍏 iOS Squircle (22.4%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIconMask("circle");
                      setCornerRadius(50);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      cornerRadius >= 49.5
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🤖 Android Circle (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIconMask("none");
                      setCornerRadius(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      cornerRadius === 0
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📦 Flat Master (0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIconMask("custom");
                      setCornerRadius(18);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      Math.abs(cornerRadius - 18) < 0.2
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    💻 macOS (18%)
                  </button>
                </div>

                {/* Live Icon Canvas with Ambient Shadow */}
                <div className="relative group p-1 flex items-center justify-center">
                  <div
                    className="absolute -inset-3 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      borderRadius: `${cornerRadius}%`,
                    }}
                  />
                  <canvas
                    ref={iconCanvasRef}
                    className="relative w-64 h-64 sm:w-80 sm:h-80 shadow-2xl transition-transform"
                    style={{
                      borderRadius: `${cornerRadius}%`,
                    }}
                  />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    1024 × 1024 Master High-DPI Canvas
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Export ready for Apple App Store Connect, Google Play Console &amp; Xcode.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                {/* Feature Graphic Canvas */}
                <div className="relative group w-full max-w-xl">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 rounded-2xl blur-xl opacity-60" />
                  <canvas
                    ref={featureCanvasRef}
                    className="relative w-full aspect-[1024/500] shadow-2xl rounded-2xl border border-border/80 object-contain"
                  />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    {activeTab === "feature-graphic"
                      ? "Google Play Feature Graphic (1024 × 500 px)"
                      : "Social OpenGraph Launch Card (1200 × 630 px)"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    High-impact banner for store promotion, search ads, and Product Hunt launches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Customization Controls & Instant Exporters */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            {activeTab === "icon" ? (
              <div className="space-y-6">
                {/* Icon Mode Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Icon Element Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "glyph", label: "Vector", icon: Zap },
                      { id: "emoji", label: "Emoji", icon: Smile },
                      { id: "text", label: "Letters", icon: Type },
                      { id: "image", label: "Upload", icon: Upload },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          if (mode.id === "image") {
                            iconUploadRef.current?.click();
                          }
                          setIconConfig((p) => ({ ...p, type: mode.id as any }));
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          iconConfig.type === mode.id
                            ? "bg-primary/15 border-primary text-primary shadow-xs"
                            : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <mode.icon className="w-4 h-4" />
                        <span>{mode.label}</span>
                      </button>
                    ))}
                    <input
                      ref={iconUploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadIcon}
                    />
                  </div>
                </div>

                {/* Glyph / Emoji Picker */}
                {iconConfig.type === "glyph" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Select Vector Symbol</label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-secondary/50 border border-border/60">
                      {POPULAR_ICON_GLYPHS.map((glyph) => (
                        <button
                          key={glyph}
                          type="button"
                          onClick={() => setIconConfig((p) => ({ ...p, symbolName: glyph }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            iconConfig.symbolName === glyph
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "bg-card border border-border/50 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {glyph}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {iconConfig.type === "emoji" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Enter Emoji</label>
                    <input
                      type="text"
                      value={iconConfig.emoji}
                      onChange={(e) => setIconConfig((p) => ({ ...p, emoji: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/60 border border-border/70 text-lg text-center outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}

                {iconConfig.type === "text" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Brand Monogram / Initials</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={iconConfig.customText}
                      onChange={(e) => setIconConfig((p) => ({ ...p, customText: e.target.value.toUpperCase() }))}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/60 border border-border/70 text-sm font-black tracking-widest text-center uppercase outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}

                {/* Background Gradient Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                    Color Palette
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {ICON_GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setIconConfig((prev) => ({ ...prev, bgGradient: p }))}
                        title={p.name}
                        className={`h-9 rounded-xl border transition-all cursor-pointer relative ${
                          iconConfig.bgGradient.name === p.name
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                            : "border-border/60 hover:scale-100"
                        }`}
                        style={{
                          background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.via || p.to}, ${p.to})`,
                        }}
                      >
                        {iconConfig.bgGradient.name === p.name && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effects: Gleam, Glow, Metallic Ring */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    3D Finish &amp; Effects
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIconConfig((p) => ({ ...p, gleamHighlight: !p.gleamHighlight }))}
                      className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        iconConfig.gleamHighlight
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>3D Gleam</span>
                      {iconConfig.gleamHighlight && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconConfig((p) => ({ ...p, ambientGlow: !p.ambientGlow }))}
                      className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        iconConfig.ambientGlow
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Mesh Glow</span>
                      {iconConfig.ambientGlow && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setIconConfig((p) => ({
                          ...p,
                          metallicRing: p.metallicRing === "none" ? "gold" : p.metallicRing === "gold" ? "silver" : "none",
                        }))
                      }
                      className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        iconConfig.metallicRing !== "none"
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{iconConfig.metallicRing === "none" ? "Ring (None)" : `Ring (${iconConfig.metallicRing})`}</span>
                    </button>
                  </div>
                </div>

                {/* Corner Radius & Standards Compliance */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-secondary/40 border border-border/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <CircleDot className="w-3.5 h-3.5 text-primary" />
                      Corner Radius / Curvature
                    </label>
                    <span className="text-xs font-mono font-bold text-foreground px-2 py-0.5 rounded-md bg-background border border-border/60">
                      {cornerRadius.toFixed(1)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={0.5}
                    value={cornerRadius}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCornerRadius(val);
                      if (val === 0) setIconMask("none");
                      else if (val >= 49.5) setIconMask("circle");
                      else if (Math.abs(val - 22.4) < 0.2) setIconMask("squircle");
                      else setIconMask("custom");
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />

                  {/* Standard Guidance Indicator */}
                  <div className="text-[11px] p-2.5 rounded-xl border bg-card/70 border-border/60 leading-relaxed">
                    {Math.abs(cornerRadius - 22.4) < 0.2 ? (
                      <div className="text-emerald-500 dark:text-emerald-400 font-medium">
                        <span className="font-bold flex items-center gap-1">🍏 Official Apple iOS Standard (22.4%)</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Exact mathematical squircle applied by iOS on iPhone &amp; iPad home screens.
                        </p>
                      </div>
                    ) : cornerRadius >= 49.5 ? (
                      <div className="text-emerald-500 dark:text-emerald-400 font-medium">
                        <span className="font-bold flex items-center gap-1">🤖 Official Android &amp; Google Play Standard (50.0%)</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Standard circular adaptive icon mask used on Android &amp; Pixel launcher.
                        </p>
                      </div>
                    ) : cornerRadius === 0 ? (
                      <div className="text-emerald-500 dark:text-emerald-400 font-medium">
                        <span className="font-bold flex items-center gap-1">📦 Official Store Upload Standard (0% Full-Bleed)</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Required for upload in App Store Connect &amp; Google Play Console. Stores auto-clip on devices.
                        </p>
                      </div>
                    ) : Math.abs(cornerRadius - 18) < 0.2 ? (
                      <div className="text-blue-500 dark:text-blue-400 font-medium">
                        <span className="font-bold flex items-center gap-1">💻 Official Apple macOS Standard (18.0%)</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Standard curvature used on macOS Dock and Application icons.
                        </p>
                      </div>
                    ) : (
                      <div className="text-amber-500 dark:text-amber-400 font-medium">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">⚠️ Custom Radius ({cornerRadius.toFixed(1)}%)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIconMask("squircle");
                              setCornerRadius(22.4);
                            }}
                            className="text-[10px] underline font-semibold text-primary hover:text-primary/80 cursor-pointer"
                          >
                            Reset to iOS Standard
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Non-standard curvature. App Store will auto-mask to 22.4% on iOS and 50% on Android.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sliders: Icon Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Symbol Scale</span>
                    <span>{Math.round(iconConfig.iconSizeRatio * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={0.8}
                    step={0.02}
                    value={iconConfig.iconSizeRatio}
                    onChange={(e) => setIconConfig((p) => ({ ...p, iconSizeRatio: parseFloat(e.target.value) }))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              /* Feature Graphic & Social Card Controls */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Layout Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "hero-right", label: "Angled 3D Hero" },
                      { id: "dual-phone", label: "Dual Overlap" },
                      { id: "panorama-glow", label: "Panorama Glow" },
                      { id: "minimalist", label: "Minimalist Studio" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setFeatureConfig((p) => ({ ...p, layout: l.id as any }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          featureConfig.layout === l.id
                            ? "bg-primary/15 border-primary text-primary shadow-xs"
                            : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">App Name / Headline</label>
                    <input
                      type="text"
                      value={featureConfig.appName}
                      onChange={(e) => setFeatureConfig((p) => ({ ...p, appName: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl bg-secondary/60 border border-border/70 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={featureConfig.tagline}
                      onChange={(e) => setFeatureConfig((p) => ({ ...p, tagline: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl bg-secondary/60 border border-border/70 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Store Rating / Feature Badge</label>
                    <input
                      type="text"
                      value={featureConfig.badgeText}
                      onChange={(e) => setFeatureConfig((p) => ({ ...p, badgeText: e.target.value }))}
                      className="w-full h-9 px-3 rounded-xl bg-secondary/60 border border-border/70 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Screenshot Selector */}
                  {availableScreenshots.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Mockup Screenshot</label>
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {availableScreenshots.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFeatureConfig((p) => ({ ...p, screenshotSrc: src }))}
                            className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                              featureConfig.screenshotSrc === src ? "border-primary scale-105" : "border-border/60 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={src} alt="screen" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Background Palette */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Theme Background</label>
                    <div className="flex gap-2">
                      {FEATURE_GRAPHIC_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setFeatureConfig((prev) => ({ ...prev, bgGradient: p.bgGradient }))}
                          title={p.name}
                          className="w-8 h-8 rounded-xl border border-border/60 transition-transform hover:scale-105 cursor-pointer"
                          style={{
                            background: `linear-gradient(${p.bgGradient.angle}deg, ${p.bgGradient.from}, ${p.bgGradient.via || p.bgGradient.to}, ${p.bgGradient.to})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Export Action Buttons */}
            <div className="pt-4 border-t border-border/60 space-y-2">
              {activeTab === "icon" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadIconMaster(1024, "App Store")}
                      disabled={isExporting}
                      className="py-2.5 px-3 rounded-xl bg-secondary/90 hover:bg-secondary text-foreground text-xs font-bold border border-border/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-primary" />
                      <span>1024×1024 PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadIconMaster(512, "Google Play")}
                      disabled={isExporting}
                      className="py-2.5 px-3 rounded-xl bg-secondary/90 hover:bg-secondary text-foreground text-xs font-bold border border-border/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>512×512 PNG</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportXcodeBundle}
                      disabled={isExporting}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Xcode AppIcon.zip</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportAndroidBundle}
                      disabled={isExporting}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Android Res.zip</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportFaviconPack}
                    disabled={isExporting}
                    className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Export Web Favicon Package (.zip)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadFeatureGraphic("png")}
                    disabled={isExporting}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG (Lossless)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFeatureGraphic("jpeg")}
                    disabled={isExporting}
                    className="py-3 px-4 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold border border-border/70 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span>Download JPEG (Optimized)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
