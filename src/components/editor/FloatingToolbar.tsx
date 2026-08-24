"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { TextLayer, ScreenshotLayer, ShapeLayer, Layer } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Bold, AlignLeft, AlignCenter, AlignRight,
  Trash2, Copy, ChevronDown, Minus, Plus,
  RotateCcw, Upload, Maximize2, Minimize2, Smartphone,
  AlignCenterHorizontal, AlignCenterVertical,
  ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine,
  MoveHorizontal, MoveVertical, RefreshCw, Type, Palette, Check,
  Scissors, Link2, Sparkles
} from "lucide-react";
import { cn, loadGoogleFont, nanoid } from "@/lib/utils";
import { ColorInput } from "@/components/ui/color-input";
import { AICutoutModal } from "@/components/editor/AICutoutModal";
import { toast } from "@/lib/store/toastStore";
import {
  FONT_FAMILIES,
  ToolbarBtn as Btn,
  ToolbarNumInput as NumInput,
} from "@/components/editor/toolbar/ToolbarPrimitives";

// ── Curated Solid Color Swatches ──────────────────────────────────────────────
const SOLID_SWATCHES = [
  { name: "Dark Obsidian", color: "#0b1120" },
  { name: "Pure Black", color: "#000000" },
  { name: "Midnight Purple", color: "#1e0b3a" },
  { name: "Deep Navy", color: "#012949" },
  { name: "Ocean Blue", color: "#2563eb" },
  { name: "Emerald Forest", color: "#047855" },
  { name: "Ruby Crimson", color: "#c7321a" },
  { name: "Royal Violet", color: "#5100a6" },
  { name: "Warm Matcha", color: "#f6f4e8" },
  { name: "Soft Lavender", color: "#f5e2fe" },
  { name: "Nordic Snow", color: "#f8fafc" },
  { name: "Pure White", color: "#ffffff" },
  { name: "Neon Lime", color: "#c7f54a" },
  { name: "Electric Gold", color: "#fbd855" },
  { name: "Sunset Orange", color: "#fb923c" },
  { name: "Rose Pink", color: "#f43f5e" },
];

// ── Curated Gradient Presets ──────────────────────────────────────────────────
const GRADIENT_PRESETS: { name: string; stops: { color: string; position: number }[] }[] = [
  { name: "Deep Space", stops: [{ color: "#0f172a", position: 0 }, { color: "#020617", position: 100 }] },
  { name: "Oceanic Cyan", stops: [{ color: "#32508c", position: 0 }, { color: "#4494b9", position: 100 }] },
  { name: "Vibrant Sunset", stops: [{ color: "#312e81", position: 0 }, { color: "#701a75", position: 100 }] },
  { name: "Neon Electric", stops: [{ color: "#4c0519", position: 0 }, { color: "#831843", position: 100 }] },
  { name: "Royal Purple", stops: [{ color: "#4338ca", position: 0 }, { color: "#6b21a8", position: 100 }] },
  { name: "Emerald Glow", stops: [{ color: "#064e3b", position: 0 }, { color: "#047855", position: 100 }] },
  { name: "Clean Titanium", stops: [{ color: "#18181b", position: 0 }, { color: "#27272a", position: 100 }] },
  { name: "Arctic Ice Light", stops: [{ color: "#ffffff", position: 0 }, { color: "#e2e8f0", position: 100 }] },
  { name: "Sunrise Peach", stops: [{ color: "#f43f5e", position: 0 }, { color: "#fb923c", position: 100 }] },
  { name: "Sky Blue", stops: [{ color: "#0284c7", position: 0 }, { color: "#38bdf8", position: 100 }] },
];

function ScreenContextToolbar({
  screen,
  screenSet,
}: {
  screen: import("@/lib/types").Screen;
  screenSet: import("@/lib/types").ScreenSet;
}) {
  const {
    updateScreen, addLayer, updateScreenBackground, updateAllScreensBackground
  } = useEditorStore();

  const [bgPopoverOpen, setBgPopoverOpen] = useState(false);
  const [bgTab, setBgTab] = useState<"solid" | "gradient">("solid");

  const existingScreenshots = screen.layers.filter(
    (l) => l.type === "screenshot"
  ) as ScreenshotLayer[];
  const mockupCount = existingScreenshots.length;
  const W = screen.width;
  const H = screen.height;

  const applyMockupLayout = (count: 1 | 2 | 3) => {
    const nonScreenshotLayers = screen.layers.filter((l) => l.type !== "screenshot");
    const src0 = existingScreenshots[0]?.src;
    const src1 = existingScreenshots[1]?.src;
    const src2 = existingScreenshots[2]?.src;

    let newMockups: ScreenshotLayer[] = [];

    if (count === 1) {
      newMockups = [
        {
          id: existingScreenshots[0]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src0,
          x: Math.round(W * 0.08),
          y: Math.round(H * 0.28),
          width: Math.round(W * 0.84),
          height: Math.round(H * 0.72),
          rotation: 0,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 0, offsetY: 20 },
          label: "Drop your screenshot here",
        },
      ];
    } else if (count === 2) {
      newMockups = [
        {
          id: existingScreenshots[0]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src0,
          x: Math.round(W * 0.03),
          y: Math.round(H * 0.32),
          width: Math.round(W * 0.58),
          height: Math.round(H * 0.66),
          rotation: -5,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 70, spread: 0, color: "rgba(0,0,0,0.30)", offsetX: -10, offsetY: 20 },
          label: "Screenshot 1",
        },
        {
          id: existingScreenshots[1]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src1,
          x: Math.round(W * 0.39),
          y: Math.round(H * 0.35),
          width: Math.round(W * 0.58),
          height: Math.round(H * 0.66),
          rotation: 5,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 80, spread: 0, color: "rgba(0,0,0,0.35)", offsetX: 10, offsetY: 25 },
          label: "Screenshot 2",
        },
      ];
    } else if (count === 3) {
      newMockups = [
        {
          id: existingScreenshots[0]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src0,
          x: Math.round(-W * 0.05),
          y: Math.round(H * 0.35),
          width: Math.round(W * 0.50),
          height: Math.round(H * 0.62),
          rotation: -7,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 60, spread: 0, color: "rgba(0,0,0,0.28)", offsetX: -10, offsetY: 18 },
          label: "Screenshot 1",
        },
        {
          id: existingScreenshots[2]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src2,
          x: Math.round(W * 0.55),
          y: Math.round(H * 0.35),
          width: Math.round(W * 0.50),
          height: Math.round(H * 0.62),
          rotation: 7,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 60, spread: 0, color: "rgba(0,0,0,0.28)", offsetX: 10, offsetY: 18 },
          label: "Screenshot 3",
        },
        {
          id: existingScreenshots[1]?.id || `mockup_${nanoid()}`,
          type: "screenshot",
          src: src1,
          x: Math.round(W * 0.23),
          y: Math.round(H * 0.29),
          width: Math.round(W * 0.54),
          height: Math.round(H * 0.68),
          rotation: 0,
          opacity: 1,
          objectFit: "cover",
          cornerRadius: 54,
          showDeviceFrame: true,
          shadow: { blur: 90, spread: 0, color: "rgba(0,0,0,0.40)", offsetX: 0, offsetY: 25 },
          label: "Screenshot 2",
        },
      ];
    }

    updateScreen(screenSet.id, screen.id, {
      layers: [...nonScreenshotLayers, ...newMockups],
    });
    useEditorStore.getState().recordHistory();
  };

  const currentBg = screen.background;
  const currentBgColor =
    currentBg.type === "solid"
      ? currentBg.color || "#0b1120"
      : currentBg.gradient?.stops?.[0]?.color || "#0b1120";

  return (
    <div className="w-full h-full flex items-center gap-2 px-4 overflow-x-auto">
      <span className="text-xs font-semibold text-foreground shrink-0 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary" />
        {screen.name}
      </span>

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      {/* ── Mockup Layout (1, 2, 3 phones) ── */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-muted-foreground mr-1">Phone Mockups:</span>
        <button
          type="button"
          onClick={() => applyMockupLayout(1)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-all",
            mockupCount === 1 ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          1 Phone
        </button>
        <button
          type="button"
          onClick={() => applyMockupLayout(2)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-all",
            mockupCount === 2 ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          2 Phones
        </button>
        <button
          type="button"
          onClick={() => applyMockupLayout(3)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-all",
            mockupCount === 3 ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          3 Phones
        </button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      {/* ── Screen Background Popover ── */}
      <Popover open={bgPopoverOpen} onOpenChange={setBgPopoverOpen}>
        <PopoverTrigger className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border/70 hover:bg-secondary text-foreground font-medium shrink-0 transition-colors">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Background</span>
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-border shadow-sm shrink-0"
            style={{ backgroundColor: currentBgColor }}
          />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-80 p-3.5 shadow-2xl z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Screen Background</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateAllScreensBackground(screenSet.id, screen.background);
                  useEditorStore.getState().recordHistory();
                }}
                className="text-[10px] text-primary hover:underline font-semibold"
              >
                Apply to All
              </button>
            </div>

            <div className="flex rounded-lg bg-secondary/60 p-0.5">
              <button
                type="button"
                onClick={() => setBgTab("solid")}
                className={cn(
                  "flex-1 py-1 text-xs font-medium rounded-md transition-all text-center",
                  bgTab === "solid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => setBgTab("gradient")}
                className={cn(
                  "flex-1 py-1 text-xs font-medium rounded-md transition-all text-center",
                  bgTab === "gradient" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Gradient
              </button>
            </div>

            {bgTab === "solid" && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-8 gap-1.5">
                  {SOLID_SWATCHES.map((s) => (
                    <button
                      key={s.color}
                      type="button"
                      onClick={() => {
                        updateScreenBackground(screenSet.id, screen.id, { type: "solid", color: s.color });
                        useEditorStore.getState().recordHistory();
                      }}
                      className={cn(
                        "w-7 h-7 rounded-md border transition-transform hover:scale-110 flex items-center justify-center",
                        currentBg.type === "solid" && currentBg.color?.toLowerCase() === s.color.toLowerCase()
                          ? "ring-2 ring-primary ring-offset-1 border-primary"
                          : "border-border/40"
                      )}
                      style={{ backgroundColor: s.color }}
                      title={s.name}
                    >
                      {currentBg.type === "solid" && currentBg.color?.toLowerCase() === s.color.toLowerCase() && (
                        <Check className={cn("w-3.5 h-3.5", s.color === "#ffffff" || s.color === "#f8fafc" || s.color === "#f6f4e8" ? "text-black" : "text-white")} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground">Custom:</span>
                  <ColorInput
                    value={currentBg.type === "solid" ? currentBg.color || "#000000" : "#0b1120"}
                    onColorChange={(color) => {
                      updateScreenBackground(screenSet.id, screen.id, { type: "solid", color });
                    }}
                    onColorCommit={() => useEditorStore.getState().recordHistory()}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={currentBg.type === "solid" ? currentBg.color || "#000000" : ""}
                    onChange={(e) => {
                      updateScreenBackground(screenSet.id, screen.id, { type: "solid", color: e.target.value });
                    }}
                    placeholder="#0b1120"
                    className="flex-1 h-7 px-2 text-xs font-mono bg-secondary rounded border border-border/60 outline-none uppercase"
                  />
                </div>
              </div>
            )}

            {bgTab === "gradient" && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {GRADIENT_PRESETS.map((g) => {
                    const gradCss = `linear-gradient(135deg, ${g.stops.map(s => `${s.color} ${s.position}%`).join(", ")})`;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          updateScreenBackground(screenSet.id, screen.id, {
                            type: "gradient",
                            gradient: { direction: "to-b", stops: g.stops },
                          });
                          useEditorStore.getState().recordHistory();
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg border border-border/60 hover:border-primary/60 transition-all text-left group"
                      >
                        <div
                          className="w-6 h-6 rounded-md shadow-sm shrink-0 border border-white/10"
                          style={{ background: gradCss }}
                        />
                        <span className="text-[11px] font-medium text-foreground truncate group-hover:text-primary">
                          {g.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

      {/* ── Quick Add Layer ── */}
      <button
        type="button"
        onClick={() => {
          const newText: TextLayer = {
            id: `text_${nanoid()}`,
            type: "text",
            content: "New Headline",
            x: Math.round(W * 0.08),
            y: 180,
            width: Math.round(W * 0.84),
            height: 160,
            fontSize: 100,
            fontFamily: "Inter",
            fontWeight: 800,
            color: "#ffffff",
            align: "center",
            lineHeight: 1.15,
            letterSpacing: -1,
            rotation: 0,
            opacity: 1,
          };
          addLayer(screenSet.id, screen.id, newText);
          useEditorStore.getState().recordHistory();
        }}
        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Type className="w-3.5 h-3.5" />
        <span>+ Text</span>
      </button>
    </div>
  );
}

// ── Main FloatingToolbar ──────────────────────────────────────────────────────
export function FloatingToolbar() {
  const {
    getActiveLayer, getActiveScreen, getActiveSet,
    updateLayer, deleteLayer, duplicateLayer, setActiveLayer,
    syncTextToScreens, syncTypographyToAllScreens, updateScreen
  } = useEditorStore();

  const layer = getActiveLayer();
  const screen = getActiveScreen();
  const set = getActiveSet();

  const [fontOpen, setFontOpen] = useState(false);
  const [showCutoutModal, setShowCutoutModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!screen || !set) return null;

  // When a screen is active but no individual layer is selected, show Screen Toolbar
  if (!layer) {
    return <ScreenContextToolbar screen={screen} screenSet={set} />;
  }

  const update = (updates: Partial<Layer>) => {
    updateLayer(set.id, screen.id, layer.id, updates);
  };

  const isText = layer.type === "text";
  const isScreenshot = layer.type === "screenshot";
  const isShape = layer.type === "shape";
  const tl = isText ? (layer as TextLayer) : null;
  const sl = isScreenshot ? (layer as ScreenshotLayer) : null;
  const sh = isShape ? (layer as ShapeLayer) : null;

  // ── Canvas align helpers ────────────────────────────────────────────────────
  const alignLeft   = () => update({ x: 0 });
  const alignRight  = () => update({ x: screen.width - layer.width });
  const alignTop    = () => update({ y: 0 });
  const alignBottom = () => update({ y: screen.height - layer.height });
  const centerH     = () => update({ x: Math.round((screen.width - layer.width) / 2) });
  const centerV     = () => update({ y: Math.round((screen.height - layer.height) / 2) });

  // File input for screenshot
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return;
      update({ src } as Partial<ScreenshotLayer>);
      useEditorStore.getState().addProjectAsset({ name: file.name, dataUrl: src });
      useEditorStore.getState().recordHistory();
      toast.success("Screenshot loaded into mockup & added to Media Assets!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <TooltipProvider>
      <div className="w-full h-full flex items-center gap-2 px-4 overflow-x-auto">

        {/* Layer type badge */}
        <span className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-lg capitalize shrink-0 flex items-center gap-1.5",
          isScreenshot ? "bg-primary/10 text-primary border border-primary/25" : "text-muted-foreground"
        )}>
          {isScreenshot ? "📱 Screenshot" : isText ? "✏️ Text" : isShape ? "⬛ Shape" : `${layer.type}`}
        </span>

        {/* ── PROMINENT SCREENSHOT PRIMARY ACTIONS ────────────────────────── */}
        {isScreenshot && sl && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                title={sl.src ? "Change screenshot in mockup frame" : "Upload screenshot into mockup frame"}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary font-semibold text-xs border border-primary/35 hover:border-primary/50 shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>{sl.src ? "Change Screenshot" : "Upload Screenshot"}</span>
              </button>

              {sl.src && (
                <button
                  type="button"
                  title="Clear screenshot from mockup frame"
                  onClick={() => {
                    update({ src: undefined } as Partial<ScreenshotLayer>);
                    useEditorStore.getState().recordHistory();
                    toast.info("Screenshot cleared from mockup.");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive dark:text-rose-400 font-semibold text-xs border border-destructive/25 hover:border-destructive/40 shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0 text-destructive dark:text-rose-400" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

        {/* ── POSITION X / Y ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground">X</span>
          <NumInput value={layer.x} onChange={(v) => update({ x: v })} width="w-12" />
          <span className="text-[10px] text-muted-foreground">Y</span>
          <NumInput value={layer.y} onChange={(v) => update({ y: v })} width="w-12" />
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

        {/* ── ALIGN TOOLS ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Btn onClick={alignLeft}   title="Align Left (to canvas)"><ArrowLeftToLine className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={centerH}     title="Center Horizontally"><AlignCenterVertical className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={alignRight}  title="Align Right (to canvas)"><ArrowRightToLine className="w-3.5 h-3.5" /></Btn>
          <Separator orientation="vertical" className="h-4 mx-0.5" />
          <Btn onClick={alignTop}    title="Align Top"><ArrowUpToLine className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={centerV}     title="Center Vertically"><AlignCenterHorizontal className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={alignBottom} title="Align Bottom"><ArrowDownToLine className="w-3.5 h-3.5" /></Btn>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

        {/* ── OPACITY SLIDER ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0" title="Opacity">
          <span className="text-[10px] text-muted-foreground">Op</span>
          <input
            type="range" min={0} max={1} step={0.01}
            value={layer.opacity ?? 1}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            className="w-16 h-1 accent-primary cursor-pointer"
          />
          <NumInput
            value={Math.round((layer.opacity ?? 1) * 100)}
            onChange={(v) => update({ opacity: v / 100 })}
            min={0} max={100} unit="%" width="w-9"
          />
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

        {/* ── ROTATION ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 shrink-0" title="Rotation angle (-360° to 360°)">
          <button
            type="button"
            onClick={() => {
              update({ rotation: 0 });
              useEditorStore.getState().recordHistory();
            }}
            className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Reset angle to 0°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const next = Math.round((layer.rotation ?? 0) - 15);
              update({ rotation: next < -180 ? next + 360 : next });
              useEditorStore.getState().recordHistory();
            }}
            className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground text-[11px] font-bold"
            title="-15°"
          >
            -
          </button>
          <NumInput
            value={layer.rotation ?? 0}
            onChange={(v) => {
              update({ rotation: v });
              useEditorStore.getState().recordHistory();
            }}
            min={-360} max={360} unit="°" width="w-14"
          />
          <button
            type="button"
            onClick={() => {
              const next = Math.round((layer.rotation ?? 0) + 15);
              update({ rotation: next > 180 ? next - 360 : next });
              useEditorStore.getState().recordHistory();
            }}
            className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground text-[11px] font-bold"
            title="+15°"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              update({ rotation: 0 });
              useEditorStore.getState().recordHistory();
            }}
            className="text-[10px] font-medium text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded hover:bg-secondary transition-colors"
            title="Reset rotation to 0°"
          >
            0°
          </button>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

        {/* ── SCREENSHOT DISPLAY & FIT CONTROLS ─────────────────────────── */}
        {isScreenshot && sl && (
          <>

            <Btn
              active={sl.objectFit === "contain"}
              onClick={() => {
                update({ objectFit: sl.objectFit === "cover" ? "contain" : "cover" } as Partial<ScreenshotLayer>);
                useEditorStore.getState().recordHistory();
              }}
              title={sl.objectFit === "cover" ? "Object Fit: Cover (Click to switch to Contain)" : "Object Fit: Contain (Click to switch to Cover)"}
            >
              {sl.objectFit === "cover" ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </Btn>

            {/* Corner radius - only relevant when device frame is NOT active (borderless/minimal squircle) */}
            {(!sl.showDeviceFrame || set.mockup?.showFrame === false) && (
              <div className="flex items-center gap-1 shrink-0 bg-secondary/40 px-1.5 py-0.5 rounded-lg border border-border/40" title="Screenshot Corner Radius (0px - 200px)">
                <span className="text-[10px] font-semibold text-muted-foreground">Radius:</span>
                <button type="button" onClick={() => update({ cornerRadius: Math.max(0, (sl.cornerRadius ?? 0) - 10) } as Partial<ScreenshotLayer>)} className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="w-3 h-3" /></button>
                <NumInput value={sl.cornerRadius ?? 0} onChange={(v) => update({ cornerRadius: v } as Partial<ScreenshotLayer>)} min={0} max={200} unit="px" width="w-12" />
                <button type="button" onClick={() => update({ cornerRadius: Math.min(200, (sl.cornerRadius ?? 0) + 10) } as Partial<ScreenshotLayer>)} className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /></button>
              </div>
            )}

            <Btn
              active={!!sl.showDeviceFrame}
              onClick={() => update({ showDeviceFrame: !sl.showDeviceFrame } as Partial<ScreenshotLayer>)}
              title="Toggle device frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Btn>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg transition-all outline-none",
                  !!sl.shadow
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-primary/60 scale-105"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Shadow Settings"
              >
                <div className={cn("w-3.5 h-3.5 border-[1.5px] rounded-[3px]", !!sl.shadow ? "border-primary-foreground bg-primary-foreground/20" : "border-current")} />
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-4 flex flex-col gap-4 rounded-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Shadow</span>
                  <Switch
                    checked={!!sl.shadow}
                    onCheckedChange={(checked) => {
                      if (!checked) update({ shadow: undefined } as Partial<ScreenshotLayer>);
                      else update({ shadow: { blur: 24, spread: 0, color: "rgba(0,0,0,0.3)", offsetX: 0, offsetY: 12 } } as Partial<ScreenshotLayer>);
                    }}
                  />
                </div>
                {sl.shadow && (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Shadow Color</span>
                      <label className="w-8 h-8 rounded-md cursor-pointer ring-1 ring-border overflow-hidden block hover:ring-foreground transition-all shadow-sm">
                        <ColorInput
                          value={sl.shadow.color.startsWith("rgba") ? "#000000" : sl.shadow.color}
                          onColorChange={(color) => update({ shadow: { ...sl.shadow!, color } } as Partial<ScreenshotLayer>)}
                          className="opacity-0 w-0 h-0 absolute"
                        />
                        <div className="w-full h-full" style={{ background: sl.shadow.color }} />
                      </label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Shadow Size</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "12px", blur: 12, offset: 6 },
                          { label: "16px", blur: 16, offset: 8 },
                          { label: "24px", blur: 24, offset: 12 },
                          { label: "48px", blur: 48, offset: 24 },
                          { label: "64px", blur: 64, offset: 32 },
                          { label: "96px", blur: 96, offset: 48 },
                        ].map((sz) => (
                          <button
                            key={sz.label}
                            type="button"
                            onClick={() => update({ shadow: { ...sl.shadow!, blur: sz.blur, offsetY: sz.offset } } as Partial<ScreenshotLayer>)}
                            className={cn(
                              "text-xs py-1.5 rounded-md border transition-all font-medium",
                              sl.shadow?.blur === sz.blur
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:bg-secondary/50"
                            )}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg transition-all outline-none",
                  sl.focusOverlay?.enabled
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-primary/60 scale-105"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Focus Overlay Settings"
              >
                <div className={cn("relative w-3.5 h-3.5 rounded-[3px] border-[1.5px] overflow-hidden flex items-center justify-center", sl.focusOverlay?.enabled ? "border-primary-foreground" : "border-current")}>
                   <div className={cn("w-1.5 h-1.5 rounded-[1px]", sl.focusOverlay?.enabled ? "bg-primary-foreground" : "bg-current")} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-4 flex flex-col gap-5 rounded-xl shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Focus Overlay</span>
                  <Switch
                    checked={sl.focusOverlay?.enabled ?? false}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        update({ focusOverlay: { ...sl.focusOverlay, enabled: false } as NonNullable<ScreenshotLayer["focusOverlay"]> } as Partial<ScreenshotLayer>);
                      } else {
                        update({
                          focusOverlay: {
                            enabled: true,
                            cropTop: 25,
                            cropBottom: 25,
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                            roundedCorners: 24,
                            blurBackground: true,
                            blurAmount: 12,
                            overlayShadow: true,
                            overlayColor: "#9b87f540"
                          }
                        } as Partial<ScreenshotLayer>);
                      }
                      useEditorStore.getState().recordHistory();
                    }}
                  />
                </div>
                {sl.focusOverlay?.enabled && (
                  <div className="flex flex-col gap-4 border-t pt-4">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <label className="w-16 h-10 rounded-md cursor-pointer ring-1 ring-border overflow-hidden block hover:ring-foreground transition-all shadow-sm relative group">
                        <ColorInput
                          value={sl.focusOverlay.overlayColor?.slice(0, 7) || "#9b87f5"}
                          onColorChange={(color) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, overlayColor: color + "40" } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                          className="opacity-0 w-0 h-0 absolute"
                        />
                        <div className="w-full h-full flex items-center justify-center bg-checkerboard">
                          <div className="w-full h-full" style={{ background: sl.focusOverlay.overlayColor || "#9b87f540" }} />
                        </div>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-medium">Overlay Tint</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground font-medium">Crop Top</span>
                          <span className="text-xs font-mono text-foreground font-semibold">{sl.focusOverlay.cropTop}%</span>
                        </div>
                        <NumInput
                          value={sl.focusOverlay.cropTop}
                          onChange={(v) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, cropTop: v } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                          min={0} max={100} width="w-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground font-medium">Crop Bottom</span>
                          <span className="text-xs font-mono text-foreground font-semibold">{sl.focusOverlay.cropBottom}%</span>
                        </div>
                        <NumInput
                          value={sl.focusOverlay.cropBottom}
                          onChange={(v) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, cropBottom: v } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                          min={0} max={100} width="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">Border Width</span>
                        <NumInput
                          value={sl.focusOverlay.borderWidth}
                          onChange={(v) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, borderWidth: v } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                          min={0} max={50} width="w-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">Border Color</span>
                        <label className="h-8 rounded-md cursor-pointer ring-1 ring-border overflow-hidden block hover:ring-foreground transition-all shadow-sm">
                          <ColorInput
                            value={sl.focusOverlay.borderColor}
                            onColorChange={(color) => {
                              update({ focusOverlay: { ...sl.focusOverlay!, borderColor: color } } as Partial<ScreenshotLayer>);
                              useEditorStore.getState().recordHistory();
                            }}
                            className="opacity-0 w-0 h-0 absolute"
                          />
                          <div className="w-full h-full" style={{ background: sl.focusOverlay.borderColor }} />
                        </label>
                      </div>
                    </div>

                    {/* Focus Card Radius Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-medium">Focus Card Radius</span>
                        <span className="text-xs font-mono text-foreground font-semibold">
                          {typeof sl.focusOverlay.roundedCorners === "number"
                            ? `${sl.focusOverlay.roundedCorners}px`
                            : sl.focusOverlay.roundedCorners === "none" ? "0px"
                            : sl.focusOverlay.roundedCorners === "sm" ? "12px"
                            : sl.focusOverlay.roundedCorners === "md" ? "24px"
                            : "40px"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={80}
                        step={1}
                        value={
                          typeof sl.focusOverlay.roundedCorners === "number"
                            ? sl.focusOverlay.roundedCorners
                            : sl.focusOverlay.roundedCorners === "none" ? 0
                            : sl.focusOverlay.roundedCorners === "sm" ? 12
                            : sl.focusOverlay.roundedCorners === "md" ? 24
                            : 40
                        }
                        onChange={(e) => {
                          update({ focusOverlay: { ...sl.focusOverlay!, roundedCorners: parseInt(e.target.value, 10) } } as Partial<ScreenshotLayer>);
                          useEditorStore.getState().recordHistory();
                        }}
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                    </div>

                    {/* Blur Background + Blur Slider */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Blur Background</span>
                        <Switch
                          size="sm"
                          checked={sl.focusOverlay.blurBackground}
                          onCheckedChange={(c) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, blurBackground: c } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                        />
                      </div>
                      {sl.focusOverlay.blurBackground && (
                        <div className="flex flex-col gap-1 pl-2 border-l-2 border-primary/40">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-muted-foreground">Blur Intensity</span>
                            <span className="text-[11px] font-mono text-foreground font-semibold">{sl.focusOverlay.blurAmount ?? 12}px</span>
                          </div>
                          <input
                            type="range"
                            min={2}
                            max={40}
                            step={1}
                            value={sl.focusOverlay.blurAmount ?? 12}
                            onChange={(e) => {
                              update({ focusOverlay: { ...sl.focusOverlay!, blurAmount: parseInt(e.target.value, 10) } } as Partial<ScreenshotLayer>);
                              useEditorStore.getState().recordHistory();
                            }}
                            className="w-full h-1 accent-primary cursor-pointer"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium">Overlay Shadow</span>
                        <Switch
                          size="sm"
                          checked={sl.focusOverlay.overlayShadow}
                          onCheckedChange={(c) => {
                            update({ focusOverlay: { ...sl.focusOverlay!, overlayShadow: c } } as Partial<ScreenshotLayer>);
                            useEditorStore.getState().recordHistory();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* 3D Pop-Out / AI Cutout Button */}
            <button
              type="button"
              onClick={() => setShowCutoutModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/30 hover:border-purple-500/60 text-foreground font-semibold shrink-0 transition-all cursor-pointer shadow-xs"
              title="Extract subject from screenshot to create floating 3D layer"
            >
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">3D Pop-Out</span>
            </button>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
          </>
        )}

        {/* ── TEXT CONTROLS ──────────────────────────────────────────────── */}
        {isText && tl && (
          <>
            {/* Direct Text Content Input */}
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                value={tl.content}
                onChange={(e) => {
                  update({ content: e.target.value } as Partial<TextLayer>);
                  useEditorStore.getState().recordHistory();
                }}
                className="h-7 w-48 px-2.5 text-xs bg-secondary/80 hover:bg-secondary focus:bg-background border border-border/70 rounded-md outline-none focus:ring-1 focus:ring-primary font-medium text-foreground transition-all shadow-xs"
                placeholder="Text content..."
                title="Edit Text (or double-click text on screen)"
              />
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

            {/* Quick Typography Hierarchy Presets */}
            <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/40 shrink-0">
              <button
                type="button"
                onClick={() => {
                  update({ fontSize: 130, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 } as Partial<TextLayer>);
                  useEditorStore.getState().recordHistory();
                }}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded transition-colors",
                  tl.fontSize >= 100 ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Headline Style (130px, Bold)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => {
                  update({ fontSize: 60, fontWeight: 500, letterSpacing: 0, lineHeight: 1.3 } as Partial<TextLayer>);
                  useEditorStore.getState().recordHistory();
                }}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                  tl.fontSize >= 50 && tl.fontSize < 100 ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Subtitle Style (60px, Regular)"
              >
                Sub
              </button>
              <button
                type="button"
                onClick={() => {
                  update({ fontSize: 36, fontWeight: 700, letterSpacing: 5, lineHeight: 1.2 } as Partial<TextLayer>);
                  useEditorStore.getState().recordHistory();
                }}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors",
                  tl.fontSize < 50 ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
                title="Eyebrow Style (36px, Spaced)"
              >
                Badge
              </button>
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

            {/* Font family dropdown */}
            <Popover open={fontOpen} onOpenChange={setFontOpen}>
              <PopoverTrigger
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary text-xs text-foreground transition-colors shrink-0"
              >
                <span className="max-w-24 truncate" style={{ fontFamily: `"${tl.fontFamily}", sans-serif` }}>
                  {tl.fontFamily}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              </PopoverTrigger>
              <PopoverContent className="w-52 p-1 max-h-60 overflow-y-auto shadow-xl" align="start">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      loadGoogleFont(f);
                      update({ fontFamily: f } as Partial<TextLayer>);
                      setFontOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs hover:bg-secondary rounded-md transition-colors",
                      tl.fontFamily === f && "text-primary font-medium bg-primary/10"
                    )}
                    style={{ fontFamily: `"${f}", sans-serif` }}
                  >
                    {f}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Color swatch */}
            <Tooltip>
              <TooltipTrigger
                className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors"
                style={{ color: tl.color }}
              >
                <label className="w-5 h-5 rounded cursor-pointer ring-1 ring-black/20 dark:ring-white/20 overflow-hidden shrink-0 block">
                  <ColorInput value={tl.color.startsWith("rgba") ? "#ffffff" : tl.color} onColorChange={(color) => update({ color } as Partial<TextLayer>)} className="opacity-0 w-0 h-0" />
                  <div className="w-full h-full" style={{ background: tl.gradientColor ? `linear-gradient(to right, ${tl.gradientColor[0]}, ${tl.gradientColor[1]})` : tl.color }} />
                </label>
              </TooltipTrigger>
              <TooltipContent>Text color</TooltipContent>
            </Tooltip>

            {/* Gradient text toggle */}
            <button
              type="button"
              title={tl.gradientColor ? "Remove gradient" : "Enable gradient text"}
              onClick={() => {
                if (tl.gradientColor) {
                  update({ gradientColor: undefined } as Partial<TextLayer>);
                } else {
                  update({ gradientColor: [tl.color, "#f59e0b", "vertical"] } as Partial<TextLayer>);
                }
              }}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm font-black",
                tl.gradientColor
                  ? "ring-1 ring-primary/40 bg-primary/10"
                  : "hover:bg-secondary text-muted-foreground"
              )}
            >
              <span style={tl.gradientColor ? { background: `linear-gradient(to right, ${tl.gradientColor[0]}, ${tl.gradientColor[1]})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}}>
                G
              </span>
            </button>

            {/* Gradient pickers — shown only when gradient enabled */}
            {tl.gradientColor && (
              <div className="flex items-center gap-0.5 shrink-0">
                <label className="w-5 h-5 rounded cursor-pointer ring-1 ring-border overflow-hidden block" title="Gradient start color">
                  <ColorInput value={tl.gradientColor[0]} onColorChange={(color) => update({ gradientColor: [color, tl.gradientColor![1], tl.gradientColor![2]] } as Partial<TextLayer>)} className="opacity-0 w-0 h-0" />
                  <div className="w-full h-full" style={{ background: tl.gradientColor[0] }} />
                </label>
                <label className="w-5 h-5 rounded cursor-pointer ring-1 ring-border overflow-hidden block" title="Gradient end color">
                  <ColorInput value={tl.gradientColor[1]} onColorChange={(color) => update({ gradientColor: [tl.gradientColor![0], color, tl.gradientColor![2]] } as Partial<TextLayer>)} className="opacity-0 w-0 h-0" />
                  <div className="w-full h-full" style={{ background: tl.gradientColor[1] }} />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const dirs: Array<"vertical" | "horizontal" | "diagonal"> = ["vertical", "horizontal", "diagonal"];
                    const cur = tl.gradientColor![2];
                    const next = dirs[(dirs.indexOf(cur) + 1) % 3];
                    update({ gradientColor: [tl.gradientColor![0], tl.gradientColor![1], next] } as Partial<TextLayer>);
                  }}
                  className="w-6 h-5 rounded hover:bg-secondary flex items-center justify-center"
                  title={`Direction: ${tl.gradientColor[2]}`}
                >
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">{tl.gradientColor[2][0]}</span>
                </button>
              </div>
            )}

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

            {/* Font size */}
            <div className="flex items-center gap-0.5 shrink-0" title="Font Size">
              <Type className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              <button type="button" onClick={() => update({ fontSize: Math.max(8, tl.fontSize - 4) } as Partial<TextLayer>)} className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground"><Minus className="w-3 h-3" /></button>
              <NumInput value={tl.fontSize} onChange={(v) => update({ fontSize: v } as Partial<TextLayer>)} min={8} max={500} width="w-10" />
              <button type="button" onClick={() => update({ fontSize: Math.min(500, tl.fontSize + 4) } as Partial<TextLayer>)} className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground"><Plus className="w-3 h-3" /></button>
            </div>

            {/* Bold */}
            <Btn
              active={tl.fontWeight >= 700}
              onClick={() => update({ fontWeight: tl.fontWeight >= 700 ? 400 : 700 } as Partial<TextLayer>)}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </Btn>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

            {/* Text alignment */}
            {(["left", "center", "right"] as const).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
              return (
                <Btn
                  key={a}
                  active={tl.align === a}
                  onClick={() => update({ align: a } as Partial<TextLayer>)}
                  title={`Align ${a}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </Btn>
              );
            })}

            {/* Letter spacing */}
            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
            <div className="flex items-center gap-1 shrink-0" title="Letter spacing">
              <MoveHorizontal className="w-3 h-3 text-muted-foreground" />
              <NumInput value={tl.letterSpacing ?? 0} onChange={(v) => update({ letterSpacing: v } as Partial<TextLayer>)} min={-20} max={50} width="w-10" />
            </div>

            {/* Line height */}
            <div className="flex items-center gap-1 shrink-0" title="Line height">
              <MoveVertical className="w-3 h-3 text-muted-foreground" />
              <NumInput value={(tl.lineHeight ?? 1.2) * 10} onChange={(v) => update({ lineHeight: v / 10 } as Partial<TextLayer>)} min={5} max={30} width="w-10" />
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
          </>
        )}

        {/* ── SHAPE COLOR ────────────────────────────────────────────────── */}
        {isShape && sh && (
          <>
            <Tooltip>
              <TooltipTrigger
                className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <label className="w-6 h-6 rounded-lg cursor-pointer ring-1 ring-border overflow-hidden shrink-0 block">
                  <ColorInput value={sh.fill} onColorChange={(color) => update({ fill: color } as Partial<ShapeLayer>)} className="opacity-0 w-0 h-0" />
                  <div className="w-full h-full" style={{ background: sh.fill }} />
                </label>
              </TooltipTrigger>
              <TooltipContent>Fill color</TooltipContent>
            </Tooltip>

            {/* Shape Outline (Stroke) */}
            <Tooltip>
              <TooltipTrigger
                className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors relative"
              >
                <label className="w-6 h-6 rounded-lg cursor-pointer ring-1 ring-border overflow-hidden shrink-0 block flex items-center justify-center bg-transparent border-2 border-foreground/50">
                  <ColorInput value={sh.stroke || "#000000"} onColorChange={(color) => update({ stroke: color, strokeWidth: sh.strokeWidth || 4 } as Partial<ShapeLayer>)} className="opacity-0 w-0 h-0 absolute" />
                </label>
              </TooltipTrigger>
              <TooltipContent>Stroke color</TooltipContent>
            </Tooltip>

            {/* Corner radius for Shapes & Badges */}
            {(sh.shape === "rounded-rectangle" || sh.shape === "rectangle" || sh.cornerRadius !== undefined || sh.shape.includes("badge") || sh.shape.includes("card")) && (() => {
              const maxR = Math.max(1, Math.round(Math.min(sh.width, sh.height) / 2));
              const currentR = sh.cornerRadius !== undefined ? Math.min(sh.cornerRadius, maxR) : maxR;
              return (
                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => update({ cornerRadius: Math.max(0, currentR - 5) } as Partial<ShapeLayer>)}
                    className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground"
                    title="Decrease corner radius"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <NumInput
                    value={currentR}
                    onChange={(v) => update({ cornerRadius: Math.min(maxR, Math.max(0, v)) } as Partial<ShapeLayer>)}
                    min={0}
                    max={maxR}
                    unit="r"
                    width="w-8"
                  />
                  <button
                    type="button"
                    onClick={() => update({ cornerRadius: Math.min(maxR, currentR + 5) } as Partial<ShapeLayer>)}
                    className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground"
                    title="Increase corner radius"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })()}

            {/* Direct Badge Text & Subtext editing */}
            {(sh.text !== undefined || sh.shape.includes("badge") || sh.shape.includes("card") || sh.shape.includes("pill") || sh.shape.includes("tag")) && (
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <input
                  type="text"
                  value={sh.text ?? ""}
                  onChange={(e) => update({ text: e.target.value } as Partial<ShapeLayer>)}
                  placeholder="Card / Badge text..."
                  className="bg-secondary/80 border border-border/60 hover:border-primary/40 focus:border-primary rounded-md px-2 py-0.5 text-xs text-foreground outline-none w-44 transition-colors"
                  title="Edit badge main text"
                />
                {(sh.subtext !== undefined || sh.shape.includes("card") || sh.shape.includes("badge") || sh.shape.includes("pill") || sh.shape.includes("banner")) && (
                  <input
                    type="text"
                    value={sh.subtext ?? ""}
                    onChange={(e) => update({ subtext: e.target.value } as Partial<ShapeLayer>)}
                    placeholder="Subtext / Label..."
                    className="bg-secondary/80 border border-border/60 hover:border-primary/40 focus:border-primary rounded-md px-2 py-0.5 text-xs text-foreground outline-none w-36 transition-colors"
                    title="Edit badge subtext"
                  />
                )}
              </div>
            )}

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
          </>
        )}

        {/* ── SYNC TYPOGRAPHY TO ALL SCREENS ───────────────────────────── */}
        {isText && tl && (() => {
          const screenSet = set;
          if (!screenSet || !screen) return null;
          const hasMultipleScreens = screenSet.screens.length > 1;
          if (!hasMultipleScreens) return null;
          return (
            <Tooltip>
              <TooltipTrigger
                onClick={() => {
                  syncTypographyToAllScreens(screenSet.id, layer.id);
                  toast.success(`Synced typography & style to all ${screenSet.screens.length} screens!`);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Style to All</span>
              </TooltipTrigger>
              <TooltipContent>Apply current font, gradient &amp; style to all screens in set</TooltipContent>
            </Tooltip>
          );
        })()}

        {/* ── DUPLICATE / DELETE ─────────────────────────────────────────── */}
        <Btn onClick={() => { if (set && screen) duplicateLayer(set.id, screen.id, layer.id); }} title="Duplicate (Ctrl+D)">
          <Copy className="w-3.5 h-3.5" />
        </Btn>
        <Btn
          danger
          onClick={() => { if (set && screen) { deleteLayer(set.id, screen.id, layer.id); setActiveLayer(null); } }}
          title="Delete (Del)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Btn>
      </div>

      {/* AI Cutout & 3D Pop-Out Modal */}
      <AICutoutModal
        open={showCutoutModal}
        onClose={() => setShowCutoutModal(false)}
        initialImageSrc={sl?.src || (layer.type === "image" ? (layer as any).src : undefined)}
      />
    </TooltipProvider>
  );
}
