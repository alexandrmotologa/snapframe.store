"use client";

import React, { useState } from "react";
import { Plus, X, Crown, Palette } from "lucide-react";
import { useProjectStore } from "@/lib/store/projectStore";
import { useEditorStore } from "@/lib/store/editorStore";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

interface BrandKitPaletteProps {
  onSelectColor: (hex: string) => void;
  activeColor?: string;
  className?: string;
}

export function BrandKitPalette({ onSelectColor, activeColor, className }: BrandKitPaletteProps) {
  const { projects, addBrandColor, removeBrandColor } = useProjectStore();
  const { isPro, setUpgradeModalOpen } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newColor, setNewColor] = useState("#6366F1");

  // Get active project from editor URL or first project
  const currentProjectId = typeof window !== "undefined"
    ? window.location.pathname.split("/editor/")[1]?.split("/")[0] || ""
    : "";

  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];
  if (!activeProject) return null;

  const brandColors = activeProject.brandColors || [];
  const maxColors = isPro ? 12 : 3;

  const handleAdd = () => {
    if (!newColor.startsWith("#")) return;
    const success = addBrandColor(activeProject.id, newColor);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleQuickAddCurrent = () => {
    if (activeColor && activeColor.startsWith("#")) {
      addBrandColor(activeProject.id, activeColor);
    } else {
      setIsAdding(true);
    }
  };

  return (
    <div className={cn("space-y-2 p-2.5 rounded-xl bg-secondary/40 border border-border/50", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-foreground">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Brand Kit Palette</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9.5px] font-mono text-muted-foreground">
            {brandColors.length}/{maxColors}
          </span>
          {!isPro && (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="text-[9px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-0.5 ml-1 cursor-pointer"
              title="Upgrade to Pro for 12 brand colors"
            >
              <Crown className="w-2.5 h-2.5 fill-amber-500" />
              <span>Pro (12)</span>
            </button>
          )}
        </div>
      </div>

      {/* Swatches Row */}
      <div className="flex items-center flex-wrap gap-1.5">
        {brandColors.map((color) => {
          const isSelected = activeColor?.toUpperCase() === color.toUpperCase();
          return (
            <div key={color} className="relative group">
              <button
                type="button"
                onClick={() => onSelectColor(color)}
                className={cn(
                  "w-6 h-6 rounded-lg border border-white/20 shadow-2xs transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center",
                  isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105"
                )}
                style={{ backgroundColor: color }}
                title={`Apply ${color}`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBrandColor(activeProject.id, color);
                }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-xs cursor-pointer z-10"
                title={`Remove ${color}`}
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          );
        })}

        {/* Add Color Button */}
        {brandColors.length < maxColors ? (
          <button
            type="button"
            onClick={handleQuickAddCurrent}
            className="w-6 h-6 rounded-lg border border-dashed border-border/80 hover:border-primary/60 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title={activeColor && activeColor.startsWith("#") ? `Pin current color (${activeColor})` : "Add brand color"}
          >
            <Plus className="w-3 h-3" />
          </button>
        ) : !isPro ? (
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="w-6 h-6 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 flex items-center justify-center transition-all cursor-pointer"
            title="Unlock 12 brand colors with Pro"
          >
            <Crown className="w-3 h-3 fill-amber-500" />
          </button>
        ) : null}
      </div>

      {/* Manual Color Add Popover */}
      {isAdding && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40 animate-in fade-in duration-150">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value.toUpperCase())}
            className="w-6 h-6 rounded border-0 p-0 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value.toUpperCase())}
            className="flex-1 px-2 py-0.5 text-[11px] font-mono rounded-md bg-secondary border border-border/60 text-foreground outline-none uppercase"
            maxLength={7}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
