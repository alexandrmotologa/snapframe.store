"use client";

import React, { useState } from "react";
import { TextLayer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";
import {
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Minus,
  Plus,
  Type,
  MoveHorizontal,
  MoveVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ColorInput } from "@/components/ui/color-input";
import { EyeDropperButton } from "@/components/ui/EyeDropperButton";
import { cn, loadGoogleFont } from "@/lib/utils";
import {
  FONT_FAMILIES,
  ToolbarBtn as Btn,
  ToolbarNumInput as NumInput,
} from "./ToolbarPrimitives";

export interface FloatingTextToolsProps {
  tl: TextLayer;
  update: (updates: Partial<TextLayer>) => void;
}

export function FloatingTextTools({ tl, update }: FloatingTextToolsProps) {
  const [fontOpen, setFontOpen] = useState(false);

  return (
    <>
      {/* Direct Text Content Input */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={tl.content}
          onChange={(e) => {
            update({ content: e.target.value });
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
            update({ fontSize: 130, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1 });
            useEditorStore.getState().recordHistory();
          }}
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer",
            tl.fontSize >= 100
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
          title="Headline Style (130px, Bold)"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => {
            update({ fontSize: 60, fontWeight: 500, letterSpacing: 0, lineHeight: 1.3 });
            useEditorStore.getState().recordHistory();
          }}
          className={cn(
            "px-2 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer",
            tl.fontSize >= 50 && tl.fontSize < 100
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
          title="Subtitle Style (60px, Regular)"
        >
          Sub
        </button>
        <button
          type="button"
          onClick={() => {
            update({ fontSize: 36, fontWeight: 700, letterSpacing: 5, lineHeight: 1.2 });
            useEditorStore.getState().recordHistory();
          }}
          className={cn(
            "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer",
            tl.fontSize < 50
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
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
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary text-xs text-foreground transition-colors shrink-0 cursor-pointer"
        >
          <span
            className="max-w-24 truncate"
            style={{ fontFamily: `"${tl.fontFamily}", sans-serif` }}
          >
            {tl.fontFamily}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </PopoverTrigger>
        <PopoverContent
          className="w-52 p-1 max-h-60 overflow-y-auto shadow-xl"
          align="start"
        >
          {FONT_FAMILIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                loadGoogleFont(f);
                update({ fontFamily: f });
                setFontOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-secondary rounded-md transition-colors cursor-pointer",
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
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip>
          <TooltipTrigger
            className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: tl.color }}
          >
            <label className="w-5 h-5 rounded cursor-pointer ring-1 ring-black/20 dark:ring-white/20 overflow-hidden shrink-0 block">
              <ColorInput
                value={tl.color.startsWith("rgba") ? "#ffffff" : tl.color}
                onColorChange={(color) => update({ color })}
                className="opacity-0 w-0 h-0"
              />
              <div
                className="w-full h-full"
                style={{
                  background: tl.gradientColor
                    ? `linear-gradient(to right, ${tl.gradientColor[0]}, ${tl.gradientColor[1]})`
                    : tl.color,
                }}
              />
            </label>
          </TooltipTrigger>
          <TooltipContent>Text color</TooltipContent>
        </Tooltip>
        <EyeDropperButton
          onPickColor={(color) => {
            update({ color });
            useEditorStore.getState().recordHistory();
          }}
          title="Pick text color from screen"
          size="icon-xs"
        />
      </div>

      {/* Gradient text toggle */}
      <button
        type="button"
        title={tl.gradientColor ? "Remove gradient" : "Enable gradient text"}
        onClick={() => {
          if (tl.gradientColor) {
            update({ gradientColor: undefined });
          } else {
            update({ gradientColor: [tl.color, "#f59e0b", "vertical"] });
          }
        }}
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm font-black cursor-pointer",
          tl.gradientColor
            ? "ring-1 ring-primary/40 bg-primary/10"
            : "hover:bg-secondary text-muted-foreground"
        )}
      >
        <span
          style={
            tl.gradientColor
              ? {
                  background: `linear-gradient(to right, ${tl.gradientColor[0]}, ${tl.gradientColor[1]})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }
              : {}
          }
        >
          G
        </span>
      </button>

      {/* Gradient pickers */}
      {tl.gradientColor && (
        <div className="flex items-center gap-0.5 shrink-0">
          <label
            className="w-5 h-5 rounded cursor-pointer ring-1 ring-border overflow-hidden block"
            title="Gradient start color"
          >
            <ColorInput
              value={tl.gradientColor[0]}
              onColorChange={(color) =>
                update({
                  gradientColor: [color, tl.gradientColor![1], tl.gradientColor![2]],
                })
              }
              className="opacity-0 w-0 h-0"
            />
            <div className="w-full h-full" style={{ background: tl.gradientColor[0] }} />
          </label>
          <label
            className="w-5 h-5 rounded cursor-pointer ring-1 ring-border overflow-hidden block"
            title="Gradient end color"
          >
            <ColorInput
              value={tl.gradientColor[1]}
              onColorChange={(color) =>
                update({
                  gradientColor: [tl.gradientColor![0], color, tl.gradientColor![2]],
                })
              }
              className="opacity-0 w-0 h-0"
            />
            <div className="w-full h-full" style={{ background: tl.gradientColor[1] }} />
          </label>
          <button
            type="button"
            onClick={() => {
              const dirs: Array<"vertical" | "horizontal" | "diagonal"> = [
                "vertical",
                "horizontal",
                "diagonal",
              ];
              const cur = tl.gradientColor![2];
              const next = dirs[(dirs.indexOf(cur) + 1) % 3];
              update({
                gradientColor: [tl.gradientColor![0], tl.gradientColor![1], next],
              });
            }}
            className="w-6 h-5 rounded hover:bg-secondary flex items-center justify-center cursor-pointer"
            title={`Direction: ${tl.gradientColor[2]}`}
          >
            <span className="text-[8px] font-bold text-muted-foreground uppercase">
              {tl.gradientColor[2][0]}
            </span>
          </button>
        </div>
      )}

      <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

      {/* Font size */}
      <div className="flex items-center gap-0.5 shrink-0" title="Font Size">
        <Type className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        <button
          type="button"
          onClick={() => update({ fontSize: Math.max(8, tl.fontSize - 4) })}
          className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>
        <NumInput
          value={tl.fontSize}
          onChange={(v) => update({ fontSize: v })}
          min={8}
          max={500}
          width="w-10"
        />
        <button
          type="button"
          onClick={() => update({ fontSize: Math.min(500, tl.fontSize + 4) })}
          className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Bold */}
      <Btn
        active={tl.fontWeight >= 700}
        onClick={() => update({ fontWeight: tl.fontWeight >= 700 ? 400 : 700 })}
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
            onClick={() => update({ align: a })}
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
        <NumInput
          value={tl.letterSpacing ?? 0}
          onChange={(v) => update({ letterSpacing: v })}
          min={-20}
          max={50}
          width="w-10"
        />
      </div>

      {/* Line height */}
      <div className="flex items-center gap-1 shrink-0" title="Line height">
        <MoveVertical className="w-3 h-3 text-muted-foreground" />
        <NumInput
          value={(tl.lineHeight ?? 1.2) * 10}
          onChange={(v) => update({ lineHeight: v / 10 })}
          min={5}
          max={30}
          width="w-10"
        />
      </div>
    </>
  );
}
