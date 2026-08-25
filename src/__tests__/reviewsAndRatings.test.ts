import { describe, it, expect } from "vitest";

function computeHalfStarRating(raw: any): number {
  const num = Number(raw) || 5;
  return Math.min(5, Math.max(1, Math.round(num * 2) / 2));
}

describe("Half-Star Rating Engine & Validation", () => {
  it("should preserve exact half-star ratings", () => {
    expect(computeHalfStarRating(4.5)).toBe(4.5);
    expect(computeHalfStarRating(3.5)).toBe(3.5);
    expect(computeHalfStarRating(2.5)).toBe(2.5);
    expect(computeHalfStarRating(1.5)).toBe(1.5);
  });

  it("should round intermediate decimal ratings to nearest half-star", () => {
    expect(computeHalfStarRating(4.6)).toBe(4.5);
    expect(computeHalfStarRating(4.75)).toBe(5.0);
    expect(computeHalfStarRating(4.24)).toBe(4.0);
    expect(computeHalfStarRating(4.3)).toBe(4.5);
    expect(computeHalfStarRating(3.8)).toBe(4.0);
    expect(computeHalfStarRating(3.2)).toBe(3.0);
  });

  it("should enforce boundaries between 1.0 and 5.0 stars", () => {
    expect(computeHalfStarRating(6.5)).toBe(5.0);
    expect(computeHalfStarRating(10)).toBe(5.0);
    expect(computeHalfStarRating(0)).toBe(5.0); // Default fallback
    expect(computeHalfStarRating(-2)).toBe(1.0);
    expect(computeHalfStarRating(0.5)).toBe(1.0);
  });

  it("should handle string and invalid numerical inputs gracefully", () => {
    expect(computeHalfStarRating("4.5")).toBe(4.5);
    expect(computeHalfStarRating("3.5")).toBe(3.5);
    expect(computeHalfStarRating("invalid")).toBe(5.0);
    expect(computeHalfStarRating(null)).toBe(5.0);
    expect(computeHalfStarRating(undefined)).toBe(5.0);
  });
});
