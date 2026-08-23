"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload, X, ImagePlus, Smartphone, Layers,
  ChevronRight, CheckCircle2, ArrowRight, Sparkles, Wand2
} from "lucide-react";
import { ScreenshotLayer, UploadedAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssetsPanel() {
  const [dragging, setDragging] = useState(false);
  const [applyingAll, setApplyingAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    getActiveSet, getActiveScreen, addLayer, updateLayer, autoFillScreenshots, screenSets,
    projectAssets, addProjectAsset, removeProjectAsset,
  } = useEditorStore();

  const assets = projectAssets;

  // ── Auto-sync any existing layer screenshots into projectAssets ────────────
  useEffect(() => {
    screenSets.forEach((ss) => {
      ss.screens.forEach((scr) => {
        scr.layers.forEach((l) => {
          if ((l.type === "screenshot" || l.type === "image") && (l as ScreenshotLayer).src) {
            const src = (l as ScreenshotLayer).src;
            if (src && !projectAssets.some((a) => a.dataUrl === src)) {
              addProjectAsset({
                name: (l as ScreenshotLayer).label || `${scr.name} Screenshot`,
                dataUrl: src,
              });
            }
          }
        });
      });
    });
  }, [screenSets, projectAssets, addProjectAsset]);

  // ── Load file → asset ───────────────────────────────────────────────────────
  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        addProjectAsset({ name: file.name, dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).filter((f) => f.type.startsWith("image/")).forEach(loadFile);
  };

  // ── Add/replace screenshot in current screen ────────────────────────────────
  const assignToScreen = useCallback((asset: UploadedAsset) => {
    const set = getActiveSet();
    const screen = getActiveScreen();
    if (!set || !screen) return;

    // Find existing screenshot zone
    const existing = screen.layers.find((l) => l.type === "screenshot") as ScreenshotLayer | undefined;

    if (existing) {
      // Update existing zone
      updateLayer(set.id, screen.id, existing.id, { src: asset.dataUrl } as Partial<ScreenshotLayer>);
      useEditorStore.getState().recordHistory();
    } else {
      // Add new screenshot layer centered
      const w = Math.round(screen.width * 0.84);
      const h = Math.round(screen.height * 0.55);
      addLayer(set.id, screen.id, {
        type: "screenshot",
        src: asset.dataUrl,
        x: Math.round(screen.width * 0.08),
        y: Math.round(screen.height * 0.05),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
        objectFit: "cover",
        cornerRadius: 48,
        showDeviceFrame: false,
        label: "Screenshot",
        shadow: { blur: 60, spread: 0, color: "rgba(0,0,0,0.3)", offsetX: 0, offsetY: 16 },
      } as Omit<ScreenshotLayer, "id">);
    }
  }, [getActiveSet, getActiveScreen, addLayer, updateLayer]);

  // ── Apply asset to ALL screens across ALL sets ────────────────────────────
  const applyToAll = (asset: UploadedAsset) => {
    setApplyingAll(true);
    try {
      for (const ss of screenSets) {
        for (const scr of ss.screens) {
          const existing = scr.layers.find((l) => l.type === "screenshot") as ScreenshotLayer | undefined;
          if (existing) {
            updateLayer(ss.id, scr.id, existing.id, { src: asset.dataUrl } as Partial<ScreenshotLayer>);
          }
        }
      }
      useEditorStore.getState().recordHistory();
    } finally {
      setTimeout(() => setApplyingAll(false), 800);
    }
  };

  // ── Remove asset ─────────────────────────────────────────────────────────────
  const removeAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeProjectAsset(id);
  };

  const screenshotLayersCount = screenSets.reduce((acc, ss) =>
    acc + ss.screens.reduce((a, scr) => a + scr.layers.filter((l) => l.type === "screenshot").length, 0)
  , 0);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4 space-y-4 pb-20">

          {/* Status indicator */}
          {screenshotLayersCount > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/8 border border-primary/20">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-primary font-medium">
                {screenshotLayersCount} screenshot slot{screenshotLayersCount > 1 ? "s" : ""} in project
              </p>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200",
              dragging
                ? "border-primary bg-primary/8 scale-[1.02] shadow-lg shadow-primary/10"
                : "border-border/60 hover:border-primary/50 hover:bg-secondary/60"
            )}
          >
            {dragging ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-primary">Drop screenshots here</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Upload screenshots</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WebP · Drag & drop or click</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <Smartphone className="w-3 h-3" />
                  <span>Upload your actual app screenshots</span>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Assets grid */}
          {assets.length > 0 ? (
            <div className="space-y-3">
              {/* 1-Click Auto Fill Banner */}
              {(() => {
                const activeSet = getActiveSet();
                const targetScreensCount = Math.min(assets.length, activeSet?.screens.length || 0);
                const screenLabel = targetScreensCount === 1 ? "1 Screen" : `${targetScreensCount} Screens`;

                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/60 border border-primary/25 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Auto-Fill All Screens</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded-md border border-border/40">
                        {assets.length} {assets.length === 1 ? "image" : "images"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Distributes uploaded screenshots sequentially: #1 ➔ Screen 1, #2 ➔ Screen 2, and so on.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!activeSet || assets.length === 0) return;
                        autoFillScreenshots(activeSet.id, assets.map((a) => a.dataUrl));
                        toast.success(`Auto-filled ${targetScreensCount} ${targetScreensCount === 1 ? "screen" : "screens"} with your screenshots!`);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold tracking-tight transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4 shrink-0 text-primary-foreground" />
                      <span className="truncate">Auto-Populate ({screenLabel})</span>
                    </button>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {assets.length} screenshot{assets.length > 1 ? "s" : ""} uploaded
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {assets.map((asset, i) => (
                  <div key={asset.id} className="relative group flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => assignToScreen(asset)}
                      className="relative w-full rounded-xl overflow-hidden ring-1 ring-border hover:ring-primary/60 transition-all duration-150 hover:shadow-md hover:shadow-primary/10 active:scale-95"
                      style={{ aspectRatio: "9/19" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.dataUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors duration-150 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-primary-foreground text-[9px] font-semibold rounded-full px-2 py-0.5">
                          Use this
                        </div>
                      </div>
                      {/* Index badge */}
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm text-[9px] font-bold flex items-center justify-center text-foreground">
                        {i + 1}
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => assignToScreen(asset)}
                        className="flex-1 flex items-center justify-center gap-1 text-[9px] font-medium py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                        Add to screen
                      </button>
                      <button
                        type="button"
                        onClick={(e) => removeAsset(asset.id, e)}
                        className="w-6 h-6 rounded-lg bg-secondary hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Apply to all */}
                    <button
                      type="button"
                      onClick={() => applyToAll(asset)}
                      className={cn(
                        "flex items-center justify-center gap-1 text-[9px] font-medium py-1 rounded-lg transition-all",
                        applyingAll
                          ? "bg-green-500/20 text-green-400"
                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {applyingAll ? (
                        <><CheckCircle2 className="w-2.5 h-2.5" /> Applied to all</>
                      ) : (
                        <><Layers className="w-2.5 h-2.5" /> Apply to all screens</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="relative">
                <div className="w-16 h-28 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center bg-secondary/30">
                  <Smartphone className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <ImagePlus className="w-3.5 h-3.5 text-primary/60" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/70">No screenshots yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                  Upload your app screenshots to place them in the template
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload screenshots
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Guide */}
          {assets.length > 0 && (
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                💡 <strong className="text-foreground/70">Tip:</strong> Click a screenshot to place it in the active screen, or use <em>Apply to all screens</em> to fill every slot at once.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
