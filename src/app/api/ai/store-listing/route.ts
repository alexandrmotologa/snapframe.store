import { NextRequest, NextResponse } from "next/server";
import { runAIWithFallbacks, trimToLimit } from "@/lib/ai/aiService";
import { parseAIJson } from "@/lib/ai/parseAIJson";
import { authorizeAIRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appName,
      category = "Productivity",
      nicheKeywords = "",
      targetLang = "en",
      screenHeadlines = [],
    } = body;

    const authCheck = await authorizeAIRequest(req);
    if (!authCheck.success) {
      return authCheck.response;
    }

    if (appName && typeof appName === "string" && appName.length > 200) {
      return NextResponse.json({ error: "App name too long (max 200 characters)" }, { status: 400 });
    }

    if (nicheKeywords && typeof nicheKeywords === "string" && nicheKeywords.length > 1000) {
      return NextResponse.json({ error: "Keywords too long (max 1,000 characters)" }, { status: 400 });
    }

    const prompt = `You are a world-class App Store Optimization (ASO) specialist and copywriter.
Generate a complete, high-ranking, high-conversion App Store and Google Play store listing for the mobile app "${appName}".
Category: ${category}.
Niche / Key features: ${nicheKeywords || screenHeadlines.join(", ")}.
Target Language: ${targetLang} (Write naturally, natively and persuasively in this language).

CRITICAL APP STORE CONSTRAINTS (STRICT CHARACTER LIMITS):
- ios.name: Max 30 characters
- ios.subtitle: Max 30 characters
- ios.promotionalText: Max 170 characters
- ios.keywords: Max 100 characters (comma-separated high-volume keywords, no spaces after commas, e.g. "photos,mockup,editor,design,studio")
- ios.description: Max 4000 characters (Engaging markdown structure with emoji bullet points, feature breakdown, social proof)
- ios.whatsNew: Max 500 characters

CRITICAL GOOGLE PLAY CONSTRAINTS:
- android.title: Max 30 characters
- android.shortDescription: Max 80 characters
- android.fullDescription: Max 4000 characters
- android.whatsNew: Max 500 characters

Return a valid JSON object matching this structure:
{
  "ios": {
    "name": "...",
    "subtitle": "...",
    "promotionalText": "...",
    "keywords": "...",
    "description": "...",
    "whatsNew": "..."
  },
  "android": {
    "title": "...",
    "shortDescription": "...",
    "fullDescription": "...",
    "whatsNew": "..."
  }
}`;

    const rawResponse = await runAIWithFallbacks(prompt, undefined, true);
    
    const parsed = parseAIJson<{
      ios?: Record<string, string>;
      android?: Record<string, string>;
    }>(rawResponse, {});

    // Apply strict character limits
    if (parsed.ios) {
      parsed.ios.name = trimToLimit(parsed.ios.name || appName, 30);
      parsed.ios.subtitle = trimToLimit(parsed.ios.subtitle || "", 30);
      parsed.ios.promotionalText = trimToLimit(parsed.ios.promotionalText || "", 170);
      parsed.ios.keywords = trimToLimit(parsed.ios.keywords || "", 100);
      parsed.ios.description = trimToLimit(parsed.ios.description || "", 4000);
      parsed.ios.whatsNew = trimToLimit(parsed.ios.whatsNew || "", 500);
    }

    if (parsed.android) {
      parsed.android.title = trimToLimit(parsed.android.title || appName, 30);
      parsed.android.shortDescription = trimToLimit(parsed.android.shortDescription || "", 80);
      parsed.android.fullDescription = trimToLimit(parsed.android.fullDescription || "", 4000);
      parsed.android.whatsNew = trimToLimit(parsed.android.whatsNew || "", 500);
    }

    return NextResponse.json({ success: true, listing: parsed });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Store Listing error:", err.message);
    return NextResponse.json({ error: "Failed to generate store listing" }, { status: 500 });
  }
}
