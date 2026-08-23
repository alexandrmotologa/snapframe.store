"use client";

import { useState, useRef, memo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";
import { cn } from "@/lib/utils";
import { ScreenThumbnailCanvas } from "@/components/editor/ScreenThumbnailCanvas";
import { AppleStoreIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import { isTabletDevice, ALL_DEVICES } from "@/lib/devices";

export const ScreenStrip = memo(function ScreenStrip() {
  const {
    screenSets,
    activeSetId,
    activeScreenId,
    setActiveSet,
    setActiveScreen,
    addScreen,
    deleteScreen,
  } = useEditorStore();

  const [isCompact, setIsCompact] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("snapframe_strip_compact");
        if (saved !== null) return saved === "true";
      } catch {
        // Ignored
      }
    }
    return true;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("snapframe_strip_compact", String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleSelectScreen = (setId: string, screenId: string) => {
    setActiveSet(setId);
    setActiveScreen(screenId);

    // Scroll to the screen card in the main canvas if found
    const targetCard = document.querySelector(`[data-screen-id="${screenId}"]`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <div
      className={cn(
        "relative border-t border-border/60 bg-card/85 backdrop-blur-md flex items-center justify-between shrink-0 px-2 z-20 transition-all duration-300 ease-in-out select-none",
        isCompact ? "h-10" : "h-28"
      )}
    >
      {/* ── Scroll Left Button (if multiple sets) ── */}
      {screenSets.length > 2 && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 mr-1 cursor-pointer transition-colors"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* ── Screen Sets & Thumbnails Scroll Area ── */}
      <div
        ref={scrollRef}
        onWheel={(e) => {
          if (scrollRef.current && e.deltaY) {
            scrollRef.current.scrollLeft += e.deltaY;
          }
        }}
        className="flex items-center gap-0 overflow-x-auto flex-1 min-w-0 pr-3 py-1 scroll-smooth scrollbar-thin scrollbar-thumb-border/50 hover:scrollbar-thumb-border"
      >
        {screenSets.map((ss) => {
          const isIOS = ss.store === "ios";
          const isTablet = isTabletDevice(ss.deviceId);
          const isSetActive = activeSetId === ss.id;
          const deviceObj = ALL_DEVICES.find((d) => d.id === ss.deviceId);

          const badgeLabel = isIOS
            ? isTablet ? "iPad" : "iPhone"
            : isTablet ? "Android Tab" : "Android";

          return (
            <div key={ss.id} className="flex items-center gap-2 mr-6 shrink-0">
              {/* Store Badge Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-semibold tracking-wide px-2.5 rounded-lg cursor-pointer transition-all border shadow-2xs",
                    isCompact ? "py-0.5" : "py-1",
                    isSetActive
                      ? isIOS
                        ? isTablet
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 ring-1 ring-indigo-500/30"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30"
                        : isTablet
                        ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/40 ring-1 ring-teal-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30"
                      : "bg-secondary text-muted-foreground hover:text-foreground border-border/50 hover:bg-secondary/80"
                  )}
                  onClick={() => {
                    setActiveSet(ss.id);
                    if (ss.screens[0]) setActiveScreen(ss.screens[0].id);
                  }}
                  title={`${deviceObj?.name || badgeLabel} — ${ss.screens.length} of 10 screenshots`}
                >
                  {isIOS ? (
                    <AppleStoreIcon className="w-3 h-3 shrink-0" />
                  ) : (
                    <GooglePlayIcon className="w-3 h-3 shrink-0" />
                  )}
                  <span>{badgeLabel}</span>
                  <span
                    className={cn(
                      "text-[9px] font-mono font-bold px-1 py-0.2 rounded ml-0.5",
                      ss.screens.length >= 10
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                        : "bg-background/80 dark:bg-black/40 text-foreground border border-border/40"
                    )}
                  >
                    {ss.screens.length}/10
                  </span>
                </button>
              </div>

              {/* ── Screen Items: Expanded (Cards) vs Compact (Pills) ── */}
              <div className="flex items-center gap-1.5">
                {ss.screens.map((screen, idx) => {
                  const isActive = activeSetId === ss.id && activeScreenId === screen.id;

                  // ── COMPACT MODE: Sleek Number Pill ──
                  if (isCompact) {
                    return (
                      <button
                        key={screen.id}
                        type="button"
                        onClick={() => handleSelectScreen(ss.id, screen.id)}
                        title={screen.name || `Screen ${idx + 1}`}
                        className={cn(
                          "group relative h-6 min-w-[28px] px-2 rounded-md font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary/60 shadow-xs ring-1 ring-primary/40 font-bold scale-105"
                            : "bg-secondary/80 text-muted-foreground hover:text-foreground border-border/50 hover:bg-secondary"
                        )}
                      >
                        {/* Mini colored gradient dot indicating screen background */}
                        <span
                          className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                          style={{
                            background:
                              screen.background?.type === "gradient" && screen.background.gradient?.stops?.[0]?.color
                                ? screen.background.gradient.stops[0].color
                                : screen.background?.type === "solid" && screen.background.color
                                ? screen.background.color
                                : "#6366f1",
                          }}
                        />
                        <span>{idx + 1}</span>
                      </button>
                    );
                  }

                  // ── EXPANDED MODE: Rich Live Canvas Cards ──
                  return (
                    <button
                      key={screen.id}
                      id={`screen-thumb-${screen.id}`}
                      type="button"
                      title={screen.name || `Screen ${idx + 1}`}
                      onClick={() => handleSelectScreen(ss.id, screen.id)}
                      className={cn(
                        "group relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 bg-background shadow-xs",
                        "w-[42px] h-[82px]",
                        isActive
                          ? "ring-2 ring-primary shadow-md shadow-primary/30 scale-105 border border-primary/50"
                          : "border border-border/70 hover:border-primary/50 hover:scale-105"
                      )}
                    >
                      {/* Live Rendered Canvas Thumbnail */}
                      <div className="w-full h-full pointer-events-none overflow-hidden">
                        <ScreenThumbnailCanvas
                          screen={screen}
                          screenSet={ss}
                          width={42}
                          height={82}
                        />
                      </div>

                      {/* Glassmorphic Screen Number Badge */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-background/85 dark:bg-black/75 backdrop-blur-xs py-0.5 pointer-events-none border-t border-border/30">
                        <span className="text-[9px] text-foreground dark:text-white/95 font-bold font-mono">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Delete Screen Button */}
                      {ss.screens.length > 1 && (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteScreen(ss.id, screen.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              deleteScreen(ss.id, screen.id);
                            }
                          }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Delete screen"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Add Screen Button */}
                {ss.screens.length < 10 && (
                  <button
                    id={`add-screen-strip-${ss.id}`}
                    type="button"
                    title={`Add Screen (${ss.screens.length}/10)`}
                    onClick={() => addScreen(ss.id)}
                    className={cn(
                      "rounded-xl border-2 border-dashed border-slate-400/60 dark:border-slate-600/80 hover:border-primary dark:hover:border-primary bg-secondary/40 hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shrink-0 cursor-pointer shadow-2xs group",
                      isCompact ? "h-6 px-2 text-xs gap-1 font-semibold" : "w-[42px] h-[82px] flex-col gap-1"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    {!isCompact && (
                      <span className="text-[8px] font-mono font-bold opacity-80 group-hover:text-primary">
                        {ss.screens.length}/10
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scroll Right Button (if multiple sets) ── */}
      {screenSets.length > 2 && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 mx-1 cursor-pointer transition-colors"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Toggle Compact / Expanded Height Button ── */}
      <div className="flex items-center pl-1 shrink-0 border-l border-border/40">
        <button
          type="button"
          onClick={toggleCompact}
          className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40 transition-colors shadow-2xs cursor-pointer select-none"
          title={isCompact ? "Expand filmstrip (Show thumbnails)" : "Compact filmstrip (More workspace space)"}
        >
          {isCompact ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline text-[11px]">Expand</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline text-[11px]">Compact</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});
