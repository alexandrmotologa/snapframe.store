import { NextRequest, NextResponse } from "next/server";
import { runAIWithFallbacks, GeneratedScreenStory } from "@/lib/ai/aiService";
import { parseAIJson } from "@/lib/ai/parseAIJson";
import { authorizeAIRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { screens, appName, niche, language = "en" } = body;

    const authCheck = await authorizeAIRequest(req);
    if (!authCheck.success) {
      return authCheck.response;
    }

    if (!screens || !Array.isArray(screens) || screens.length === 0) {
      return NextResponse.json({ error: "Screens array is required" }, { status: 400 });
    }

    if (screens.length > 10) {
      return NextResponse.json({ error: "Cannot process more than 10 screens at once" }, { status: 400 });
    }

    // Convert images if provided as base64
    const imagesBase64: Array<{ mimeType: string; data: string }> = [];
    screens.forEach((s: { base64?: string; mimeType?: string }) => {
      if (s.base64 && typeof s.base64 === "string") {
        const cleanBase64 = s.base64.replace(/^data:image\/[a-z]+;base64,/, "");
        imagesBase64.push({
          mimeType: s.mimeType || "image/png",
          data: cleanBase64,
        });
      }
    });

    const prompt = `You are a world-class App Store Optimization (ASO) & mobile app design director.
Analyze the provided mobile application screenshots (total: ${screens.length} screens) for the app "${appName || "Mobile App"}" (niche: "${niche || "productivity / lifestyle"}").

For EACH screen in order (from index 0 to ${screens.length - 1}), detect what UI it showcases, and craft a high-converting, punchy App Store presentation story:
1. "headline": A compelling, punchy 2-5 word benefit-driven title (e.g., "Master Your Daily Focus", "Real-Time Smart Analytics", "Dark Mode Ready", "Unlock Unlimited Power"). Target language: ${language}.
2. "subcaption": A crisp, persuasive 4-8 word subtitle explaining the key feature.
3. "detectedType": one of ["hero", "analytics", "feature", "darkmode", "social", "paywall", "general"]
4. "recommendedGradient": A modern, aesthetic 2-stop gradient that beautifully matches the screenshot's color palette (stops: [{color: "#hex", position: 0}, {color: "#hex", position: 100}], direction: "to-br").

Return a JSON object with this exact structure:
{
  "screens": [
    {
      "index": 0,
      "headline": "...",
      "subcaption": "...",
      "detectedType": "hero",
      "recommendedGradient": {
        "stops": [{"color": "#1e1b4b", "position": 0}, {"color": "#4338ca", "position": 100}],
        "direction": "to-br"
      }
    }
  ]
}`;

    const rawResponse = await runAIWithFallbacks(prompt, imagesBase64.length > 0 ? imagesBase64 : undefined, true);
    
    const parsed = parseAIJson<{ screens: GeneratedScreenStory[] }>(rawResponse, { screens: [] });

    return NextResponse.json({
      success: true,
      screens: parsed.screens || [],
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Vision screens error:", err.message);
    return NextResponse.json({ error: "Failed to analyze screenshots" }, { status: 500 });
  }
}
