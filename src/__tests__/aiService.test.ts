import { describe, it, expect } from "vitest";
import { trimToLimit, getAIKeys } from "@/lib/ai/aiService";

describe("aiService", () => {
  describe("trimToLimit", () => {
    it("returns empty string for falsy input", () => {
      expect(trimToLimit("", 30)).toBe("");
    });

    it("returns text unchanged if within limit", () => {
      const text = "Short text";
      expect(trimToLimit(text, 30)).toBe("Short text");
    });

    it("trims at word boundaries when possible", () => {
      const text = "SnapFrame creates stunning high-conversion screenshots for App Store";
      const trimmed = trimToLimit(text, 30);
      expect(trimmed.length).toBeLessThanOrEqual(30);
      // Shouldn't end with a broken partial word if space is available
      expect(trimmed).not.toContain("   ");
    });

    it("handles strings without spaces", () => {
      const text = "Supercalifragilisticexpialidocious";
      const trimmed = trimToLimit(text, 10);
      expect(trimmed.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getAIKeys", () => {
    it("returns an object with all expected provider keys", () => {
      const keys = getAIKeys();
      expect(keys).toHaveProperty("gemini");
      expect(keys).toHaveProperty("openai");
      expect(keys).toHaveProperty("groq");
      expect(keys).toHaveProperty("mistral");
      expect(keys).toHaveProperty("xai");
    });
  });
});
