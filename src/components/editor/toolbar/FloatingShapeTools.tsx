"use client";

import React from "react";
import { ShapeLayer } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColorInput } from "@/components/ui/color-input";
import { ToolbarNumInput as NumInput } from "./ToolbarPrimitives";

export interface FloatingShapeToolsProps {
  sh: ShapeLayer;
  update: (updates: Partial<ShapeLayer>) => void;
}

export function FloatingShapeTools({ sh, update }: FloatingShapeToolsProps) {
  const maxR = Math.max(1, Math.round(Math.min(sh.width, sh.height) / 2));
  const currentR =
    sh.cornerRadius !== undefined ? Math.min(sh.cornerRadius, maxR) : maxR;

  const isBadgeOrCard =
    sh.shape === "rounded-rectangle" ||
    sh.shape === "rectangle" ||
    sh.cornerRadius !== undefined ||
    sh.shape.includes("badge") ||
    sh.shape.includes("card") ||
    sh.shape.includes("pill") ||
    sh.shape.includes("tag");

  return (
    <>
      {/* Shape Fill Color */}
      <Tooltip>
        <TooltipTrigger className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer">
          <label className="w-6 h-6 rounded-lg cursor-pointer ring-1 ring-border overflow-hidden shrink-0 block">
            <ColorInput
              value={sh.fill}
              onColorChange={(color) => update({ fill: color })}
              className="opacity-0 w-0 h-0"
            />
            <div className="w-full h-full" style={{ background: sh.fill }} />
          </label>
        </TooltipTrigger>
        <TooltipContent>Fill color</TooltipContent>
      </Tooltip>

      {/* Shape Outline (Stroke) */}
      <Tooltip>
        <TooltipTrigger className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center transition-colors relative cursor-pointer">
          <label className="w-6 h-6 rounded-lg cursor-pointer ring-1 ring-border overflow-hidden shrink-0 flex items-center justify-center bg-transparent border-2 border-foreground/50">
            <ColorInput
              value={sh.stroke || "#000000"}
              onColorChange={(color) =>
                update({ stroke: color, strokeWidth: sh.strokeWidth || 4 })
              }
              className="opacity-0 w-0 h-0 absolute"
            />
          </label>
        </TooltipTrigger>
        <TooltipContent>Stroke color</TooltipContent>
      </Tooltip>

      {/* Corner radius for Shapes & Badges */}
      {isBadgeOrCard && (
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => update({ cornerRadius: Math.max(0, currentR - 5) })}
            className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer"
            title="Decrease corner radius"
          >
            <Minus className="w-3 h-3" />
          </button>
          <NumInput
            value={currentR}
            onChange={(v) => update({ cornerRadius: Math.min(maxR, Math.max(0, v)) })}
            min={0}
            max={maxR}
            unit="r"
            width="w-8"
          />
          <button
            type="button"
            onClick={() => update({ cornerRadius: Math.min(maxR, currentR + 5) })}
            className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground cursor-pointer"
            title="Increase corner radius"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Direct Badge Text & Subtext editing */}
      {(sh.text !== undefined || isBadgeOrCard) && (
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <input
            type="text"
            value={sh.text ?? ""}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Card / Badge text..."
            className="bg-secondary/80 border border-border/60 hover:border-primary/40 focus:border-primary rounded-md px-2 py-0.5 text-xs text-foreground outline-none w-44 transition-colors"
            title="Edit badge main text"
          />
          {(sh.subtext !== undefined ||
            sh.shape.includes("card") ||
            sh.shape.includes("badge") ||
            sh.shape.includes("pill") ||
            sh.shape.includes("banner")) && (
            <input
              type="text"
              value={sh.subtext ?? ""}
              onChange={(e) => update({ subtext: e.target.value })}
              placeholder="Subtext / Label..."
              className="bg-secondary/80 border border-border/60 hover:border-primary/40 focus:border-primary rounded-md px-2 py-0.5 text-xs text-foreground outline-none w-36 transition-colors"
              title="Edit badge subtext"
            />
          )}
        </div>
      )}
    </>
  );
}
