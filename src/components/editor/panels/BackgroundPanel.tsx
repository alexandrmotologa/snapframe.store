"use client";

import { useState, useRef, memo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GradientDirection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ColorInput } from "@/components/ui/color-input";
import { BrandKitPalette } from "@/components/editor/BrandKitPalette";
import { Upload, Sparkles, Paintbrush, Blend, Grid3X3, Link2 } from "lucide-react";

type Tab = "color" | "gradient" | "mesh" | "panoramic" | "ai_magic";

const BG_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "color", label: "Solid", icon: Paintbrush },
  { id: "gradient", label: "Gradient", icon: Blend },
  { id: "mesh", label: "Mesh", icon: Grid3X3 },
  { id: "panoramic", label: "Panorama", icon: Link2 },
  { id: "ai_magic", label: "AI Magic", icon: Sparkles },
];

const AI_THEMES_LIST = [
  {
    id: "oled-midnight",
    name: "OLED Midnight",
    desc: "Luxury pitch black to deep indigo glow",
    gradient: { direction: "to-br" as GradientDirection, stops: [{ color: "#060810", position: 0 }, { color: "#1e1b4b", position: 100 }] },
  },
  {
    id: "clean-cupertino",
    name: "Clean Cupertino",
    desc: "Apple minimalist ice-white to cool slate",
    gradient: { direction: "to-b" as GradientDirection, stops: [{ color: "#f8fafc", position: 0 }, { color: "#e2e8f0", position: 100 }] },
  },
  {
    id: "vibrant-sunset",
    name: "Vibrant Sunset",
    desc: "Warm crimson, fiery coral & deep violet",
    gradient: { direction: "to-br" as GradientDirection, stops: [{ color: "#31103f", position: 0 }, { color: "#f97316", position: 100 }] },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    desc: "Electric cyan & neon purple contrast",
    gradient: { direction: "to-br" as GradientDirection, stops: [{ color: "#050518", position: 0 }, { color: "#06b6d4", position: 100 }] },
  },
  {
    id: "pastel-aurora",
    name: "Pastel Aurora",
    desc: "Dreamy lavender & mint pastel breeze",
    gradient: { direction: "to-br" as GradientDirection, stops: [{ color: "#1e1338", position: 0 }, { color: "#8b5cf6", position: 100 }] },
  },
  {
    id: "emerald-glow",
    name: "Emerald Matrix",
    desc: "Deep forest black to radiant emerald",
    gradient: { direction: "to-br" as GradientDirection, stops: [{ color: "#021512", position: 0 }, { color: "#10b981", position: 100 }] },
  },
];

const PANORAMIC_PRESETS = [
  {
    id: "cosmic-wave",
    name: "Cosmic Neon Flow",
    desc: "Purple & magenta glowing undulating wave",
    preview: "linear-gradient(to right, #090a16, #7928ca, #ff0080, #00dfd8, #090a16)",
    render: (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      // Base dark bg
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#090a16");
      bgGrad.addColorStop(0.5, "#150d2a");
      bgGrad.addColorStop(1, "#070c1e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Continuous wavy flowing ribbon across all screens
      ctx.beginPath();
      ctx.moveTo(0, H * 0.7);
      ctx.bezierCurveTo(W * 0.25, H * 0.4, W * 0.5, H * 0.85, W * 0.75, H * 0.45);
      ctx.bezierCurveTo(W * 0.88, H * 0.3, W * 0.95, H * 0.6, W, H * 0.5);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, 0, W, 0);
      waveGrad.addColorStop(0, "rgba(121, 40, 202, 0.75)");
      waveGrad.addColorStop(0.35, "rgba(255, 0, 128, 0.85)");
      waveGrad.addColorStop(0.7, "rgba(0, 223, 216, 0.75)");
      waveGrad.addColorStop(1, "rgba(121, 40, 202, 0.8)");
      ctx.fillStyle = waveGrad;
      ctx.fill();

      // Top glowing stroke
      ctx.beginPath();
      ctx.moveTo(0, H * 0.7);
      ctx.bezierCurveTo(W * 0.25, H * 0.4, W * 0.5, H * 0.85, W * 0.75, H * 0.45);
      ctx.bezierCurveTo(W * 0.88, H * 0.3, W * 0.95, H * 0.6, W, H * 0.5);
      ctx.lineWidth = 14;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.stroke();
    },
  },
  {
    id: "sunset-horizon",
    name: "Golden Sunset Horizon",
    desc: "Warm crimson to blazing gold horizon flow",
    preview: "linear-gradient(to right, #1a0b2e, #7c2d12, #f97316, #fbbf24, #1a0b2e)",
    render: (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#12072b");
      bgGrad.addColorStop(0.6, "#2e0854");
      bgGrad.addColorStop(1, "#0a0418");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Glowing horizon arc across all screens
      const sunGrad = ctx.createRadialGradient(W * 0.5, H * 0.6, 50, W * 0.5, H * 0.6, W * 0.6);
      sunGrad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
      sunGrad.addColorStop(0.3, "rgba(249, 115, 22, 0.7)");
      sunGrad.addColorStop(0.7, "rgba(236, 72, 153, 0.4)");
      sunGrad.addColorStop(1, "rgba(18, 7, 43, 0)");
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: "emerald-aurora",
    name: "Oceanic Aurora Flow",
    desc: "Luminescent teal & emerald ribbons across screens",
    preview: "linear-gradient(to right, #031b26, #0d9488, #10b981, #3b82f6, #031b26)",
    render: (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      ctx.fillStyle = "#031b26";
      ctx.fillRect(0, 0, W, H);

      const auroraGrad = ctx.createLinearGradient(0, 0, W, 0);
      auroraGrad.addColorStop(0, "#0f766e");
      auroraGrad.addColorStop(0.3, "#10b981");
      auroraGrad.addColorStop(0.6, "#06b6d4");
      auroraGrad.addColorStop(1, "#3b82f6");

      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      ctx.bezierCurveTo(W * 0.3, H * 0.2, W * 0.6, H * 0.7, W, H * 0.4);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = auroraGrad;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    },
  },
  {
    id: "titanium-modern",
    name: "Titanium Cyber Flow",
    desc: "Ultra-sleek dark steel & subtle metallic curves",
    preview: "linear-gradient(to right, #09090b, #27272a, #52525b, #18181b, #09090b)",
    render: (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, W, H);

      const flowGrad = ctx.createLinearGradient(0, 0, W, H);
      flowGrad.addColorStop(0, "rgba(255,255,255,0.06)");
      flowGrad.addColorStop(0.5, "rgba(255,255,255,0.18)");
      flowGrad.addColorStop(1, "rgba(255,255,255,0.04)");

      ctx.beginPath();
      ctx.moveTo(0, H * 0.6);
      ctx.bezierCurveTo(W * 0.35, H * 0.3, W * 0.65, H * 0.8, W, H * 0.5);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = flowGrad;
      ctx.fill();
    },
  },
];

const PRESET_COLORS = [
  // Neutrals
  ["#ffffff", "#f5f5f7", "#1a1a2e", "#0d0d0d", "#121212"],
  // Blues
  ["#1e3a5f", "#1a56db", "#3b82f6", "#93c5fd", "#dbeafe"],
  // Purples
  ["#2d1b69", "#6d28d9", "#8b5cf6", "#c4b5fd", "#ede9fe"],
  // Pinks
  ["#831843", "#be185d", "#ec4899", "#f9a8d4", "#fce7f3"],
  // Greens
  ["#064e3b", "#065f46", "#10b981", "#6ee7b7", "#d1fae5"],
  // Oranges
  ["#7c2d12", "#c2410c", "#f97316", "#fdba74", "#ffedd5"],
  // Indigos
  ["#1e1b4b", "#3730a3", "#6366f1", "#a5b4fc", "#e0e7ff"],
  // Teal
  ["#134e4a", "#0f766e", "#14b8a6", "#5eead4", "#ccfbf1"],
];

const GRADIENT_PRESETS: { name: string; from: string; to: string; dir: GradientDirection }[] = [
  { name: "Cosmic",    from: "#1a1a2e", to: "#6d28d9", dir: "to-br" },
  { name: "Sunset",    from: "#7c2d12", to: "#ec4899", dir: "to-tr" },
  { name: "Ocean",     from: "#1e3a5f", to: "#14b8a6", dir: "to-br" },
  { name: "Forest",    from: "#064e3b", to: "#6366f1", dir: "to-b"  },
  { name: "Fire",      from: "#f97316", to: "#be185d", dir: "to-bl" },
  { name: "Night Sky", from: "#0d0d0d", to: "#1e3a5f", dir: "to-b"  },
  { name: "Aurora",    from: "#134e4a", to: "#8b5cf6", dir: "to-tr" },
  { name: "Rose Gold", from: "#831843", to: "#fdba74", dir: "to-br" },
  { name: "Mint",      from: "#065f46", to: "#60a5fa", dir: "to-br" },
  { name: "Grape",     from: "#2d1b69", to: "#ec4899", dir: "to-b"  },
  { name: "Royal",     from: "#1e1b4b", to: "#14b8a6", dir: "to-br" },
  { name: "Lava",      from: "#7c2d12", to: "#f97316", dir: "to-tr" },
];

const MESH_PRESETS: { name: string; tl: string; tr: string; bl: string; br: string }[] = [
  { name: "Nebula",    tl: "#6d28d9", tr: "#1a56db", bl: "#ec4899", br: "#14b8a6" },
  { name: "Sunrise",   tl: "#f97316", tr: "#fbbf24", bl: "#be185d", br: "#f97316" },
  { name: "Midnight",  tl: "#1e1b4b", tr: "#0d0d0d", bl: "#134e4a", br: "#1e3a5f" },
  { name: "Forest",    tl: "#064e3b", tr: "#065f46", bl: "#6366f1", br: "#14b8a6" },
  { name: "Cotton",    tl: "#fce7f3", tr: "#ede9fe", bl: "#dbeafe", br: "#d1fae5" },
  { name: "Aurora",    tl: "#134e4a", tr: "#8b5cf6", bl: "#10b981", br: "#3b82f6" },
  { name: "Candy",     tl: "#ec4899", tr: "#f9a8d4", bl: "#a5b4fc", br: "#8b5cf6" },
  { name: "Gold",      tl: "#92400e", tr: "#f59e0b", bl: "#dc2626", br: "#fbbf24" },
  { name: "Ocean",     tl: "#1e3a5f", tr: "#1a56db", bl: "#134e4a", br: "#14b8a6" },
];

export const BackgroundPanel = memo(function BackgroundPanel() {
  const { getActiveSet, getActiveScreen, updateScreenBackground, updateAllScreensBackground, applyPanoramicBackground } = useEditorStore();
  const [tab, setTab] = useState<Tab>("color");
  const [applyAll, setApplyAll] = useState(false);
  const [patternEnabled, setPatternEnabled] = useState(false);
  const [patternType, setPatternType] = useState<"dots" | "lines" | "grid" | "noise">("dots");
  const [patternOpacity, setPatternOpacity] = useState(0.15);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = getActiveSet();
  const screen = getActiveScreen();
  const bg = screen?.background;

  const applyBg = (newBg: Parameters<typeof updateScreenBackground>[2]) => {
    if (!set || !screen) return;
    if (applyAll) {
      updateAllScreensBackground(set.id, newBg);
    } else {
      updateScreenBackground(set.id, screen.id, newBg);
    }
  };

  const handlePanoramicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !set) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        applyPanoramicBackground(set.id, dataUrl, img.naturalWidth, img.naturalHeight);
        toast.success(`Panoramic background connected across ${set.screens.length} screens!`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleApplyPanoramicPreset = (preset: typeof PANORAMIC_PRESETS[0]) => {
    if (!set) return;
    const canvas = document.createElement("canvas");
    const W = 4000;
    const H = 2796;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    preset.render(ctx, W, H);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    applyPanoramicBackground(set.id, dataUrl, W, H);
    toast.success(`Applied "${preset.name}" across all ${set.screens.length} screens!`);
  };

  if (!set || !screen) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No screen selected</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Apply to all toggle (hidden in panoramic tab since panoramic inherently spans all screens) */}
        {tab !== "panoramic" && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/60">
            <Label htmlFor="apply-all" className="text-xs cursor-pointer">Apply to all screens</Label>
            <Switch id="apply-all" checked={applyAll} onCheckedChange={setApplyAll} />
          </div>
        )}

        {/* Tab switcher */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-secondary/80 rounded-xl border border-border/40">
          {BG_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10.5px] font-medium transition-all gap-1 cursor-pointer min-w-0 select-none",
                  isActive
                    ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/50 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 active:scale-95"
                )}
                title={t.label}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground/90")} />
                <span className="truncate w-full text-center leading-none tracking-tight">{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === "color" && (
          <div className="space-y-4">
            {/* Custom color picker */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Custom color</Label>
              <div className="flex items-center gap-3">
                <label className="w-10 h-10 rounded-xl cursor-pointer ring-1 ring-border overflow-hidden">
                  <ColorInput
                    value={bg?.type === "solid" ? bg.color ?? "#ffffff" : "#ffffff"}
                    onColorChange={(color) =>
                      applyBg({ type: "solid", color })
                    }
                    onColorCommit={() => useEditorStore.getState().recordHistory()}
                    className="opacity-0 w-0 h-0"
                  />
                  <div
                    className="w-full h-full"
                    style={{ background: bg?.type === "solid" ? bg.color : "#ffffff" }}
                  />
                </label>
                <span className="text-xs font-mono text-muted-foreground">
                  {bg?.type === "solid" ? bg.color?.toUpperCase() : "#FFFFFF"}
                </span>
              </div>
            </div>

            {/* Brand Kit Saved Palette */}
            <BrandKitPalette
              activeColor={bg?.type === "solid" ? bg.color : undefined}
              onSelectColor={(color) => {
                applyBg({ type: "solid", color });
                useEditorStore.getState().recordHistory();
              }}
            />

            {/* Preset palettes */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Presets</Label>
              <div className="space-y-1.5">
                {PRESET_COLORS.map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          applyBg({ type: "solid", color });
                          useEditorStore.getState().recordHistory();
                        }}
                        className={cn(
                          "flex-1 h-7 rounded-lg ring-1 transition-all hover:scale-105",
                          bg?.type === "solid" && bg.color === color
                            ? "ring-primary ring-2"
                            : "ring-border"
                        )}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "gradient" && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground block">Gradient presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((gp) => {
                const dirMap: Record<string, string> = {
                  "to-b": "to bottom",
                  "to-r": "to right",
                  "to-br": "to bottom right",
                  "to-bl": "to bottom left",
                  "to-tr": "to top right",
                };
                const cssDir = dirMap[gp.dir] ?? "to bottom";
                const isActive =
                  bg?.type === "gradient" &&
                  bg.gradient?.stops[0]?.color === gp.from &&
                  bg.gradient?.stops[1]?.color === gp.to;

                return (
                  <button
                    key={gp.name}
                    onClick={() => {
                      applyBg({
                        type: "gradient",
                        gradient: {
                          direction: gp.dir,
                          stops: [
                            { color: gp.from, position: 0 },
                            { color: gp.to, position: 100 },
                          ],
                        },
                      });
                      useEditorStore.getState().recordHistory();
                    }}
                    className={cn(
                      "rounded-xl h-16 flex items-end p-2 transition-all ring-1 hover:scale-[1.02]",
                      isActive ? "ring-primary ring-2" : "ring-border"
                    )}
                    style={{
                      background: `linear-gradient(${cssDir}, ${gp.from}, ${gp.to})`,
                    }}
                  >
                    <span className="text-[10px] font-medium text-white/80">{gp.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom gradient stops */}
            {bg?.type === "gradient" && (
              <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                <Label className="text-xs text-muted-foreground">Custom stops</Label>
                <div className="flex gap-3">
                  {bg.gradient?.stops.map((stop, i) => (
                    <label key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-border cursor-pointer">
                        <ColorInput
                          value={stop.color}
                          className="opacity-0 w-0 h-0"
                          onColorChange={(color) => {
                            const newStops = [...(bg.gradient?.stops ?? [])];
                            newStops[i] = { ...newStops[i], color };
                            applyBg({ type: "gradient", gradient: { ...bg.gradient!, stops: newStops } });
                          }}
                        />
                        <div className="w-full h-full" style={{ background: stop.color }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{i === 0 ? "Start" : "End"}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "mesh" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">4-corner mesh gradient presets</p>
            <div className="grid grid-cols-3 gap-2">
              {MESH_PRESETS.map((mp) => (
                <button
                  key={mp.name}
                  type="button"
                  onClick={() => {
                    applyBg({
                      type: "mesh",
                      mesh: {
                        topLeft: mp.tl,
                        topRight: mp.tr,
                        bottomLeft: mp.bl,
                        bottomRight: mp.br,
                      },
                    });
                    useEditorStore.getState().recordHistory();
                  }}
                  className={cn(
                    "rounded-xl h-14 ring-1 transition-all hover:scale-105 hover:ring-2 hover:ring-primary overflow-hidden",
                    bg?.type === "mesh" &&
                    bg.mesh?.topLeft === mp.tl
                      ? "ring-primary ring-2"
                      : "ring-border"
                  )}
                  style={{
                    background: `conic-gradient(from 135deg at 50% 50%, ${mp.tl}, ${mp.tr}, ${mp.br}, ${mp.bl}, ${mp.tl})`,
                  }}
                  title={mp.name}
                >
                  <span className="text-[9px] font-medium text-white/80 drop-shadow px-1">{mp.name}</span>
                </button>
              ))}
            </div>

            {/* Custom 4-corner pickers */}
            {bg?.type === "mesh" && bg.mesh && (
              <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                <p className="text-xs text-muted-foreground">Custom corners</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "topLeft",     label: "↖ Top Left"     },
                    { key: "topRight",    label: "↗ Top Right"    },
                    { key: "bottomLeft",  label: "↙ Bottom Left"  },
                    { key: "bottomRight", label: "↘ Bottom Right" },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-border shrink-0">
                        <ColorInput
                          value={(bg.mesh! as unknown as Record<string, string>)[key] ?? "#000000"}
                          className="opacity-0 w-0 h-0"
                          onColorChange={(color) =>
                            applyBg({
                              type: "mesh",
                              mesh: { ...bg.mesh!, [key]: color },
                            })
                          }
                        />
                        <div
                          className="w-full h-full"
                          style={{ background: (bg.mesh! as unknown as Record<string, string>)[key] ?? "#000" }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "panoramic" && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Multi-Screen Continuous Carousel</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connects a seamless wide artwork across all {set.screens.length} screens in your project with pixel-perfect sliced continuity.
              </p>
            </div>

            {/* Custom wide image upload */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground block">Upload Custom Panorama / Wide Artwork</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePanoramicUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-border/80 bg-secondary/40 hover:bg-secondary/70 hover:border-primary/60 transition-all cursor-pointer group"
              >
                <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Upload Ultra-Wide Image</span>
              </button>
            </div>

            {/* Curated Panoramic Flow Presets */}
            <div className="space-y-2.5 pt-1">
              <Label className="text-xs text-muted-foreground block">Curated Continuous Flow Presets</Label>
              <div className="space-y-2">
                {PANORAMIC_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPanoramicPreset(preset)}
                    className="group relative w-full text-left rounded-xl overflow-hidden border border-border/50 hover:border-primary/80 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <div
                      className="h-14 relative flex items-center justify-between px-3"
                      style={{ background: preset.preview }}
                    >
                      {/* Visual screen slice dividers simulation */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40">
                        {Array.from({ length: Math.max(set.screens.length - 1, 1) }).map((_, i) => (
                          <div key={i} className="h-full border-r border-dashed border-white/60" />
                        ))}
                      </div>
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-white drop-shadow-md">{preset.name}</p>
                        <p className="text-[9.5px] text-white/80 drop-shadow-sm">{preset.desc}</p>
                      </div>
                      <div className="relative z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-semibold text-white/90 border border-white/20">
                        Apply to {set.screens.length} Screens
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "ai_magic" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-foreground">AI Curated Theme Matcher</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                App Store-optimized visual themes designed for maximum conversion. Click any theme to apply it across your screenshots.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs text-muted-foreground block">Curated App Store Themes</Label>
              <div className="grid grid-cols-1 gap-2.5">
                {AI_THEMES_LIST.map((theme) => {
                  const gradientCss = `linear-gradient(135deg, ${theme.gradient.stops[0].color}, ${theme.gradient.stops[1].color})`;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        applyBg({
                          type: "gradient",
                          gradient: theme.gradient,
                        });
                        useEditorStore.getState().recordHistory();
                        toast.success(`Applied "${theme.name}" theme!`);
                      }}
                      className="w-full h-16 rounded-xl border border-border/60 hover:border-primary/60 hover:ring-1 hover:ring-primary/40 relative overflow-hidden transition-all text-left p-3 flex items-center justify-between group cursor-pointer shadow-xs"
                      style={{ background: gradientCss }}
                    >
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-white drop-shadow-md">{theme.name}</p>
                        <p className="text-[10px] text-white/80 drop-shadow-sm">{theme.desc}</p>
                      </div>
                      <div className="relative z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9.5px] font-semibold text-white/90 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        Apply Theme
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Pattern overlay (works on top of any bg) ── */}
        <div className="pt-3 border-t border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Pattern Overlay</p>
            <Switch
              id="pattern-toggle"
              checked={patternEnabled}
              onCheckedChange={(val) => {
                setPatternEnabled(val);
                if (!set || !screen) return;
                const newBg = { ...bg };
                if (val) {
                  newBg.pattern = { type: patternType, color: "#ffffff", opacity: patternOpacity };
                } else {
                  delete newBg.pattern;
                }
                applyBg(newBg as Parameters<typeof applyBg>[0]);
                useEditorStore.getState().recordHistory();
              }}
            />
          </div>
          {patternEnabled && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {(["dots", "lines", "grid", "noise"] as const).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => {
                      setPatternType(pt);
                      if (!bg) return;
                      applyBg({ ...bg, pattern: { type: pt, color: "#ffffff", opacity: patternOpacity } });
                      useEditorStore.getState().recordHistory();
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-[10px] font-medium transition-all capitalize",
                      patternType === pt
                        ? "bg-indigo-500 text-white"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {pt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground shrink-0">Opacity</span>
                <input
                  type="range" min="0.05" max="0.5" step="0.05"
                  value={patternOpacity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setPatternOpacity(v);
                    if (!bg) return;
                    applyBg({ ...bg, pattern: { type: patternType, color: "#ffffff", opacity: v } });
                  }}
                  onMouseUp={() => useEditorStore.getState().recordHistory()}
                  onTouchEnd={() => useEditorStore.getState().recordHistory()}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">
                  {Math.round(patternOpacity * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </ScrollArea>
  );
});
