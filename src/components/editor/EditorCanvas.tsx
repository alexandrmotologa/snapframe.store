"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { TextLayer, ImageLayer, ShapeLayer } from "@/lib/types";
import { Monitor } from "lucide-react";

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    zoom,
    showGrid,
    getActiveScreen,
    getActiveSet,
    activeLayerId,
    setActiveLayer,
  } = useEditorStore();


  const screen = getActiveScreen();
  const set = getActiveSet();

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !screen) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = screen.width;
    const h = screen.height;
    canvas.width = w;
    canvas.height = h;

    // Draw background
    const bg = screen.background;
    if (bg.type === "solid" && bg.color) {
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, w, h);
    } else if (bg.type === "gradient" && bg.gradient) {
      const dirAngles: Record<string, [number, number, number, number]> = {
        "to-b": [0, 0, 0, h],
        "to-r": [0, 0, w, 0],
        "to-br": [0, 0, w, h],
        "to-bl": [w, 0, 0, h],
        "to-tr": [0, h, w, 0],
        "to-tl": [w, h, 0, 0],
      };
      const [x0, y0, x1, y1] =
        dirAngles[bg.gradient.direction] ?? [0, 0, 0, h];
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      for (const stop of bg.gradient.stops) {
        gradient.addColorStop(stop.position / 100, stop.color);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Draw layers bottom to top
    for (const layer of screen.layers) {
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;

      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      if (layer.rotation) {
        ctx.translate(cx, cy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (layer.type === "text") {
        const tl = layer as TextLayer;
        ctx.font = `${tl.fontWeight} ${tl.fontSize}px "${tl.fontFamily}", system-ui, sans-serif`;
        ctx.fillStyle = tl.color;
        ctx.textAlign = tl.align as CanvasTextAlign;

        if (tl.shadow) {
          ctx.shadowColor = tl.shadow.color;
          ctx.shadowBlur = tl.shadow.blur;
          ctx.shadowOffsetX = tl.shadow.offsetX;
          ctx.shadowOffsetY = tl.shadow.offsetY;
        }

        const lines = tl.content.split("\n");
        const lineH = tl.fontSize * (tl.lineHeight ?? 1.2);
        const xPos =
          tl.align === "center"
            ? tl.x + tl.width / 2
            : tl.align === "right"
            ? tl.x + tl.width
            : tl.x;

        lines.forEach((line, i) => {
          ctx.fillText(line, xPos, tl.y + tl.fontSize + i * lineH);
        });
      } else if (layer.type === "shape") {
        const sl = layer as ShapeLayer;
        ctx.fillStyle = sl.fill;
        if (sl.stroke) {
          ctx.strokeStyle = sl.stroke;
          ctx.lineWidth = sl.strokeWidth ?? 2;
        }

        const r = sl.cornerRadius ?? 0;
        if (sl.shape === "circle") {
          ctx.beginPath();
          ctx.arc(
            sl.x + sl.width / 2,
            sl.y + sl.height / 2,
            Math.min(sl.width, sl.height) / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          if (sl.stroke) ctx.stroke();
        } else if (r > 0) {
          ctx.beginPath();
          ctx.roundRect(sl.x, sl.y, sl.width, sl.height, r);
          ctx.fill();
          if (sl.stroke) ctx.stroke();
        } else {
          ctx.fillRect(sl.x, sl.y, sl.width, sl.height);
          if (sl.stroke) ctx.strokeRect(sl.x, sl.y, sl.width, sl.height);
        }
      } else if (layer.type === "image") {
        const il = layer as ImageLayer;
        if (il.src) {
          const img = new Image();
          img.src = il.src;
          if (img.complete) {
            ctx.drawImage(img, il.x, il.y, il.width, il.height);
          }
        }
      }

      // Draw selection outline
      if (layer.id === activeLayerId) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
        ctx.setLineDash([]);

        // Corner handles
        const handles = [
          [layer.x - 4, layer.y - 4],
          [layer.x + layer.width + 4, layer.y - 4],
          [layer.x - 4, layer.y + layer.height + 4],
          [layer.x + layer.width + 4, layer.y + layer.height + 4],
        ];
        for (const [hx, hy] of handles) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(hx, hy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }, [screen, showGrid, activeLayerId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!screen || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Hit test from top layer down
      let hit: string | null = null;
      for (let i = screen.layers.length - 1; i >= 0; i--) {
        const l = screen.layers[i];
        if (x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) {
          hit = l.id;
          break;
        }
      }
      setActiveLayer(hit);
    },
    [screen, zoom, setActiveLayer]
  );

  if (!screen || !set) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 text-muted-foreground">
        <div className="text-center space-y-2">
          <Monitor className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm">No screen selected</p>
        </div>
      </div>
    );
  }

  const scaledW = screen.width * zoom;
  const scaledH = screen.height * zoom;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-muted/30 flex items-start justify-center p-10"
      onClick={(e) => {
        if (e.target === containerRef.current) setActiveLayer(null);
      }}
    >
      <div
        style={{
          width: scaledW,
          height: scaledH,
          flexShrink: 0,
          borderRadius: 16 * zoom,
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={screen.width}
          height={screen.height}
          style={{
            width: scaledW,
            height: scaledH,
            display: "block",
            cursor: "default",
          }}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}
