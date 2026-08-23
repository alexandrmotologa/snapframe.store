"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { CHARACTERS, Character, getCharacterSvgString } from "@/lib/characters";
import { CharacterLayer } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/lib/store/toastStore";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  happy: "😊 Happy",
  waving: "👋 Waving",
  celebrating: "🎉 Celebrating",
  thinking: "🤔 Thinking",
  working: "💻 Working",
  sitting: "🪑 Sitting",
  standing: "🧍 Standing",
};

const ORDERED_LIBRARIES = [
  "3D Mascots & Robots",
  "3D Emojis",
  "3D & Modern Avatars",
  "Avataaars",
  "Open Peeps",
  "Doodles & Sketches",
];

export function CharactersPanel() {
  const { getActiveSet, getActiveScreen, addLayer } = useEditorStore();

  const libraries = ORDERED_LIBRARIES.filter((lib) => CHARACTERS.some((c) => c.library === lib));
  const [activeLibrary, setActiveLibrary] = useState<string>(libraries[0] || "3D Mascots & Robots");

  const libraryCharacters = CHARACTERS.filter((c) => (c.library || "Open Peeps") === activeLibrary);

  const categories = ["all", ...Array.from(new Set(libraryCharacters.map((c) => c.category)))];
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? libraryCharacters : libraryCharacters.filter((c) => c.category === filter);

  const handleAdd = async (char: Character) => {
    const activeSet = getActiveSet();
    const activeScreen = getActiveScreen();
    if (!activeSet || !activeScreen) {
      toast.error("Select a screen first to place character");
      return;
    }

    const pose = char.poses[0];
    if (!pose) return;

    let svgContent = getCharacterSvgString(char.id, pose.id);

    if (svgContent.startsWith("http")) {
      const proxyUrl = `/api/proxy-svg?url=${encodeURIComponent(svgContent)}`;
      try {
        const res = await fetch(proxyUrl);
        if (res.ok) {
          svgContent = await res.text();
        } else {
          svgContent = proxyUrl;
        }
      } catch {
        svgContent = proxyUrl;
      }
    }

    const layer: CharacterLayer = {
      id: nanoid(),
      type: "character",
      characterId: char.id,
      poseId: pose.id,
      svgContent,
      x: Math.round(activeScreen.width / 2 - 140),
      y: Math.round(activeScreen.height / 2 - 175),
      width: 280,
      height: 350,
      rotation: 0,
      opacity: 1,
    };

    addLayer(activeSet.id, activeScreen.id, layer as import("@/lib/types").Layer);
    useEditorStore.getState().recordHistory();
    toast.success(`Added ${char.name} to canvas!`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Library horizontal scroll tabs */}
      <div className="px-2 py-1 border-b border-border/40 bg-secondary/20 shrink-0">
        <HorizontalScrollRail>
          {libraries.map((lib) => (
            <button
              key={lib}
              type="button"
              onClick={(e) => {
                setActiveLibrary(lib);
                setFilter("all");
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={cn(
                "shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border shadow-2xs",
                activeLibrary === lib
                  ? "bg-primary text-primary-foreground border-primary/60 shadow-xs font-semibold"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary border-border/40"
              )}
            >
              {lib}
            </button>
          ))}
        </HorizontalScrollRail>
      </div>

      {/* Category filter — horizontal scroll */}
      <div className="px-2 py-1 border-b border-border/40 shrink-0 bg-card/40">
        <HorizontalScrollRail>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                setFilter(cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={cn(
                "shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer border",
                filter === cat
                  ? "bg-indigo-600 text-white border-indigo-500 font-semibold shadow-xs"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border-border/30 active:scale-95"
              )}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </HorizontalScrollRail>
      </div>

      {/* Character grid */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2.5">
          {filtered.map((char) => {
            const pose = char.poses[0];
            if (!pose) return null;
            const svgStr = getCharacterSvgString(char.id, pose.id);
            const directUrl = svgStr.startsWith("http") ? svgStr : null;
            const previewUrl = directUrl
              ? `/api/proxy-svg?url=${encodeURIComponent(directUrl)}`
              : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;

            return (
              <button
                key={char.id}
                type="button"
                onClick={() => handleAdd(char)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border/40 cursor-pointer",
                  "bg-secondary/30 hover:bg-secondary/70 hover:border-primary/40 transition-all hover:scale-[1.02]",
                  "focus-visible:ring-2 focus-visible:ring-primary"
                )}
                title={`Add ${char.name} — ${char.description}`}
              >
                {/* Character preview */}
                <div className="w-full aspect-[4/5] rounded-lg bg-background/50 border border-border/30 overflow-hidden flex items-center justify-center relative p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={char.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      if (directUrl) {
                        (e.target as HTMLImageElement).src = directUrl;
                      }
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-primary-foreground bg-primary/90 px-2 py-0.5 rounded-md shadow-xs">
                      + Add
                    </span>
                  </div>
                </div>
                <span className="text-[10.5px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-full">
                  {char.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Info footer */}
        <div className="px-3 pb-3 pt-2">
          <p className="text-[10px] text-muted-foreground text-center">
            {filtered.length} characters in {activeLibrary} · Vector SVG
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
