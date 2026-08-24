import { describe, it, expect } from "vitest";
import {
  getTemplateScore,
  sortAndFilterTemplates,
} from "@/lib/templatePopularity";
import type { Template } from "@/lib/types";


const MOCK_TEMPLATES: Template[] = [
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Sleek dark theme",
    category: "Minimal",
    tags: ["dark", "clean"],
    previewColor: "#000",
    layout: "screenshot-top",
    screens: [],
  },
  {
    id: "clean-light",
    name: "Clean Light",
    description: "Crisp white layout",
    category: "Light",
    tags: ["white", "minimal"],
    previewColor: "#fff",
    layout: "screenshot-bottom",
    screens: [],
  },
  {
    id: "community-amber-sonic-flow",
    name: "Amber Sonic",
    description: "Sonic audio community preset",
    category: "Audio",
    tags: ["community", "music"],
    previewColor: "#f59e0b",
    layout: "screenshot-full",
    screens: [],
  },
];

describe("templatePopularity", () => {
  describe("getTemplateScore", () => {
    it("returns base score when global counts are empty", () => {
      const score = getTemplateScore("dark-minimal", {});
      expect(score).toBe(95);
    });

    it("increases score with global popularity count", () => {
      const scoreWithGlobal = getTemplateScore("dark-minimal", { "dark-minimal": 5 });
      expect(scoreWithGlobal).toBe(95 + 5 * 10);
    });

    it("uses fallback base score for unknown templates", () => {
      const score = getTemplateScore("unknown-template", {});
      expect(score).toBe(50);
    });
  });

  describe("sortAndFilterTemplates", () => {
    it("filters templates by search query matching name", () => {
      const result = sortAndFilterTemplates(MOCK_TEMPLATES, "Amber", "popularity");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("community-amber-sonic-flow");
    });

    it("filters templates by tag", () => {
      const result = sortAndFilterTemplates(MOCK_TEMPLATES, "music", "popularity");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("community-amber-sonic-flow");
    });

    it("sorts by name ascending", () => {
      const result = sortAndFilterTemplates(MOCK_TEMPLATES, "", "name-asc");
      expect(result.map((t) => t.name)).toEqual(["Amber Sonic", "Clean Light", "Dark Minimal"]);
    });

    it("sorts by name descending", () => {
      const result = sortAndFilterTemplates(MOCK_TEMPLATES, "", "name-desc");
      expect(result.map((t) => t.name)).toEqual(["Dark Minimal", "Clean Light", "Amber Sonic"]);
    });

    it("sorts by popularity descending by default", () => {
      const result = sortAndFilterTemplates(MOCK_TEMPLATES, "", "popularity");
      expect(result[0].id).toBe("community-amber-sonic-flow"); // seed 160
    });
  });
});
