import { describe, it, expect } from "vitest";
import { anonymizeName } from "@/lib/anonymize";

describe("anonymizeName", () => {
  it("anonymizes standard first and last name", () => {
    expect(anonymizeName("Alexandr Motologa")).toBe("Ale***** Mot*****");
    expect(anonymizeName("Sarah Kim")).toBe("Sar***** Kim*****");
    expect(anonymizeName("Marcus Lindqvist")).toBe("Mar***** Lin*****");
  });

  it("handles single word names", () => {
    expect(anonymizeName("Alexander")).toBe("Ale*****");
    expect(anonymizeName("John")).toBe("Joh*****");
  });

  it("handles short names (< 3 chars)", () => {
    expect(anonymizeName("Al")).toBe("Al*****");
    expect(anonymizeName("Bo Li")).toBe("Bo***** Li*****");
  });

  it("handles multiple words (> 2 parts)", () => {
    expect(anonymizeName("John Paul Jones")).toBe("Joh***** Pau***** Jon*****");
  });

  it("handles null, undefined and empty strings safely", () => {
    expect(anonymizeName(null)).toBe("Cre***** Use*****");
    expect(anonymizeName(undefined)).toBe("Cre***** Use*****");
    expect(anonymizeName("")).toBe("Cre***** Use*****");
    expect(anonymizeName("   ")).toBe("Cre***** Use*****");
  });
});
