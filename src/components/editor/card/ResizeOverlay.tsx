"use client";

import React from "react";
import { Layer } from "@/lib/types";

export interface ResizeOverlayProps {
  layer: Layer;
  scale: number;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

// ── Resize handles overlay ─────────────────────────────────────────────────────
export function ResizeOverlay({
  layer,
  scale,
  onResizeStart,
}: ResizeOverlayProps) {
  const x = layer.x * scale;
  const y = layer.y * scale;
  const w = layer.width * scale;
  const h = layer.height * scale;
  const hs = 10; // handle size px
  const rot = layer.rotation || 0;

  const handles: { id: string; cx: number; cy: number; cursor: string }[] = [
    { id: "nw", cx: x, cy: y, cursor: "nwse-resize" },
    { id: "n", cx: x + w / 2, cy: y, cursor: "ns-resize" },
    { id: "ne", cx: x + w, cy: y, cursor: "nesw-resize" },
    { id: "e", cx: x + w, cy: y + h / 2, cursor: "ew-resize" },
    { id: "se", cx: x + w, cy: y + h, cursor: "nwse-resize" },
    { id: "s", cx: x + w / 2, cy: y + h, cursor: "ns-resize" },
    { id: "sw", cx: x, cy: y + h, cursor: "nesw-resize" },
    { id: "w", cx: x, cy: y + h / 2, cursor: "ew-resize" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: `${x + w / 2}px ${y + h / 2}px`,
          transform: rot ? `rotate(${rot}deg)` : "none",
        }}
      >
        {/* Selection box */}
        <div
          className="absolute border-2 border-primary/70"
          style={{ left: x, top: y, width: w, height: h }}
        />
        {/* Handles */}
        {handles.map(({ id, cx, cy, cursor }) => (
          <div
            key={id}
            className="absolute pointer-events-auto bg-white border-2 border-primary rounded-sm shadow-sm hover:bg-primary/20 transition-colors"
            style={{
              left: cx - hs / 2,
              top: cy - hs / 2,
              width: hs,
              height: hs,
              cursor,
            }}
            onMouseDown={(e) => onResizeStart(e, id)}
          />
        ))}
        {/* Rotation handle */}
        <div
          className="absolute pointer-events-auto bg-white border-2 border-primary shadow-sm hover:bg-primary/20 transition-colors"
          style={{
            left: x + w / 2 - hs / 2,
            top: y - hs * 3,
            width: hs,
            height: hs,
            borderRadius: "50%",
            cursor: "crosshair",
          }}
          onMouseDown={(e) => onResizeStart(e, "rotate")}
        />
        {/* Line connecting rotation handle to box */}
        <div
          className="absolute bg-primary/70 pointer-events-none"
          style={{
            left: x + w / 2 - 1,
            top: y - hs * 3 + hs,
            width: 2,
            height: hs * 2,
          }}
        />
      </div>
    </div>
  );
}
