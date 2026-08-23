"use client";

import { useRef } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { Layer, TextLayer, ShapeLayer } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2, Eye, EyeOff, Copy, GripVertical,
  Type, Square, Image as ImageIcon, Flag, Cpu,
  Lock, LockOpen, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAYER_ICONS: Record<string, React.ElementType> = {
  text: Type,
  shape: Square,
  image: ImageIcon,
  screenshot: ImageIcon,
  flag: Flag,
  emoji: Flag,
  brand: Cpu,
};

function LayerRow({
  layer,
  screenSetId,
  screenId,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  layer: Layer;
  screenSetId: string;
  screenId: string;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (targetId: string) => void;
}) {
  const {
    activeLayerId, selectedLayerIds,
    setActiveLayer, toggleSelectLayer,
    updateLayer, deleteLayer, duplicateLayer,
    lockLayer, bringForward, sendBackward,
  } = useEditorStore();

  const isActive = activeLayerId === layer.id;
  const isSelected = selectedLayerIds.includes(layer.id);
  const isLocked = layer.locked ?? false;
  const Icon = LAYER_ICONS[layer.type] ?? Square;

  const label =
    layer.type === "text"
      ? (layer as TextLayer).content.slice(0, 28).replace(/\n/g, " ↵") || "Text"
      : layer.type === "shape"
      ? (layer as ShapeLayer).shape ?? "Shape"
      : layer.type === "screenshot"
      ? "Screenshot"
      : layer.type;

  const isVisible = (layer.opacity ?? 1) > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      toggleSelectLayer(layer.id);
    } else {
      setActiveLayer(isActive ? null : layer.id);
    }
  };

  return (
    <div
      draggable={!isLocked}
      onDragStart={() => onDragStart(layer.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, layer.id); }}
      onDrop={() => onDrop(layer.id)}
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-sm select-none",
        isActive
          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
          : isSelected
          ? "bg-primary/5 text-primary/80 ring-1 ring-primary/20"
          : "hover:bg-secondary text-foreground",
        isLocked && "opacity-60"
      )}
    >
      {/* Drag handle */}
      <GripVertical
        className={cn(
          "w-3 h-3 shrink-0 text-muted-foreground/40",
          !isLocked && "group-hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        )}
      />

      {/* Layer type icon */}
      <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />

      {/* Label */}
      <span className="flex-1 truncate text-xs leading-tight">{label}</span>

      {/* Lock indicator (always visible when locked) */}
      {isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visibility */}
        <button
          type="button"
          title={isVisible ? "Hide" : "Show"}
          onClick={(e) => {
            e.stopPropagation();
            updateLayer(screenSetId, screenId, layer.id, {
              opacity: isVisible ? 0 : 1,
            } as Partial<Layer>);
            useEditorStore.getState().recordHistory();
          }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          {isVisible
            ? <Eye className="w-3 h-3 text-muted-foreground" />
            : <EyeOff className="w-3 h-3 text-muted-foreground" />
          }
        </button>

        {/* Lock / Unlock */}
        <button
          type="button"
          title={isLocked ? "Unlock layer" : "Lock layer"}
          onClick={(e) => {
            e.stopPropagation();
            lockLayer(screenSetId, screenId, layer.id, !isLocked);
          }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          {isLocked
            ? <LockOpen className="w-3 h-3 text-amber-400" />
            : <Lock className="w-3 h-3 text-muted-foreground" />
          }
        </button>

        {/* Bring forward */}
        <button
          type="button"
          title="Bring Forward"
          onClick={(e) => { e.stopPropagation(); bringForward(screenSetId, screenId, layer.id); }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          <ArrowUp className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Send backward */}
        <button
          type="button"
          title="Send Backward"
          onClick={(e) => { e.stopPropagation(); sendBackward(screenSetId, screenId, layer.id); }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          <ArrowDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Duplicate */}
        <button
          type="button"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); duplicateLayer(screenSetId, screenId, layer.id); }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          <Copy className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Delete */}
        <button
          type="button"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); deleteLayer(screenSetId, screenId, layer.id); }}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-background"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      </div>
    </div>
  );
}

export function LayersPanel() {
  const {
    getActiveSet, getActiveScreen, reorderLayers,
    selectedLayerIds, deleteSelectedLayers,
  } = useEditorStore();
  const set = getActiveSet();
  const screen = getActiveScreen();
  const dragId = useRef<string | null>(null);
  const overIds = useRef<string[]>([]);

  if (!set || !screen) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Square className="w-8 h-8 opacity-20" />
        <p className="text-sm">No screen selected</p>
      </div>
    );
  }

  // Layers shown top-first (reversed)
  const layers = [...screen.layers].reverse();

  const handleDragStart = (id: string) => {
    dragId.current = id;
    overIds.current = screen.layers.map((l) => l.id);
  };

  const handleDragOver = (_e: React.DragEvent, targetId: string) => {
    if (!dragId.current || dragId.current === targetId) return;
    const sourceIdx = overIds.current.indexOf(dragId.current);
    const targetIdx = overIds.current.indexOf(targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;
    const next = [...overIds.current];
    next.splice(sourceIdx, 1);
    next.splice(targetIdx, 0, dragId.current);
    overIds.current = next;
  };

  const handleDrop = () => {
    if (!dragId.current) return;
    reorderLayers(set.id, screen.id, overIds.current);
    dragId.current = null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Multi-select banner */}
      {selectedLayerIds.length > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-primary/10 border-b border-primary/20 shrink-0">
          <span className="text-xs text-primary font-medium">
            {selectedLayerIds.length} layers selected
          </span>
          <button
            type="button"
            onClick={deleteSelectedLayers}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-destructive/15 hover:bg-destructive/25 text-destructive text-xs transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete all
          </button>
        </div>
      )}

      <div className="px-2 pt-1 pb-0.5 shrink-0">
        <p className="text-[10px] text-muted-foreground/60">
          Click to select · Shift+click for multi-select · Drag to reorder
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-3 space-y-0.5 pt-1">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
              <Type className="w-8 h-8 opacity-20" />
              <p className="text-xs text-center">
                No layers yet.<br />Add text, shapes or images from the sidebar.
              </p>
            </div>
          ) : (
            layers.map((layer) => (
              <LayerRow
                key={layer.id}
                layer={layer}
                screenSetId={set.id}
                screenId={screen.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
