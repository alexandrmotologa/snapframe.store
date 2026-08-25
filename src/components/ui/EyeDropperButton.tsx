"use client";

import React, { useState, useEffect } from "react";
import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils";

interface EyeDropperButtonProps {
  onPickColor: (color: string) => void;
  className?: string;
  size?: "xs" | "sm" | "default" | "icon" | "icon-xs" | "icon-sm";
  title?: string;
}

export function EyeDropperButton({
  onPickColor,
  className,
  size = "icon-xs",
  title = "Pick color from screen (EyeDropper)",
}: EyeDropperButtonProps) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      setIsSupported(true);
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  const handlePickColor = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const EyeDropperClass = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const eyeDropper = new EyeDropperClass();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        onPickColor(result.sRGBHex);
        toast.success(`Picked color: ${result.sRGBHex.toUpperCase()}`);
      }
    } catch {
      // User canceled eyedropper with Esc — ignore gracefully
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handlePickColor}
      title={title}
      className={cn(
        "cursor-pointer text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors shrink-0",
        className
      )}
    >
      <Pipette className="w-3.5 h-3.5" />
      <span className="sr-only">Pick color from screen</span>
    </Button>
  );
}
