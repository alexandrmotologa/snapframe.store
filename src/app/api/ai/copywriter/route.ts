import { NextRequest, NextResponse } from "next/server";
import { runAIWithFallbacks, trimToLimit } from "@/lib/ai/aiService";
import { parseAIJson } from "@/lib/ai/parseAIJson";
import { authorizeAIRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      action = "rewrite", // rewrite, shorten, punchy, emojis, ideas
      tone = "high-energy", // high-energy, b2b, minimalist, fomo, benefit-driven
      maxLength = 30, // character limit
      language = "en",
      niche,
    } = body;

    const authCheck = await authorizeAIRequest(req);
    if (!authCheck.success) {
      return authCheck.response;
    }

    if (!text && action !== "ideas") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text && typeof text === "string" && text.length > 5000) {
      return NextResponse.json({ error: "Text too long (maximum 5,000 characters)" }, { status: 400 });
    }

    let prompt = "";

    if (action === "ideas") {
      prompt = `You are a high-conversion mobile app copywriter for Apple App Store and Google Play.
Generate 5 punchy headline options for a mobile app in the "${niche || "productivity / lifestyle"}" niche.
Each headline MUST be in ${language}, highly engaging, and STRICTLY under ${maxLength} characters.

Return JSON:
{
  "options": [
    "Headline 1",
    "Headline 2",
    "Headline 3",
    "Headline 4",
    "Headline 5"
  ]
}`;
    } else {
      prompt = `You are an expert App Store marketing copywriter.
Task: ${action} the following text: "${text}".
Tone: ${tone}.
Target Language: ${language}.
CRITICAL CONSTRAINT: The output MUST be strictly under ${maxLength} characters in length (no exceptions!).

Return JSON:
{
  "result": "the rewritten text under ${maxLength} chars",
  "variations": ["alt 1 under ${maxLength} chars", "alt 2 under ${maxLength} chars", "alt 3 under ${maxLength} chars"]
}`;
    }

    const rawResponse = await runAIWithFallbacks(prompt, undefined, true);
    
    const parsed = parseAIJson<{ result?: string; variations?: string[]; options?: string[] }>(rawResponse, {});

    if (parsed.result) {
      parsed.result = trimToLimit(parsed.result, maxLength);
    }
    if (parsed.variations && Array.isArray(parsed.variations)) {
      parsed.variations = parsed.variations.map((v: string) => trimToLimit(v, maxLength));
    }
    if (parsed.options && Array.isArray(parsed.options)) {
      parsed.options = parsed.options.map((o: string) => trimToLimit(o, maxLength));
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Copywriter error:", err.message);
    return NextResponse.json({ error: "Failed to generate copy" }, { status: 500 });
  }
}
