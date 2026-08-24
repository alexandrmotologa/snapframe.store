import { NextRequest, NextResponse } from "next/server";
import { runAIWithFallbacks, trimToLimit } from "@/lib/ai/aiService";
import { parseAIJson } from "@/lib/ai/parseAIJson";
import { authorizeAIRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      texts, // Array of strings or object map
      targetLang, // e.g. "ro", "es", "de", "fr", "ja"
      maxLength = 40,
      context = "App Store screenshot marketing captions",
    } = body;

    const authCheck = await authorizeAIRequest(req);
    if (!authCheck.success) {
      return authCheck.response;
    }

    if (!texts || (Array.isArray(texts) && texts.length === 0)) {
      return NextResponse.json({ error: "Texts are required" }, { status: 400 });
    }

    const isArray = Array.isArray(texts);
    const textList: string[] = isArray ? texts : Object.values(texts);

    if (textList.length > 50 || textList.some((t) => typeof t === "string" && t.length > 1000)) {
      return NextResponse.json({ error: "Too many texts or text exceeds 1,000 characters per item (max 50 items)" }, { status: 400 });
    }

    const prompt = `You are a native copywriter and localization expert for mobile apps.
Translate and culturally adapt the following marketing texts into native, natural, high-converting ${targetLang}.
Context: ${context}.

CRITICAL INSTRUCTIONS:
- Do NOT translate literally word-by-word. Adapt idioms, marketing hooks, and phrasing so it feels natively written in ${targetLang}.
- STRICT LENGTH CONSTRAINT: Each translated text MUST NOT exceed ${maxLength} characters. If the direct translation in ${targetLang} is too long (e.g. in German or French), rewrite and condense it creatively to fit strictly under ${maxLength} characters!

Input texts:
${JSON.stringify(textList, null, 2)}

Return a JSON object with:
{
  "translations": [
    "translated string 1 under ${maxLength} chars",
    "translated string 2 under ${maxLength} chars"
  ]
}`;

    const rawResponse = await runAIWithFallbacks(prompt, undefined, true);
    
    const parsed = parseAIJson<{ translations?: string[] }>(rawResponse, {});

    let finalTranslations: string[] = (parsed.translations || []).map((t: string) => trimToLimit(t, maxLength));

    // Fallback if array length mismatch
    if (finalTranslations.length !== textList.length) {
      finalTranslations = textList.map((t, idx) => finalTranslations[idx] || t);
    }

    // Return in same shape as input
    if (isArray) {
      return NextResponse.json({ success: true, translations: finalTranslations });
    } else {
      const keys = Object.keys(texts);
      const resultMap: Record<string, string> = {};
      keys.forEach((key, idx) => {
        resultMap[key] = finalTranslations[idx] || (texts as Record<string, string>)[key];
      });
      return NextResponse.json({ success: true, translations: resultMap });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Translate error:", err.message);
    return NextResponse.json({ error: "Failed to translate texts" }, { status: 500 });
  }
}
