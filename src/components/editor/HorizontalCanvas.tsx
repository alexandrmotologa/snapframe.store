"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { getCanvasBackground } from "@/lib/canvasBackgrounds";
import { ScreenSetRow } from "@/components/editor/ScreenSetRow";
import { cn } from "@/lib/utils";

export function HorizontalCanvas() {
  const { screenSets, zoom, setZoom, canvasBackground } = useEditorStore();
  const bgConfig = getCanvasBackground(canvasBackground);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStateRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  // Ctrl+Scroll to zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(zoom + delta);
      }
    },
    [zoom, setZoom]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pan / Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag on left click
    if (e.button !== 0) return;

    // Do not initiate pan if clicking on a screen card, button, input, select, textarea, etc.
    const target = e.target as HTMLElement | null;
    if (
      target?.closest(
        "[data-screen-card], [data-no-pan], button, input, textarea, select, [role='button'], a"
      )
    ) {
      return;
    }

    // Deselect all selected layers and active screen when clicking on empty canvas background
    useEditorStore.getState().clearAllSelection();

    const container = containerRef.current;
    if (!container) return;

    setIsPanning(true);
    panStateRef.current = {
      startX: e.pageX,
      startY: e.pageY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!panStateRef.current || !containerRef.current) return;
      const dx = moveEvent.pageX - panStateRef.current.startX;
      const dy = moveEvent.pageY - panStateRef.current.startY;
      containerRef.current.scrollLeft = panStateRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = panStateRef.current.scrollTop - dy;
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      panStateRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "flex-1 overflow-auto bg-background transition-colors",
        bgConfig.className,
        isPanning ? "cursor-grabbing select-none" : "cursor-grab"
      )}
      style={bgConfig.style}
    >
      <div className="min-w-fit px-12 py-10 space-y-12">
        {screenSets.map((ss) => (
          <div key={ss.id} className="space-y-3">
            <ScreenSetRow screenSet={ss} />
          </div>
        ))}
      </div>
    </div>
  );
}
