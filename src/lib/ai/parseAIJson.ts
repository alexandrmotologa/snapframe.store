/**
 * Safely parses JSON returned from AI models (handling markdown blocks, trailing commas, and raw outputs)
 */
export function parseAIJson<T = any>(rawResponse: string, fallbackDefault?: T): T {
  if (!rawResponse || typeof rawResponse !== "string") {
    if (fallbackDefault !== undefined) return fallbackDefault;
    throw new Error("Empty AI response received");
  }

  const trimmed = rawResponse.trim();

  // 1. Direct standard parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {}

  // 2. Strip Markdown code blocks (```json ... ``` or ``` ...)
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {}
  }

  // 3. Extract outermost JSON object { ... }
  const jsonObjectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]) as T;
    } catch {}
  }

  // 4. Extract outermost JSON array [ ... ]
  const jsonArrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    try {
      return JSON.parse(jsonArrayMatch[0]) as T;
    } catch {}
  }

  if (fallbackDefault !== undefined) {
    return fallbackDefault;
  }

  throw new Error("Could not parse AI response as JSON");
}
