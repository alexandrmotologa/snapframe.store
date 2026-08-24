import React, { useRef, useState } from "react";
import { Layer, Screen, ScreenSet, TextLayer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";

interface UseScreenDragDropProps {
  screen: Screen;
  screenSet: ScreenSet;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale: number;
  activeLayer: Layer | undefined;
  isActiveScreen: boolean;
  setEditingLayerId: (id: string | null) => void;
  setEditText: (text: string) => void;
  setCtxMenu: (menu: { x: number; y: number; layerId: string } | null) => void;
}

export function useScreenDragDrop({
  screen,
  screenSet,
  canvasRef,
  scale,
  activeLayer,
  setEditingLayerId,
  setEditText,
  setCtxMenu,
}: UseScreenDragDropProps) {
  const { setActiveLayer, toggleSelectLayer, clearSelection, updateLayer } = useEditorStore();

  const [snapGuides, setSnapGuides] = useState<{ x?: boolean; y?: boolean } | null>(null);

  const dragRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    groupItems?: Array<{ id: string; origX: number; origY: number }>;
  } | null>(null);

  const resizeRef = useRef<{
    handle: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    origRot: number;
    centerX: number;
    centerY: number;
    groupLayers?: Array<{
      id: string;
      type: string;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
      origFontSize?: number;
    }>;
  } | null>(null);

  const hitTest = (cx: number, cy: number): string | null => {
    for (let i = screen.layers.length - 1; i >= 0; i--) {
      const l = screen.layers[i];
      let testX = cx;
      let testY = cy;
      if (l.rotation) {
        const rad = (l.rotation * Math.PI) / 180;
        const centerX = l.x + l.width / 2;
        const centerY = l.y + l.height / 2;
        const dx = cx - centerX;
        const dy = cy - centerY;
        testX = centerX + dx * Math.cos(-rad) - dy * Math.sin(-rad);
        testY = centerY + dx * Math.sin(-rad) + dy * Math.cos(-rad);
      }
      if (testX >= l.x && testX <= l.x + l.width && testY >= l.y && testY <= l.y + l.height) return l.id;
    }
    return null;
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * screen.width,
      y: ((e.clientY - rect.top) / rect.height) * screen.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setCtxMenu(null);
    useEditorStore.setState({ activeSetId: screenSet.id, activeScreenId: screen.id });
    const { x, y } = getCanvasCoords(e);
    const hit = hitTest(x, y);
    if (hit) {
      if (e.shiftKey) {
        toggleSelectLayer(hit);
      } else {
        setActiveLayer(hit);
      }
      const layer = screen.layers.find((l) => l.id === hit);
      if (layer && !layer.locked) {
        const gid = (layer as any).groupId;
        const groupLayers = gid
          ? screen.layers.filter((l) => (l as any).groupId === gid && !l.locked)
          : [layer];

        dragRef.current = {
          layerId: hit,
          startX: x,
          startY: y,
          origX: layer.x,
          origY: layer.y,
          groupItems: groupLayers.map((l) => ({ id: l.id, origX: l.x, origY: l.y })),
        };
      }
    } else {
      clearSelection();
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const { x, y } = getCanvasCoords(e);
    let targetX = dragRef.current.origX + (x - dragRef.current.startX);
    let targetY = dragRef.current.origY + (y - dragRef.current.startY);

    const layer = screen.layers.find((l) => l.id === dragRef.current?.layerId);
    let snappedX = false;
    let snappedY = false;

    if (layer) {
      const layerCenterX = targetX + layer.width / 2;
      const screenCenterX = screen.width / 2;
      const SNAP_THRESHOLD = 30;

      if (Math.abs(layerCenterX - screenCenterX) < SNAP_THRESHOLD) {
        const snapDiff = Math.round(screenCenterX - layer.width / 2) - targetX;
        targetX += snapDiff;
        snappedX = true;
      }

      const layerCenterY = targetY + layer.height / 2;
      const screenCenterY = screen.height / 2;
      if (Math.abs(layerCenterY - screenCenterY) < SNAP_THRESHOLD) {
        const snapDiff = Math.round(screenCenterY - layer.height / 2) - targetY;
        targetY += snapDiff;
        snappedY = true;
      }
    }

    setSnapGuides({ x: snappedX, y: snappedY });

    const finalDeltaX = targetX - dragRef.current.origX;
    const finalDeltaY = targetY - dragRef.current.origY;

    if (dragRef.current.groupItems && dragRef.current.groupItems.length > 1) {
      dragRef.current.groupItems.forEach((item) => {
        updateLayer(screenSet.id, screen.id, item.id, {
          x: Math.round(item.origX + finalDeltaX),
          y: Math.round(item.origY + finalDeltaY),
        } as Parameters<typeof updateLayer>[3]);
      });
    } else {
      updateLayer(screenSet.id, screen.id, dragRef.current.layerId, {
        x: Math.round(targetX),
        y: Math.round(targetY),
      } as Parameters<typeof updateLayer>[3]);
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current) {
      useEditorStore.getState().recordHistory();
    }
    dragRef.current = null;
    setSnapGuides(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const hit = hitTest(x, y);
    if (!hit) return;
    const layer = screen.layers.find((l) => l.id === hit);
    if (!layer || layer.type !== "text") return;
    setEditingLayerId(hit);
    setEditText((layer as TextLayer).content);
    setActiveLayer(hit);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const hit = hitTest(x, y);
    if (!hit) return;
    setActiveLayer(hit);
    setCtxMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, layerId: hit });
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!activeLayer) return;

    const gid = (activeLayer as any).groupId;
    const groupLayers = gid
      ? screen.layers.filter((l) => (l as any).groupId === gid)
      : [activeLayer];

    resizeRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: activeLayer.x,
      origY: activeLayer.y,
      origW: activeLayer.width,
      origH: activeLayer.height,
      origRot: activeLayer.rotation || 0,
      centerX: activeLayer.x + activeLayer.width / 2,
      centerY: activeLayer.y + activeLayer.height / 2,
      groupLayers: groupLayers.map((l) => ({
        id: l.id,
        type: l.type,
        origX: l.x,
        origY: l.y,
        origW: l.width,
        origH: l.height,
        origFontSize: (l as any).fontSize,
      })),
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current || !activeLayer) return;
      const h = resizeRef.current.handle;

      if (h === "rotate") {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = ((ev.clientX - rect.left) / rect.width) * screen.width;
        const my = ((ev.clientY - rect.top) / rect.height) * screen.height;

        const dx = mx - resizeRef.current.centerX;
        const dy = my - resizeRef.current.centerY;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        let deg = Math.round((angle * 180) / Math.PI);
        if (ev.shiftKey) {
          deg = Math.round(deg / 45) * 45;
        }

        updateLayer(screenSet.id, screen.id, activeLayer.id, {
          rotation: deg,
        } as Parameters<typeof updateLayer>[3]);
        return;
      }

      let dx = (ev.clientX - resizeRef.current.startX) / scale;
      let dy = (ev.clientY - resizeRef.current.startY) / scale;

      const rot = resizeRef.current.origRot;
      if (rot !== 0) {
        const rad = (-rot * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const unrotDx = dx * cos - dy * sin;
        const unrotDy = dx * sin + dy * cos;
        dx = unrotDx;
        dy = unrotDy;
      }

      const { origX, origY, origW, origH } = resizeRef.current;
      let nx = origX;
      let ny = origY;
      let nw = origW;
      let nh = origH;

      if (h === "e") {
        nw = Math.max(20, origW + dx);
      } else if (h === "w") {
        nw = Math.max(20, origW - dx);
        nx = origX + (origW - nw);
      } else if (h === "s") {
        nh = Math.max(20, origH + dy);
      } else if (h === "n") {
        nh = Math.max(20, origH - dy);
        ny = origY + (origH - nh);
      } else if (h === "se") {
        nw = Math.max(20, origW + dx);
        nh = Math.max(20, origH + dy);
      } else if (h === "sw") {
        nw = Math.max(20, origW - dx);
        nx = origX + (origW - nw);
        nh = Math.max(20, origH + dy);
      } else if (h === "ne") {
        nw = Math.max(20, origW + dx);
        nh = Math.max(20, origH - dy);
        ny = origY + (origH - nh);
      } else if (h === "nw") {
        nw = Math.max(20, origW - dx);
        nx = origX + (origW - nw);
        nh = Math.max(20, origH - dy);
        ny = origY + (origH - nh);
      }

      const scaleX = nw / origW;
      const scaleY = nh / origH;
      const avgScale = (scaleX + scaleY) / 2;

      if (resizeRef.current.groupLayers && resizeRef.current.groupLayers.length > 1) {
        resizeRef.current.groupLayers.forEach((gl) => {
          if (gl.id === activeLayer.id) {
            updateLayer(screenSet.id, screen.id, gl.id, {
              x: Math.round(nx),
              y: Math.round(ny),
              width: Math.round(nw),
              height: Math.round(nh),
            } as Parameters<typeof updateLayer>[3]);
          } else {
            const relX = (gl.origX - resizeRef.current!.origX) * scaleX;
            const relY = (gl.origY - resizeRef.current!.origY) * scaleY;
            const newW = Math.round(gl.origW * scaleX);
            const newH = Math.round(gl.origH * scaleY);
            const updates: any = {
              x: Math.round(nx + relX),
              y: Math.round(ny + relY),
              width: Math.max(10, newW),
              height: Math.max(10, newH),
            };
            if (gl.type === "text" && gl.origFontSize) {
              updates.fontSize = Math.max(8, Math.round(gl.origFontSize * avgScale));
            }
            updateLayer(screenSet.id, screen.id, gl.id, updates as Parameters<typeof updateLayer>[3]);
          }
        });
      } else {
        const updates: any = {
          x: Math.round(nx),
          y: Math.round(ny),
          width: Math.round(nw),
          height: Math.round(nh),
        };
        if (activeLayer.type === "text") {
          const origFontSize = resizeRef.current.groupLayers?.[0]?.origFontSize || (activeLayer as any).fontSize || 40;
          if (h === "se" || h === "sw" || h === "ne" || h === "nw") {
            updates.fontSize = Math.max(8, Math.round(origFontSize * avgScale));
          }
        }
        updateLayer(screenSet.id, screen.id, activeLayer.id, updates as Parameters<typeof updateLayer>[3]);
      }
    };

    const onUp = () => {
      if (resizeRef.current) {
        useEditorStore.getState().recordHistory();
      }
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return {
    snapGuides,
    hitTest,
    getCanvasCoords,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleContextMenu,
    handleResizeStart,
  };
}
