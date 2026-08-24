import { describe, it, expect } from "vitest";
import { parseAIJson } from "@/lib/ai/parseAIJson";

describe("parseAIJson", () => {
  it("parses clean JSON strings correctly", () => {
    const raw = JSON.stringify({ result: "awesome title", count: 42 });
    const parsed = parseAIJson<{ result: string; count: number }>(raw);
    expect(parsed.result).toBe("awesome title");
    expect(parsed.count).toBe(42);
  });

  it("extracts and parses JSON wrapped in markdown codeblocks (```json ... ```)", () => {
    const raw = "```json\n{\n  \"headline\": \"Boost Your Productivity\"\n}\n```";
    const parsed = parseAIJson<{ headline: string }>(raw);
    expect(parsed.headline).toBe("Boost Your Productivity");
  });

  it("extracts JSON embedded with preceding or trailing conversational AI commentary", () => {
    const raw = "Here is your generated response:\n{\"status\":\"ok\",\"items\":[1,2,3]}\nHope this helps!";
    const parsed = parseAIJson<{ status: string; items: number[] }>(raw);
    expect(parsed.status).toBe("ok");
    expect(parsed.items).toEqual([1, 2, 3]);
  });

  it("parses JSON array when root is an array", () => {
    const raw = "```json\n[\"first\", \"second\", \"third\"]\n```";
    const parsed = parseAIJson<string[]>(raw);
    expect(parsed).toEqual(["first", "second", "third"]);
  });

  it("returns fallback value when input is completely invalid JSON", () => {
    const raw = "Sorry, I cannot generate screenshots for this prompt.";
    const fallback = { error: "fallback" };
    const parsed = parseAIJson(raw, fallback);
    expect(parsed).toEqual(fallback);
  });
});
