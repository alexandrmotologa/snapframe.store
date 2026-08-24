"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { Screen, ScreenSet, ScreenshotLayer, TextLayer } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check, Type } from "lucide-react";
import { cn, nanoid } from "@/lib/utils";
import { ColorInput } from "@/components/ui/color-input";

// ── Curated Solid Color Swatches ──────────────────────────────────────────────
export const SOLID_SWATCHES = [
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
export const GRADIENT_PRESETS: { name: string; stops: { color: string; position: number }[] }[] = [
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

interface ScreenContextToolbarProps {
  screen: Screen;
  screenSet: ScreenSet;
}

export function ScreenContextToolbar({ screen, screenSet }: ScreenContextToolbarProps) {
  const {
    updateScreen,
    addLayer,
    updateScreenBackground,
    updateAllScreensBackground,
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
            mockupCount === 1
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          1 Phone
        </button>
        <button
          type="button"
          onClick={() => applyMockupLayout(2)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-all",
            mockupCount === 2
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          2 Phones
        </button>
        <button
          type="button"
          onClick={() => applyMockupLayout(3)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-lg font-medium transition-all",
            mockupCount === 3
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
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
                  bgTab === "solid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => setBgTab("gradient")}
                className={cn(
                  "flex-1 py-1 text-xs font-medium rounded-md transition-all text-center",
                  bgTab === "gradient"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
                        <Check
                          className={cn(
                            "w-3.5 h-3.5",
                            s.color === "#ffffff" || s.color === "#f8fafc" || s.color === "#f6f4e8"
                              ? "text-black"
                              : "text-white"
                          )}
                        />
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
                    const gradCss = `linear-gradient(135deg, ${g.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          updateScreenBackground(screenSet.id, screen.id, {
                            type: "gradient",
                            gradient: { direction: "to-b", stops: g.stops },
                          });
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
        }}
        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Type className="w-3.5 h-3.5" />
        <span>+ Text</span>
      </button>
    </div>
  );
}
