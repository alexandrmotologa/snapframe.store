"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollRailProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollStep?: number;
}

export function HorizontalScrollRail({
  children,
  className,
  contentClassName,
  scrollStep = 140,
}: HorizontalScrollRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => checkScroll());
    observer.observe(el);
    window.addEventListener("resize", checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScroll, 200);
  };

  return (
    <div className={cn("relative group/scroll flex items-center min-w-0 w-full select-none", className)}>
      {/* Scroll Left Button with gradient fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-card via-card/90 to-transparent flex items-center justify-start pl-0.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => scrollByAmount(-scrollStep)}
            aria-label="Scroll left"
            className="w-5 h-5 rounded-full bg-secondary/90 border border-border/70 shadow-xs flex items-center justify-center text-foreground hover:bg-secondary transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Scrollable track */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onScroll={checkScroll}
        className={cn(
          "w-full flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth",
          contentClassName
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Scroll Right Button with gradient fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-card via-card/90 to-transparent flex items-center justify-end pr-0.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => scrollByAmount(scrollStep)}
            aria-label="Scroll right"
            className="w-5 h-5 rounded-full bg-secondary/90 border border-border/70 shadow-xs flex items-center justify-center text-foreground hover:bg-secondary transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
