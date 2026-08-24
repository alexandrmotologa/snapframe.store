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
  FloatingMockupTools,
  FloatingShapeTools,
  FloatingTextTools,
  ScreenContextToolbar,
} from "@/components/editor/toolbar";

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
            <FloatingMockupTools
              sl={sl}
              update={(u) => update(u as Partial<ScreenshotLayer>)}
              showDeviceFrame={set.mockup?.showFrame !== false}
              onOpenCutout={() => setShowCutoutModal(true)}
            />
            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
          </>
        )}

        {/* ── TEXT CONTROLS ──────────────────────────────────────────────── */}
        {isText && tl && (
          <>
            <FloatingTextTools
              tl={tl}
              update={(u) => update(u as Partial<TextLayer>)}
            />
            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />
          </>
        )}

        {/* ── SHAPE COLOR & BADGE CONTROLS ───────────────────────────────── */}
        {isShape && sh && (
          <>
            <FloatingShapeTools
              sh={sh}
              update={(u) => update(u as Partial<ShapeLayer>)}
            />
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
