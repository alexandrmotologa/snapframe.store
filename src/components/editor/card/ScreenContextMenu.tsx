"use client";

import React from "react";
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  AlignCenter,
  AlignJustify,
  Edit3,
  Upload,
} from "lucide-react";
import { Screen, ScreenSet, TextLayer, ScreenshotLayer, Layer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils";

export interface ScreenContextMenuProps {
  ctxMenu: { x: number; y: number; layerId: string };
  screen: Screen;
  screenSet: ScreenSet;
  onClose: () => void;
  onStartTextEdit: (layerId: string, initialContent: string) => void;
}

export function ScreenContextMenu({
  ctxMenu,
  screen,
  screenSet,
  onClose,
  onStartTextEdit,
}: ScreenContextMenuProps) {
  const ctxLayer = screen.layers.find((l) => l.id === ctxMenu.layerId);
  if (!ctxLayer) return null;

  const {
    updateLayer,
    duplicateLayer,
    bringForward,
    sendBackward,
    lockLayer,
    deleteLayer,
    addProjectAsset,
  } = useEditorStore.getState();

  const menuItems = [
    ...(ctxLayer.type === "text"
      ? [
          {
            icon: Edit3,
            label: "Edit Text",
            action: () => {
              onStartTextEdit(ctxMenu.layerId, (ctxLayer as TextLayer).content);
              onClose();
            },
          },
        ]
      : []),
    ...(ctxLayer.type === "screenshot"
      ? [
          {
            icon: Upload,
            label: (ctxLayer as ScreenshotLayer).src
              ? "Replace Screenshot"
              : "Upload Screenshot",
            action: () => {
              onClose();
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = (ev) => {
                  const src = ev.target?.result as string;
                  if (!src) return;
                  updateLayer(screenSet.id, screen.id, ctxMenu.layerId, {
                    src,
                  } as Partial<ScreenshotLayer>);
                  addProjectAsset({ name: f.name, dataUrl: src });
                  useEditorStore.getState().recordHistory();
                  toast.success("Screenshot loaded & added to Media Assets!");
                };
                r.readAsDataURL(f);
              };
              input.click();
            },
          },
          ...((ctxLayer as ScreenshotLayer).src
            ? [
                {
                  icon: Trash2,
                  label: "Clear Screenshot (Empty Frame)",
                  danger: true,
                  action: () => {
                    updateLayer(screenSet.id, screen.id, ctxMenu.layerId, {
                      src: undefined,
                    } as Partial<ScreenshotLayer>);
                    useEditorStore.getState().recordHistory();
                    onClose();
                    toast.info("Screenshot cleared from mockup.");
                  },
                },
              ]
            : []),
        ]
      : []),
    {
      icon: Copy,
      label: "Duplicate",
      action: () => {
        duplicateLayer(screenSet.id, screen.id, ctxMenu.layerId);
        onClose();
        toast.success("Layer duplicated");
      },
    },
    {
      icon: AlignCenter,
      label: "Center Horizontally",
      action: () => {
        updateLayer(screenSet.id, screen.id, ctxMenu.layerId, {
          x: Math.round(screen.width / 2 - ctxLayer.width / 2),
        } as Partial<Layer>);
        useEditorStore.getState().recordHistory();
        onClose();
        toast.info("Layer centered horizontally");
      },
    },
    {
      icon: AlignJustify,
      label: "Center Vertically",
      action: () => {
        updateLayer(screenSet.id, screen.id, ctxMenu.layerId, {
          y: Math.round(screen.height / 2 - ctxLayer.height / 2),
        } as Partial<Layer>);
        useEditorStore.getState().recordHistory();
        onClose();
        toast.info("Layer centered vertically");
      },
    },
    {
      icon: ArrowUp,
      label: "Bring Forward",
      action: () => {
        bringForward(screenSet.id, screen.id, ctxMenu.layerId);
        onClose();
      },
    },
    {
      icon: ArrowDown,
      label: "Send Backward",
      action: () => {
        sendBackward(screenSet.id, screen.id, ctxMenu.layerId);
        onClose();
      },
    },
    {
      icon: Lock,
      label: ctxLayer.locked ? "Unlock Layer" : "Lock Layer",
      action: () => {
        lockLayer(screenSet.id, screen.id, ctxMenu.layerId, !ctxLayer.locked);
        onClose();
        toast.info(ctxLayer.locked ? "Layer unlocked" : "Layer locked");
      },
    },
  ];

  return (
    <div
      className="absolute z-50 bg-popover/95 backdrop-blur-md border border-border/80 rounded-xl shadow-2xl py-1.5 min-w-[190px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: ctxMenu.x, top: ctxMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1 border-b border-border/50 mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {ctxLayer.type === "text"
            ? "Text Layer"
            : ctxLayer.type === "screenshot"
            ? "Mockup Layer"
            : ctxLayer.type === "shape"
            ? "Shape Layer"
            : "Layer Options"}
        </span>
      </div>

      {menuItems.map(({ icon: Icon, label, action, danger }: any) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-secondary transition-colors text-left cursor-pointer",
            danger
              ? "text-destructive/90 hover:text-destructive hover:bg-destructive/10"
              : "text-foreground"
          )}
        >
          <Icon
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              danger ? "text-destructive" : "text-muted-foreground"
            )}
          />
          {label}
        </button>
      ))}

      <div className="border-t border-border/50 mt-1 pt-1">
        <button
          type="button"
          onClick={() => {
            deleteLayer(screenSet.id, screen.id, ctxMenu.layerId);
            onClose();
            toast.info("Layer deleted");
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-destructive/15 text-destructive transition-colors text-left cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          Delete Layer
        </button>
      </div>
    </div>
  );
}
