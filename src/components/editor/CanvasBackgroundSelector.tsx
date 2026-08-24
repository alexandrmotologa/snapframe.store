"use client";

import { useState } from "react";
import { Check, LayoutGrid } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEditorStore } from "@/lib/store/editorStore";
import {
  CANVAS_BACKGROUNDS,
  getCanvasBackground,
} from "@/lib/canvasBackgrounds";
import { cn } from "@/lib/utils";


export function CanvasBackgroundSelector() {
  const { canvasBackground, setCanvasBackground } = useEditorStore();
  const [open, setOpen] = useState(false);
  const current = getCanvasBackground(canvasBackground);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "h-7 px-2 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-border/50 bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer outline-none",
          open && "bg-secondary text-foreground border-border"
        )}
        title="Canvas Background Pattern"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-primary" />
        <span className="hidden xl:inline text-[11px] font-medium max-w-[85px] truncate">
          {current.name}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-80 p-3 text-xs shadow-2xl border border-border/70 rounded-2xl bg-card/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/40">
          <div>
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              <span>Canvas Workspace Background</span>
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Choose your preferred editor workspace pattern
            </p>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {CANVAS_BACKGROUNDS.length} styles
          </span>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin">
          {CANVAS_BACKGROUNDS.map((bg) => {
            const isSelected = canvasBackground === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  setCanvasBackground(bg.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer group relative overflow-hidden",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                    : "bg-secondary/30 hover:bg-secondary/70 border-border/40 hover:border-border/80"
                )}
              >
                {/* Pattern Preview Box */}
                <div
                  className={cn(
                    "w-full h-12 rounded-lg mb-2 border border-border/40 bg-background transition-colors flex items-center justify-center relative overflow-hidden",
                    bg.className
                  )}
                  style={bg.previewStyle}
                >
                  {bg.id === "blank" && (
                    <span className="text-[10px] text-muted-foreground font-mono opacity-50">
                      Solid
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "font-semibold text-xs truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {bg.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {bg.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
