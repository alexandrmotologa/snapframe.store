"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/lib/store/editorStore";
import { cn } from "@/lib/utils";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

// ── Built-in emoji sticker packs ──────────────────────────────────────────────
const STICKER_CATEGORIES = [
  {
    name: "Smileys",
    stickers: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","😍","🥰","😘","😜","🤩","🥳","😎","🤓","😏"],
  },
  {
    name: "Nature",
    stickers: ["🌸","🌺","🌻","🌹","🌷","🍀","🌿","🍃","🌱","🌲","🌴","🌵","🎋","🍄","🌾","🌊","🔥","⭐","✨","💫"],
  },
  {
    name: "Animals",
    stickers: ["🐶","🐱","🐻","🐼","🦊","🐸","🐧","🦁","🐯","🐨","🦄","🐙","🦋","🦜","🐬","🦩","🦚","🐺","🦝","🐇"],
  },
  {
    name: "Objects",
    stickers: ["💎","🏆","🎯","🎨","🎭","🎪","🎠","🎡","🎢","🎪","🎰","🎲","🎮","🕹️","🎸","🎹","🎺","🎻","🥁","🎤"],
  },
  {
    name: "Symbols",
    stickers: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","❤️‍🔥","💝","💖","💗","💓","💞","💕","💟","☮️","✌️","🤞","👍"],
  },
  {
    name: "Food",
    stickers: ["🍕","🍔","🍟","🌮","🍜","🍣","🍩","🍪","🎂","🍫","☕","🧋","🍵","🥤","🍺","🥂","🍾","🧁","🍭","🍬"],
  },
  {
    name: "Travel",
    stickers: ["✈️","🚀","🛸","🚁","🚂","🚢","🏖️","🏔️","🗺️","🧭","🏕️","🎡","🎪","🏰","🗼","🗽","🎑","🌅","🌄","🌠"],
  },
  {
    name: "Activities",
    stickers: ["🏋️","🤸","🧘","🏊","🚴","⚽","🏀","🎾","🏐","🎱","🎳","🏇","🤺","🥊","🏹","🧗","🤾","🏄","🤽","🏌️"],
  },
];

const ALL_STICKERS = STICKER_CATEGORIES.flatMap((c) => c.stickers.map((s) => ({ emoji: s, category: c.name })));

// ── Sticker size when added to canvas ─────────────────────────────────────────
const STICKER_SIZE = 200; // px in canvas coordinates

export function StickersPanel() {
  const { getActiveSet, getActiveScreen, addLayer } = useEditorStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const activeSet = getActiveSet();
  const activeScreen = getActiveScreen();

  const categories = ["All", ...STICKER_CATEGORIES.map((c) => c.name)];

  const filtered = useMemo(() => {
    let items = activeCategory === "All"
      ? ALL_STICKERS
      : ALL_STICKERS.filter((s) => s.category === activeCategory);
    if (query.trim()) {
      // Simple text filter (emojis don't have names, so we match category)
      const q = query.toLowerCase();
      items = items.filter((s) => s.category.toLowerCase().includes(q));
    }
    return items;
  }, [query, activeCategory]);

  const handleAddSticker = (emoji: string) => {
    if (!activeSet || !activeScreen) return;
    // Place sticker in center of canvas
    const x = Math.round((activeScreen.width - STICKER_SIZE) / 2);
    const y = Math.round((activeScreen.height - STICKER_SIZE) / 2);
    addLayer(activeSet.id, activeScreen.id, {
      type: "text",
      content: emoji,
      x,
      y,
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      fontSize: 160,
      fontFamily: "system-ui",
      fontWeight: 400,
      color: "#ffffff",
      align: "center",
      lineHeight: 1,
      letterSpacing: 0,
      rotation: 0,
      opacity: 1,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/70 border border-border/30">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search stickers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-border/30 px-2 py-1 bg-card/40">
        <HorizontalScrollRail>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                setActiveCategory(cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95"
              )}
            >
              {cat}
            </button>
          ))}
        </HorizontalScrollRail>
      </div>

      {/* No active screen warning */}
      {(!activeSet || !activeScreen) && (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 p-4 text-center">
          <span className="text-4xl">🎨</span>
          <p className="text-xs text-muted-foreground">Select a screen to add stickers</p>
        </div>
      )}

      {/* Sticker grid */}
      {activeSet && activeScreen && (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 grid grid-cols-5 gap-1.5">
            {filtered.map((s, i) => (
              <button
                key={`${s.emoji}-${i}`}
                type="button"
                onClick={() => handleAddSticker(s.emoji)}
                title={`Add ${s.emoji} — ${s.category}`}
                className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-secondary transition-colors hover:scale-110 active:scale-95"
              >
                {s.emoji}
              </button>
            ))}
          </div>
          <div className="pb-4 text-center text-[10px] text-muted-foreground/50">
            Click any sticker to add it to the canvas
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
