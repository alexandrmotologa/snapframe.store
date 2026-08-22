"use client";

import { useState, useMemo, memo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FLAGS, POPULAR_FLAGS, FlagItem } from "@/lib/flags";

export const FlagsPanel = memo(function FlagsPanel() {
  const [query, setQuery] = useState("");
  const { getActiveSet, getActiveScreen, addLayer } = useEditorStore();

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show popular first then rest
      const popular = POPULAR_FLAGS.map((code) => FLAGS.find((f) => f.code === code)!).filter(Boolean);
      const rest = FLAGS.filter((f) => !POPULAR_FLAGS.includes(f.code));
      return [...popular, ...rest];
    }
    const q = query.toLowerCase();
    return FLAGS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleAdd = (flag: FlagItem) => {
    const set = getActiveSet();
    const screen = getActiveScreen();
    if (!set || !screen) return;

    const proxyUrl = `/_next/image?url=${encodeURIComponent(`https://flagcdn.com/w160/${flag.code.toLowerCase()}.png`)}&w=256&q=75`;

    addLayer(set.id, screen.id, {
      type: "image" as const,
      src: proxyUrl,
      x: Math.round(screen.width / 2 - 80),
      y: Math.round(screen.height / 2 - 50),
      width: 160,
      height: 110,
      rotation: 0,
      opacity: 1,
    } as Parameters<typeof addLayer>[2]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            id="flags-search"
            placeholder="Search country or code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-4 gap-1.5">
          {filtered.map((flag) => (
            <button
              key={flag.code}
              onClick={() => handleAdd(flag)}
              title={flag.name}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-secondary transition-all group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/_next/image?url=${encodeURIComponent(`https://flagcdn.com/w40/${flag.code.toLowerCase()}.png`)}&w=64&q=75`}
                alt={flag.name}
                className="w-8 object-contain rounded-[2px] shadow-sm"
              />
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium truncate w-full text-center">
                {flag.name}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
