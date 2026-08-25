import React, { useState } from "react";
import { Background } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorInput } from "@/components/ui/color-input";
import { EyeDropperButton } from "@/components/ui/EyeDropperButton";

interface Props {
  currentBackground: Background;
  onSelect: (bg: Background) => void;
}

const PRESET_MINIMAL = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", 
  "#000000", "#0f172a", "#1e293b", "#334155",
  "#fff1f2", "#f0fdf4", "#eff6ff", "#fdf4ff",
];

const PRESET_GRADIENTS = [
  { stops: [{ color: "#3b82f6", position: 0 }, { color: "#8b5cf6", position: 100 }], direction: "to-br" as const },
  { stops: [{ color: "#ec4899", position: 0 }, { color: "#f43f5e", position: 100 }], direction: "to-tr" as const },
  { stops: [{ color: "#10b981", position: 0 }, { color: "#3b82f6", position: 100 }], direction: "to-r" as const },
  { stops: [{ color: "#f59e0b", position: 0 }, { color: "#ef4444", position: 100 }], direction: "to-bl" as const },
  { stops: [{ color: "#8b5cf6", position: 0 }, { color: "#d946ef", position: 100 }], direction: "to-tl" as const },
  { stops: [{ color: "#14b8a6", position: 0 }, { color: "#0ea5e9", position: 100 }], direction: "to-b" as const },
  { stops: [{ color: "#0f172a", position: 0 }, { color: "#334155", position: 100 }], direction: "to-br" as const },
  { stops: [{ color: "#4f46e5", position: 0 }, { color: "#06b6d4", position: 100 }], direction: "to-r" as const },
];

export function AdvancedBackgroundPicker({ currentBackground, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-[13px] text-foreground transition-colors outline-none">
        <Paintbrush className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span>Background</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <Tabs defaultValue="minimal" className="w-full">
          <TabsList className="w-full h-8 mb-4">
            <TabsTrigger value="minimal" className="text-[10px] flex-1">Minimal</TabsTrigger>
            <TabsTrigger value="gradients" className="text-[10px] flex-1">Gradients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="minimal" className="mt-0">
            <div className="grid grid-cols-4 gap-2">
              {PRESET_MINIMAL.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onSelect({ type: "solid", color });
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full h-10 rounded-md border shadow-sm transition-transform hover:scale-105",
                    currentBackground.type === "solid" && currentBackground.color === color ? "ring-2 ring-primary ring-offset-1" : "border-border/50"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Custom Color</span>
              <div className="flex items-center gap-1.5">
                <EyeDropperButton
                  onPickColor={(color) => onSelect({ type: "solid", color })}
                  className="h-8 w-8 rounded-md border border-border/60 bg-secondary/40"
                />
                <div 
                  className={cn(
                    "relative w-10 h-8 rounded-md border shadow-sm overflow-hidden flex-shrink-0 transition-transform hover:scale-105",
                    currentBackground.type === "solid" && currentBackground.color && !PRESET_MINIMAL.includes(currentBackground.color) ? "ring-2 ring-primary ring-offset-1" : "border-border/50"
                  )}
                  style={{ backgroundColor: currentBackground.type === "solid" ? currentBackground.color : "#ffffff" }}
                  title="Pick a custom color"
                >
                  <ColorInput
                    value={currentBackground.type === "solid" ? currentBackground.color : "#ffffff"}
                    onColorChange={(color) => onSelect({ type: "solid", color })}
                    onColorCommit={(color) => onSelect({ type: "solid", color })}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gradients" className="mt-0">
            <div className="grid grid-cols-2 gap-3">
              {PRESET_GRADIENTS.map((grad, i) => {
                let deg = "135deg";
                if (grad.direction === "to-b") deg = "180deg";
                if (grad.direction === "to-r") deg = "90deg";
                if (grad.direction === "to-tl") deg = "315deg";
                if (grad.direction === "to-tr") deg = "45deg";
                if (grad.direction === "to-bl") deg = "225deg";

                const bgString = `linear-gradient(${deg}, ${grad.stops[0].color} ${grad.stops[0].position}%, ${grad.stops[1].color} ${grad.stops[1].position}%)`;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onSelect({ type: "gradient", gradient: grad });
                      setOpen(false);
                    }}
                    className="w-full h-16 rounded-md border border-border/50 shadow-sm transition-transform hover:scale-105"
                    style={{ background: bgString }}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
