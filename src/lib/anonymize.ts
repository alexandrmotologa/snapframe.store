/**
 * Anonymizes a person's display name for privacy while maintaining authentic credibility.
 * Rules:
 * - Each word (first name, last name, etc.) takes the first 3 characters + 5 asterisks (*****).
 * - If a part is shorter than 3 characters (e.g. "Li"), it takes the whole part + 5 asterisks (e.g. "Li*****").
 * - Examples:
 *   - "Alexandr Motologa" -> "Ale***** Mot*****"
 *   - "Sarah Kim" -> "Sar***** Kim*****"
 *   - "Marcus" -> "Mar*****"
 *   - "Al" -> "Al*****"
 */
export function anonymizeName(name?: string | null): string {
  if (!name || typeof name !== "string") {
    return "Cre***** Use*****";
  }

  const cleaned = name.trim();
  if (!cleaned) return "Cre***** Use*****";

  // Split by whitespace
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "Cre***** Use*****";

  const anonymizedParts = parts.map((part) => {
    // Keep first 3 letters (or full part if <= 3 chars)
    const prefix = part.slice(0, Math.min(3, part.length));
    return `${prefix}*****`;
  });

  return anonymizedParts.join(" ");
}
