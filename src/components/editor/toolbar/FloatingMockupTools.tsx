"use client";

import React from "react";
import { ScreenshotLayer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";
import {
  Maximize2,
  Minimize2,
  Smartphone,
  Minus,
  Plus,
  Scissors,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ColorInput } from "@/components/ui/color-input";
import { cn } from "@/lib/utils";
import { ToolbarBtn as Btn, ToolbarNumInput as NumInput } from "./ToolbarPrimitives";

export interface FloatingMockupToolsProps {
  sl: ScreenshotLayer;
  update: (updates: Partial<ScreenshotLayer>) => void;
  showDeviceFrame: boolean;
  onOpenCutout: () => void;
}

export function FloatingMockupTools({
  sl,
  update,
  showDeviceFrame,
  onOpenCutout,
}: FloatingMockupToolsProps) {
  return (
    <>
      <Btn
        active={sl.objectFit === "contain"}
        onClick={() => {
          update({ objectFit: sl.objectFit === "cover" ? "contain" : "cover" });
          useEditorStore.getState().recordHistory();
        }}
        title={
          sl.objectFit === "cover"
            ? "Object Fit: Cover (Click to switch to Contain)"
            : "Object Fit: Contain (Click to switch to Cover)"
        }
      >
        {sl.objectFit === "cover" ? (
          <Maximize2 className="w-3.5 h-3.5" />
        ) : (
          <Minimize2 className="w-3.5 h-3.5" />
        )}
      </Btn>

      {/* Corner radius - only relevant when device frame is NOT active */}
      {(!sl.showDeviceFrame || !showDeviceFrame) && (
        <div
          className="flex items-center gap-1 shrink-0 bg-secondary/40 px-1.5 py-0.5 rounded-lg border border-border/40"
          title="Screenshot Corner Radius (0px - 200px)"
        >
          <span className="text-[10px] font-semibold text-muted-foreground">Radius:</span>
          <button
            type="button"
            onClick={() =>
              update({ cornerRadius: Math.max(0, (sl.cornerRadius ?? 0) - 10) })
            }
            className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <NumInput
            value={sl.cornerRadius ?? 0}
            onChange={(v) => update({ cornerRadius: v })}
            min={0}
            max={200}
            unit="px"
            width="w-12"
          />
          <button
            type="button"
            onClick={() =>
              update({ cornerRadius: Math.min(200, (sl.cornerRadius ?? 0) + 10) })
            }
            className="w-5 h-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      <Btn
        active={!!sl.showDeviceFrame}
        onClick={() => update({ showDeviceFrame: !sl.showDeviceFrame })}
        title="Toggle device frame"
      >
        <Smartphone className="w-3.5 h-3.5" />
      </Btn>

      {/* Shadow Settings Popover */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-all outline-none cursor-pointer",
            !!sl.shadow
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-primary/60 scale-105"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
          title="Shadow Settings"
        >
          <div
            className={cn(
              "w-3.5 h-3.5 border-[1.5px] rounded-[3px]",
              !!sl.shadow
                ? "border-primary-foreground bg-primary-foreground/20"
                : "border-current"
            )}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4 flex flex-col gap-4 rounded-xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable Shadow</span>
            <Switch
              checked={!!sl.shadow}
              onCheckedChange={(checked) => {
                if (!checked) update({ shadow: undefined });
                else
                  update({
                    shadow: {
                      blur: 24,
                      spread: 0,
                      color: "rgba(0,0,0,0.3)",
                      offsetX: 0,
                      offsetY: 12,
                    },
                  });
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
                    onColorChange={(color) =>
                      update({ shadow: { ...sl.shadow!, color } })
                    }
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
                      onClick={() =>
                        update({
                          shadow: { ...sl.shadow!, blur: sz.blur, offsetY: sz.offset },
                        })
                      }
                      className={cn(
                        "text-xs py-1.5 rounded-md border transition-all font-medium cursor-pointer",
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

      {/* Focus Overlay Popover */}
      <Popover>
        <PopoverTrigger
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-all outline-none cursor-pointer",
            sl.focusOverlay?.enabled
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-primary/60 scale-105"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
          title="Focus Overlay Settings"
        >
          <div
            className={cn(
              "relative w-3.5 h-3.5 rounded-[3px] border-[1.5px] overflow-hidden flex items-center justify-center",
              sl.focusOverlay?.enabled ? "border-primary-foreground" : "border-current"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-[1px]",
                sl.focusOverlay?.enabled ? "bg-primary-foreground" : "bg-current"
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-4 flex flex-col gap-5 rounded-xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable Focus Overlay</span>
            <Switch
              checked={sl.focusOverlay?.enabled ?? false}
              onCheckedChange={(checked) => {
                if (!checked) {
                  if (sl.focusOverlay) {
                    update({
                      focusOverlay: { ...sl.focusOverlay, enabled: false },
                    });
                  } else {
                    update({ focusOverlay: undefined });
                  }
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
                      overlayColor: "#9b87f540",
                    },
                  });
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
                      update({
                        focusOverlay: { ...sl.focusOverlay!, overlayColor: color + "40" },
                      });
                      useEditorStore.getState().recordHistory();
                    }}
                    className="opacity-0 w-0 h-0 absolute"
                  />
                  <div className="w-full h-full flex items-center justify-center bg-checkerboard">
                    <div
                      className="w-full h-full"
                      style={{ background: sl.focusOverlay.overlayColor || "#9b87f540" }}
                    />
                  </div>
                </label>
                <span className="text-[10px] text-muted-foreground font-medium">Overlay Tint</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-medium">Crop Top</span>
                    <span className="text-xs font-mono text-foreground font-semibold">
                      {sl.focusOverlay.cropTop}%
                    </span>
                  </div>
                  <NumInput
                    value={sl.focusOverlay.cropTop}
                    onChange={(v) => {
                      update({ focusOverlay: { ...sl.focusOverlay!, cropTop: v } });
                      useEditorStore.getState().recordHistory();
                    }}
                    min={0}
                    max={100}
                    width="w-full"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-medium">Crop Bottom</span>
                    <span className="text-xs font-mono text-foreground font-semibold">
                      {sl.focusOverlay.cropBottom}%
                    </span>
                  </div>
                  <NumInput
                    value={sl.focusOverlay.cropBottom}
                    onChange={(v) => {
                      update({ focusOverlay: { ...sl.focusOverlay!, cropBottom: v } });
                      useEditorStore.getState().recordHistory();
                    }}
                    min={0}
                    max={100}
                    width="w-full"
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
        onClick={onOpenCutout}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/30 hover:border-purple-500/60 text-foreground font-semibold shrink-0 transition-all cursor-pointer shadow-xs"
        title="Extract subject from screenshot to create floating 3D layer"
      >
        <Scissors className="w-3.5 h-3.5 text-purple-400" />
        <span className="hidden sm:inline">3D Pop-Out</span>
      </button>
    </>
  );
}
