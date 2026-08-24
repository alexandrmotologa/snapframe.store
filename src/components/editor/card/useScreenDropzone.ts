import React, { useState } from "react";
import { Screen, ScreenSet, Layer, ImageLayer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";

interface UseScreenDropzoneProps {
  screen: Screen;
  screenSet: ScreenSet;
  getCanvasCoords: (e: React.MouseEvent<HTMLCanvasElement>) => { x: number; y: number };
  hitTest: (cx: number, cy: number) => string | null;
}

export function useScreenDropzone({
  screen,
  screenSet,
  getCanvasCoords,
  hitTest,
}: UseScreenDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { updateLayer, addLayer, addProjectAsset, recordHistory } = useEditorStore();

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (!src) return;

        addProjectAsset({ name: file.name, dataUrl: src });
        const { x, y } = getCanvasCoords(e as unknown as React.MouseEvent<HTMLCanvasElement>);
        const hit = hitTest(x, y);

        if (hit) {
          const layer = screen.layers.find((l) => l.id === hit);
          if (layer?.type === "screenshot") {
            updateLayer(screenSet.id, screen.id, hit, { src } as Partial<Layer>);
            recordHistory();
            toast.success("Screenshot placed & added to Media Assets!");
          } else if (layer?.type === "image") {
            updateLayer(screenSet.id, screen.id, hit, { src } as Partial<Layer>);
            recordHistory();
            toast.success("Image placed & added to Media Assets!");
          }
        } else {
          const layer = {
            type: "image",
            x: x - 250,
            y: y - 250,
            width: 500,
            height: 500,
            src,
            rotation: 0,
            opacity: 1,
            cornerRadius: 0,
          } as Omit<ImageLayer, "id">;
          addLayer(screenSet.id, screen.id, layer);
          recordHistory();
          toast.success("Image added to canvas & Media Assets!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    isDraggingOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
