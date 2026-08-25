"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: string;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
}

/**
 * Displays or allows selecting star ratings with precise 0.5 half-star increments.
 */
export function RatingStars({
  rating,
  max = 5,
  size = "w-4 h-4",
  className = "text-amber-500",
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starIdx = i + 1;
        const diff = currentVal - i;

        return (
          <div
            key={i}
            className={cn(
              "relative select-none",
              interactive ? "cursor-pointer group" : "pointer-events-none"
            )}
          >
            {/* Background Empty Star */}
            <Star className={cn(size, "text-muted-foreground/30 stroke-1 transition-transform group-hover:scale-110")} />

            {/* Full / Partial Golden Star Overlay */}
            {diff >= 1 ? (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Star
                  className={cn(
                    size,
                    "fill-amber-500 text-amber-500 transition-transform group-hover:scale-110"
                  )}
                />
              </div>
            ) : diff >= 0.5 ? (
              <div className="absolute inset-0 overflow-hidden w-1/2 pointer-events-none">
                <Star
                  className={cn(
                    size,
                    "fill-amber-500 text-amber-500 transition-transform group-hover:scale-110"
                  )}
                />
              </div>
            ) : null}

            {/* Interactive Hit Zones (Left 50% for .5, Right 50% for 1.0) */}
            {interactive && (
              <>
                <button
                  type="button"
                  aria-label={`Rate ${starIdx - 0.5} stars`}
                  className="absolute inset-y-0 left-0 w-1/2 z-10 opacity-0 cursor-pointer"
                  onMouseEnter={() => setHoverRating(starIdx - 0.5)}
                  onClick={() => onRatingChange && onRatingChange(starIdx - 0.5)}
                />
                <button
                  type="button"
                  aria-label={`Rate ${starIdx} stars`}
                  className="absolute inset-y-0 right-0 w-1/2 z-10 opacity-0 cursor-pointer"
                  onMouseEnter={() => setHoverRating(starIdx)}
                  onClick={() => onRatingChange && onRatingChange(starIdx)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
