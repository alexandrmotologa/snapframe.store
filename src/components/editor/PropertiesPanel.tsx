"use client";

import { memo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { TextLayer, ShapeLayer, Background, GradientDirection } from "@/lib/types";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

import { SlideLayout } from "@/lib/types";
import { LAYOUT_LABEL, LAYOUT_HINT } from "@/lib/themes";
import { applyLayoutToScreen } from "@/lib/layoutEngine";
import { AdvancedBackgroundPicker } from "@/components/editor/AdvancedBackgroundPicker";
import { ColorInput } from "@/components/ui/color-input";

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
];

const GRADIENT_DIRECTIONS = [
  { value: "to-b", label: "Top → Bottom" },
  { value: "to-r", label: "Left → Right" },
  { value: "to-br", label: "↘ Diagonal" },
  { value: "to-bl", label: "↙ Diagonal" },
  { value: "to-tr", label: "↗ Diagonal" },
  { value: "to-tl", label: "↖ Diagonal" },
];

export const PropertiesPanel = memo(function PropertiesPanel() {
  const {
    activeLayerId,
    getActiveLayer,
    getActiveScreen,
    getActiveSet,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    updateBackground,
    updateScreen,
  } = useEditorStore();

  const layer = getActiveLayer();
  const screen = getActiveScreen();
  const set = getActiveSet();

  const handleLayerUpdate = (updates: Record<string, unknown>) => {
    if (!set || !screen || !activeLayerId) return;
    updateLayer(set.id, screen.id, activeLayerId, updates as Parameters<typeof updateLayer>[3]);
  };

  const handleBackgroundUpdate = (updates: Partial<Background>) => {
    if (!set || !screen) return;
    const newBg = { ...screen.background, ...updates };
    updateBackground(set.id, screen.id, newBg);
  };

  return (
    <div className="w-72 border-l border-border/60 bg-card/50 flex flex-col shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-semibold">
          {layer ? "Layer Properties" : "Background"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layer ? (
          /* ——— Layer properties ——— */
          <div className="p-4 space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  if (set && screen) duplicateLayer(set.id, screen.id, layer.id);
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  if (set && screen) deleteLayer(set.id, screen.id, layer.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>

            <Separator />

            {/* Position & Size */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Position & Size</p>
              <div className="grid grid-cols-2 gap-2">
                {(["x", "y", "width", "height"] as const).map((prop) => (
                  <div key={prop} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{prop.toUpperCase()}</Label>
                    <Input
                      type="number"
                      value={Math.round(layer[prop] as number)}
                      onChange={(e) =>
                        handleLayerUpdate({ [prop]: Number(e.target.value) })
                      }
                      className="h-8 text-xs bg-secondary border-0"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <span className="text-xs text-muted-foreground">{Math.round((layer.opacity ?? 1) * 100)}%</span>
                </div>
                <Slider
                  value={[(layer.opacity ?? 1) * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(rawV) => { const n = Array.isArray(rawV) ? rawV[0] : rawV; handleLayerUpdate({ opacity: n / 100 }); }}
                  className="h-1.5"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Rotation</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(layer.rotation ?? 0)}°</span>
                </div>
                <Slider
                  value={[layer.rotation ?? 0]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={(rawV) => { const n = Array.isArray(rawV) ? rawV[0] : rawV; handleLayerUpdate({ rotation: n }); }}
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Text-specific */}
            {layer.type === "text" && (
              <>
                <Separator />
                <TextProperties
                  layer={layer as TextLayer}
                  onUpdate={handleLayerUpdate}
                />
              </>
            )}

            {/* Shape-specific */}
            {layer.type === "shape" && (
              <>
                <Separator />
                <ShapeProperties
                  layer={layer as ShapeLayer}
                  onUpdate={handleLayerUpdate}
                />
              </>
            )}

            {/* Screenshot-specific */}
            {layer.type === "screenshot" && (
              <>
                <Separator />
                <ScreenshotProperties
                  layer={layer as import("@/lib/types").ScreenshotLayer}
                  onUpdate={handleLayerUpdate}
                />
              </>
            )}
          </div>
        ) : (
          /* ——— Background properties & Checklist ——— */
          <div className="p-4 space-y-6">
            {screen && (
              <ScreenshotChecklist screen={screen} />
            )}
            {screen && (
              <ScreenLayoutProperties 
                screen={screen} 
                onUpdate={(layout) => {
                  if (!set) return;
                  const newScreen = applyLayoutToScreen(screen, layout);
                  updateScreen(set.id, screen.id, newScreen);
                  useEditorStore.getState().recordHistory();
                }} 
              />
            )}
            <Separator />
            {screen && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background Library</h4>
                <AdvancedBackgroundPicker
                  currentBackground={screen.background}
                  onSelect={handleBackgroundUpdate}
                />
              </div>
            )}
            <Separator />
            {screen && (
              <BackgroundProperties
                background={screen.background}
                onUpdate={handleBackgroundUpdate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function ScreenshotChecklist({ screen }: { screen: import("@/lib/types").Screen }) {
  const screenshotLayers = screen.layers.filter((l) => l.type === "screenshot") as import("@/lib/types").ScreenshotLayer[];
  const hasScreenshotLayers = screenshotLayers.length > 0;
  const allScreenshotsFilled = hasScreenshotLayers && screenshotLayers.every((l) => !!l.src);
  
  const hasText = screen.layers.some((l) => l.type === "text");
  const hasBackground = screen.background.type !== "solid" || (screen.background.color?.toLowerCase() !== "#ffffff" && screen.background.color?.toLowerCase() !== "#fff");

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Screenshot Checklist</p>
      
      <div className="space-y-2">
        <ChecklistItem 
          label="Add your app screenshots" 
          checked={allScreenshotsFilled} 
          disabled={!hasScreenshotLayers}
        />
        <ChecklistItem 
          label="Create a background" 
          checked={hasBackground} 
        />
        <ChecklistItem 
          label="Write a value headline" 
          checked={hasText} 
        />
        <ChecklistItem 
          label="Build a full set" 
          checked={true} // For now, assuming they have a set
        />
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked, disabled }: { label: string; checked: boolean; disabled?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border",
        checked 
          ? "bg-primary border-primary text-primary-foreground" 
          : "border-border/60 bg-secondary/50 text-transparent"
      )}>
        <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span className={cn(
        "text-xs",
        checked ? "text-muted-foreground line-through" : "text-foreground font-medium"
      )}>
        {label}
      </span>
    </div>
  );
}

function TextProperties({
  layer,
  onUpdate,
}: {
  layer: TextLayer;
  onUpdate: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Typography</p>

      {/* Content */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Content</Label>
        <textarea
          value={layer.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={3}
          className="w-full text-xs bg-secondary border-0 rounded-lg p-2 resize-none text-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Font family */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Font</Label>
        <Select value={layer.fontFamily} onValueChange={(v) => onUpdate({ fontFamily: v })}>
          <SelectTrigger className="h-8 text-xs bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size & weight */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Size</Label>
          <Input
            type="number"
            value={layer.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="h-8 text-xs bg-secondary border-0"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Weight</Label>
          <Select
            value={String(layer.fontWeight)}
            onValueChange={(v) => onUpdate({ fontWeight: Number(v) })}
          >
            <SelectTrigger className="h-8 text-xs bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                <SelectItem key={w} value={String(w)} className="text-xs">{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Alignment</Label>
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              onClick={() => onUpdate({ align: a })}
              className={cn(
                "flex-1 h-8 rounded-lg text-xs font-medium transition-colors",
                layer.align === a
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Color</Label>
        <div className="flex gap-2">
          <ColorInput
            value={layer.color}
            onColorChange={(color) => onUpdate({ color })}
            className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <Input
            value={layer.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 text-xs bg-secondary border-0 font-mono"
          />
        </div>
      </div>

      {/* Line height */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Label className="text-xs text-muted-foreground">Line Height</Label>
          <span className="text-xs text-muted-foreground">{layer.lineHeight.toFixed(1)}</span>
        </div>
        <Slider
          value={[layer.lineHeight * 10]}
          min={8}
          max={30}
          step={1}
          onValueChange={(rawV) => { const n = Array.isArray(rawV) ? rawV[0] : rawV; onUpdate({ lineHeight: n / 10 }); }}
          className="h-1.5"
        />
      </div>
    </div>
  );
}

function ShapeProperties({
  layer,
  onUpdate,
}: {
  layer: ShapeLayer;
  onUpdate: (u: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shape</p>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Fill Color</Label>
        <div className="flex gap-2">
          <ColorInput
            value={layer.fill}
            onColorChange={(fill) => onUpdate({ fill })}
            className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <Input
            value={layer.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="h-8 text-xs bg-secondary border-0 font-mono"
          />
        </div>
      </div>
      {layer.cornerRadius !== undefined && (
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Corner Radius</Label>
            <span className="text-xs text-muted-foreground">{layer.cornerRadius}px</span>
          </div>
          <Slider
            value={[layer.cornerRadius]}
            min={0}
            max={200}
            step={1}
            onValueChange={(rawV) => { const n = Array.isArray(rawV) ? rawV[0] : rawV; onUpdate({ cornerRadius: n }); }}
            className="h-1.5"
          />
        </div>
      )}
    </div>
  );
}

function BackgroundProperties({
  background,
  onUpdate,
}: {
  background: Background;
  onUpdate: (u: Partial<Background>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</p>

      {/* Type selector */}
      <div className="flex gap-1">
        {(["solid", "gradient"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onUpdate({ type })}
            className={cn(
              "flex-1 h-8 rounded-lg text-xs font-medium transition-colors capitalize",
              background.type === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {background.type === "solid" && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex gap-2">
            <ColorInput
              value={background.color ?? "#6366f1"}
              onColorChange={(color) => onUpdate({ color })}
              className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <Input
              value={background.color ?? "#6366f1"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="h-8 text-xs bg-secondary border-0 font-mono"
            />
          </div>
        </div>
      )}

      {background.type === "gradient" && background.gradient && (
        <div className="space-y-3">
          {/* Direction */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Direction</Label>
            <Select
              value={background.gradient.direction}
              onValueChange={(v) =>
                onUpdate({
                  gradient: { ...background.gradient!, direction: v as GradientDirection },
                })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADIENT_DIRECTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color stops */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Color Stops</Label>
            {background.gradient.stops.map((stop, i) => (
              <div key={i} className="flex gap-2 items-center">
                <ColorInput
                  value={stop.color}
                  onColorChange={(color) => {
                    const stops = [...background.gradient!.stops];
                    stops[i] = { ...stops[i], color };
                    onUpdate({ gradient: { ...background.gradient!, stops } });
                  }}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
                />
                <Slider
                  value={[stop.position]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(rawV) => { const n = Array.isArray(rawV) ? rawV[0] : rawV; const stops = [...background.gradient!.stops]; stops[i] = { ...stops[i], position: n }; onUpdate({ gradient: { ...background.gradient!, stops } }); }}
                  className="h-1.5 flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                  {stop.position}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScreenLayoutProperties({ screen, onUpdate }: { screen: import("@/lib/types").Screen, onUpdate: (layout: SlideLayout) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Screen Layout</h4>
      </div>
      <Select value={screen.layout ?? ""} onValueChange={(val) => onUpdate(val as SlideLayout)}>
        <SelectTrigger className="h-8 text-xs bg-secondary border-0">
          <SelectValue placeholder="Freeform (no layout)" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LAYOUT_LABEL).map(([val, label]) => (
            <SelectItem key={val} value={val} className="text-xs flex flex-col items-start gap-1">
              <span className="font-medium">{label}</span>
              <span className="text-[10px] text-muted-foreground">{LAYOUT_HINT[val as SlideLayout]}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-muted-foreground leading-tight">
        Selecting a layout automatically snaps your primary text and screenshot layers into predefined positions.
      </p>
    </div>
  );
}

function ScreenshotProperties({ layer, onUpdate }: { layer: import("@/lib/types").ScreenshotLayer; onUpdate: (updates: Record<string, unknown>) => void }) {
  const overlay = layer.focusOverlay || {
    enabled: false,
    cropTop: 25,
    cropBottom: 25,
    borderWidth: 2,
    borderColor: "#3b82f6",
    roundedCorners: 24,
    blurBackground: true,
    blurAmount: 12,
    overlayShadow: true,
    overlayColor: "#9b87f540"
  };

  const updateOverlay = (updates: Partial<typeof overlay>) => {
    onUpdate({ focusOverlay: { ...overlay, ...updates } });
  };

  const roundingValue =
    typeof overlay.roundedCorners === "number"
      ? overlay.roundedCorners
      : overlay.roundedCorners === "none" ? 0
      : overlay.roundedCorners === "sm" ? 12
      : overlay.roundedCorners === "md" ? 24
      : 40;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">Focus Overlay</h4>
        <Button 
          variant={overlay.enabled ? "default" : "outline"}
          size="sm"
          className="h-6 text-[10px] px-2"
          onClick={() => {
            if (!overlay.enabled) {
              updateOverlay({
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
              });
            } else {
              updateOverlay({ enabled: false });
            }
          }}
        >
          {overlay.enabled ? "Enabled" : "Enable"}
        </Button>
      </div>

      {overlay.enabled && (
        <div className="space-y-3 bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Crop Top</Label>
              <span className="text-[10px] text-muted-foreground">{overlay.cropTop}%</span>
            </div>
            <Slider
              value={[overlay.cropTop]}
              min={0}
              max={50}
              step={1}
              onValueChange={(v: any) => updateOverlay({ cropTop: v[0] })}
              className="h-1.5"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Crop Bottom</Label>
              <span className="text-[10px] text-muted-foreground">{overlay.cropBottom}%</span>
            </div>
            <Slider
              value={[overlay.cropBottom]}
              min={0}
              max={50}
              step={1}
              onValueChange={(v: any) => updateOverlay({ cropBottom: v[0] })}
              className="h-1.5"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Border Width</Label>
              <span className="text-[10px] text-muted-foreground">{overlay.borderWidth}px</span>
            </div>
            <Slider
              value={[overlay.borderWidth]}
              min={0}
              max={20}
              step={1}
              onValueChange={(v: any) => updateOverlay({ borderWidth: v[0] })}
              className="h-1.5"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Border Color</Label>
            <div className="flex gap-2">
              <ColorInput
                value={overlay.borderColor}
                onColorChange={(color) => updateOverlay({ borderColor: color })}
                className="w-8 h-8 p-0 border-0 rounded-md overflow-hidden cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={overlay.borderColor}
                onChange={(e) => updateOverlay({ borderColor: e.target.value })}
                className="h-8 text-xs bg-secondary border-0 flex-1 font-mono uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Focus Card Radius</Label>
              <span className="text-[10px] text-muted-foreground font-mono">{roundingValue}px</span>
            </div>
            <Slider
              value={[roundingValue]}
              min={0}
              max={80}
              step={1}
              onValueChange={(v: any) => updateOverlay({ roundedCorners: v[0] })}
              className="h-1.5"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => updateOverlay({ blurBackground: !overlay.blurBackground })}
            >
              <div className={cn("w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0", overlay.blurBackground ? "bg-primary border-primary text-primary-foreground" : "border-border/60")}>
                {overlay.blurBackground && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
              </div>
              <Label className="text-xs font-medium cursor-pointer">Blur Background</Label>
            </div>
            {overlay.blurBackground && (
              <div className="space-y-1 pl-5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Blur Intensity</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{overlay.blurAmount ?? 12}px</span>
                </div>
                <Slider
                  value={[overlay.blurAmount ?? 12]}
                  min={2}
                  max={40}
                  step={1}
                  onValueChange={(v: any) => updateOverlay({ blurAmount: v[0] })}
                  className="h-1.5"
                />
              </div>
            )}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => updateOverlay({ overlayShadow: !overlay.overlayShadow })}
            >
              <div className={cn("w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0", overlay.overlayShadow ? "bg-primary border-primary text-primary-foreground" : "border-border/60")}>
                {overlay.overlayShadow && <div className="w-1.5 h-1.5 bg-current rounded-full" />}
              </div>
              <Label className="text-xs font-medium cursor-pointer">Overlay Shadow</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
