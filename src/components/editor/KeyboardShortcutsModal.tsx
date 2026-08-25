"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    name: "Quick Tool Creation",
    shortcuts: [
      { key: "T", label: "Add Text Layer" },
      { key: "S", label: "Add Shape Layer" },
      { key: "M", label: "Add Device Mockup Layer" },
      { key: "V / Esc", label: "Select Mode / Deselect" },
    ],
  },
  {
    name: "General & Canvas",
    shortcuts: [
      { key: "Ctrl + Z", label: "Undo last change" },
      { key: "Ctrl + Y / Shift + Ctrl + Z", label: "Redo change" },
      { key: "Ctrl + =", label: "Zoom In" },
      { key: "Ctrl + -", label: "Zoom Out" },
      { key: "Ctrl + 0", label: "Reset Zoom (Fit)" },
      { key: "?", label: "Show Keyboard Shortcuts" },
    ],
  },
  {
    name: "Layer Manipulation",
    shortcuts: [
      { key: "Ctrl + D", label: "Duplicate selected layer" },
      { key: "Delete / Backspace", label: "Delete selected layer" },
      { key: "Arrow Keys", label: "Nudge layer position (1px)" },
      { key: "Shift + Arrow Keys", label: "Fast nudge layer position (10px)" },
      { key: "Shift + Click", label: "Multi-select layers" },
      { key: "Double Click Text", label: "Direct inline text edit" },
      { key: "Ctrl + V / Cmd + V", label: "Paste screenshot directly into device frame" },
      { key: "Drag from files", label: "Drop image/screenshot onto canvas" },
      { key: "Right Click", label: "Layer context menu (ordering, lock)" },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-6 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 border-b border-border/50 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Speed up your workflow with standard editor keybindings.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {SHORTCUT_GROUPS.map((grp) => (
            <div key={grp.name} className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {grp.name}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {grp.shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-secondary/50 border border-border/40 text-xs"
                  >
                    <span className="text-foreground/90 font-medium">{sc.label}</span>
                    <kbd className="px-2 py-1 rounded-md bg-background border border-border/60 text-[11px] font-mono font-semibold text-foreground shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
