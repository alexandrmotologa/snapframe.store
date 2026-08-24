import React, { useRef, useEffect } from "react";
import { Layer, Screen, ScreenSet, TextLayer } from "@/lib/types";
import { useEditorStore } from "@/lib/store/editorStore";
import { toast } from "@/lib/store/toastStore";

interface InlineTextEditorProps {
  editingLayerId: string;
  editText: string;
  screen: Screen;
  screenSet: ScreenSet;
  scale: number;
  cardDisplayWidth: number;
  displayHeight: number;
  onTextChange: (text: string) => void;
  onClose: () => void;
}

export function InlineTextEditor({
  editingLayerId,
  editText,
  screen,
  screenSet,
  scale,
  cardDisplayWidth,
  displayHeight,
  onTextChange,
  onClose,
}: InlineTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateLayer } = useEditorStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const editLayer = screen.layers.find((l) => l.id === editingLayerId) as TextLayer | undefined;
  if (!editLayer) return null;

  const handleSave = () => {
    updateLayer(screenSet.id, screen.id, editingLayerId, { content: editText } as Partial<Layer>);
    onClose();
    toast.success("Text updated");
  };

  return (
    <div
      className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto"
      onClick={onClose}
    >
      <textarea
        ref={textareaRef}
        autoFocus
        value={editText}
        onChange={(e) => onTextChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
        }}
        style={{
          position: "absolute",
          left: Math.max(6, Math.min(editLayer.x * scale, cardDisplayWidth - 140)),
          top: Math.max(6, Math.min(editLayer.y * scale, displayHeight - 60)),
          width: Math.min(cardDisplayWidth - 16, Math.max(140, editLayer.width * scale)),
          minHeight: Math.max(48, editLayer.height * scale),
          fontSize: Math.max(13, editLayer.fontSize * scale),
          fontFamily: `"${editLayer.fontFamily}", sans-serif`,
          fontWeight: editLayer.fontWeight,
          color: editLayer.color,
          textAlign: editLayer.align,
          lineHeight: editLayer.lineHeight,
          letterSpacing: `${editLayer.letterSpacing * scale}px`,
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(12px)",
          border: "2px solid #6366f1",
          borderRadius: 8,
          outline: "none",
          resize: "none",
          padding: "6px 10px",
          boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(99, 102, 241, 0.4)",
          zIndex: 50,
        }}
      />
      <div className="absolute bottom-2.5 inset-x-2 flex items-center justify-center pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-black/80 text-white/90 text-[10px] font-medium shadow-md">
          ↵ Enter to save · Shift+↵ for new line · Esc to cancel
        </span>
      </div>
    </div>
  );
}
