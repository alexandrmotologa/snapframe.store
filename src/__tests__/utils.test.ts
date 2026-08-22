import { describe, it, expect } from "vitest";
import { cn, nanoid, formatDate, backgroundToCSS } from "@/lib/utils";
import type { Background } from "@/lib/types";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
    });

    it("resolves tailwind conflicts using tailwind-merge", () => {
      expect(cn("px-2 px-4", "text-sm text-lg")).toBe("px-4 text-lg");
    });

    it("handles conditional class values", () => {
      const isHidden = false;
      const isActive = true;
      expect(cn("base", isHidden && "hidden", isActive && "active")).toBe("base active");
    });
  });

  describe("nanoid", () => {
    it("generates a string of the requested length", () => {
      const id12 = nanoid(12);
      expect(id12).toHaveLength(12);

      const id20 = nanoid(20);
      expect(id20).toHaveLength(20);
    });

    it("generates unique strings on repeated calls", () => {
      const set = new Set<string>();
      for (let i = 0; i < 100; i++) {
        set.add(nanoid(12));
      }
      expect(set.size).toBe(100);
    });
  });

  describe("formatDate", () => {
    it("formats timestamps within 1 minute as 'just now'", () => {
      const now = Date.now();
      expect(formatDate(now - 10_000)).toBe("just now");
    });

    it("formats minutes ago", () => {
      const now = Date.now();
      expect(formatDate(now - 5 * 60_000)).toBe("5m ago");
    });

    it("formats hours ago", () => {
      const now = Date.now();
      expect(formatDate(now - 3 * 3_600_000)).toBe("3h ago");
    });

    it("formats days ago", () => {
      const now = Date.now();
      expect(formatDate(now - 2 * 86_400_000)).toBe("2d ago");
    });
  });

  describe("backgroundToCSS", () => {
    it("converts solid color background", () => {
      const solid: Background = { type: "solid", color: "#10b981" };
      expect(backgroundToCSS(solid)).toBe("#10b981");
    });

    it("converts linear gradient background", () => {
      const grad: Background = {
        type: "gradient",
        gradient: {
          direction: "to-r",
          stops: [
            { color: "#000", position: 0 },
            { color: "#fff", position: 100 },
          ],
        },
      };
      expect(backgroundToCSS(grad)).toBe("linear-gradient(to right, #000 0%, #fff 100%)");
    });

    it("converts image background", () => {
      const img: Background = {
        type: "image",
        imageUrl: "https://example.com/bg.png",
      };
      expect(backgroundToCSS(img)).toBe("url(https://example.com/bg.png)");
    });

    it("falls back to default dark color for unconfigured backgrounds", () => {
      const empty = {} as Background;
      expect(backgroundToCSS(empty)).toBe("#1e1b4b");
    });
  });
});
