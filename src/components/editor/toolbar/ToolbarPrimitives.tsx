"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FONT_FAMILIES = [
  "Inter", "Roboto", "Poppins", "Montserrat", "Lato",
  "Oswald", "Raleway", "Nunito", "Playfair Display", "Merriweather",
  "Space Grotesk", "DM Sans", "Plus Jakarta Sans", "Outfit",
  "Bebas Neue", "Anton", "Syne", "Barlow", "Cabin",
];

export interface ToolbarBtnProps {
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}

export function ToolbarBtn({
  onClick,
  active,
  title,
  children,
  danger,
  className,
}: ToolbarBtnProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        type="button"
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
          active
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-primary/60 font-semibold scale-105"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground",
          danger && "hover:bg-destructive/15 text-muted-foreground hover:text-destructive",
          className
        )}
      >
        {children}
      </TooltipTrigger>
      {title && <TooltipContent>{title}</TooltipContent>}
    </Tooltip>
  );
}

export interface ToolbarNumInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  width?: string;
}

export function ToolbarNumInput({
  value,
  onChange,
  min,
  max,
  unit,
  width = "w-12",
}: ToolbarNumInputProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRaw(val);
    const n = parseFloat(val);
    if (!isNaN(n)) {
      const clamped = min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, n) : n) : n;
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      const clamped = min !== undefined ? Math.max(min, max !== undefined ? Math.min(max, n) : n) : n;
      onChange(clamped);
    } else {
      onChange(value);
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {editing ? (
        <div className="relative flex items-center">
          <input
            autoFocus
            type="number"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditing(false);
            }}
            className={cn(
              "bg-secondary border border-primary/50 rounded px-1 py-0.5 text-xs font-mono text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-foreground",
              width
            )}
          />
          {unit && <span className="text-[10px] text-muted-foreground ml-0.5 font-mono pointer-events-none">{unit}</span>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setRaw(String(Math.round(value))); setEditing(true); }}
          className={cn("text-xs font-mono text-center hover:bg-secondary rounded px-1.5 py-0.5 tabular-nums text-foreground font-medium transition-colors cursor-pointer", width)}
          title="Click to edit"
        >
          {Math.round(value)}{unit}
        </button>
      )}
    </div>
  );
}
