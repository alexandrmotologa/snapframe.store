"use client";

import { useEffect, useRef, useCallback } from "react";
import { Screen, ScreenSet } from "@/lib/types";
import { renderScreenToCanvas } from "@/lib/renderScreenToCanvas";

interface ScreenThumbnailCanvasProps {
  screen: Screen;
  screenSet: ScreenSet;
  width?: number;
  height?: number;
  className?: string;
  activeLang?: string;
}

export function ScreenThumbnailCanvas({
  screen,
  screenSet,
  width,
  height,
  className = "",
  activeLang = "en",
}: ScreenThumbnailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawThumbnail = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = screen.width || 1290;
    const H = screen.height || 2796;
    const aspectRatio = H / W;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const computedW = width || (height ? Math.round(height / aspectRatio) : 44);

    const scale = computedW / W;

    await renderScreenToCanvas(canvas, screen, screenSet, {
      scale,
      dpr,
      activeLang,
      isExport: false,
    });
  }, [screen, screenSet, width, height, activeLang]);

  useEffect(() => {
    const animId = requestAnimationFrame(() => {
      drawThumbnail();
    });
    return () => cancelAnimationFrame(animId);
  }, [drawThumbnail]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      className={className}
    />
  );
}
