import { NextRequest, NextResponse } from "next/server";
import { runAIWithFallbacks } from "@/lib/ai/aiService";
import { parseAIJson } from "@/lib/ai/parseAIJson";
import { authorizeAIRequest } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dominantColors = [], appName } = body;

    const authCheck = await authorizeAIRequest(req);
    if (!authCheck.success) {
      return authCheck.response;
    }

    const prompt = `You are a senior digital colorist and App Store visual designer.
Based on the following app dominant colors: ${JSON.stringify(dominantColors)} (for app "${appName || "App"}"),
generate 5 distinct, breathtaking background gradient palettes specifically designed for App Store screenshot presentations.

Themes to generate:
1. "OLED Midnight" (Deep black/indigo luxury dark mode with glowing subtle accents)
2. "Clean Cupertino" (Minimalist Apple-style light gradient, soft slate/white/ice blue)
3. "Vibrant Sunset" (Warm, high-energy orange/coral/violet)
4. "Cyber Neon" (Electric cyan/purple/emerald)
5. "Pastel Aurora" (Soft aesthetic lavender/mint/peach)

For EACH theme, provide:
- "name": Theme name
- "description": 1 short sentence
- "stops": Array of 2 or 3 stops [{ color: "#hex", position: 0 }, { color: "#hex", position: 100 }]
- "direction": "to-br" | "to-b" | "to-r" | "radial"
- "recommendedTextColor": "#ffffff" or "#0f172a"

Return a JSON object with:
{
  "palettes": [
    {
      "id": "oled-midnight",
      "name": "OLED Midnight",
      "description": "Deep luxury dark background with luminous indigo flow",
      "stops": [{"color": "#090d16", "position": 0}, {"color": "#1e1b4b", "position": 100}],
      "direction": "to-br",
      "recommendedTextColor": "#ffffff"
    }
  ]
}`;

    const rawResponse = await runAIWithFallbacks(prompt, undefined, true);
    
    const parsed = parseAIJson<{ palettes?: Array<Record<string, unknown>> }>(rawResponse, { palettes: [] });

    return NextResponse.json({ success: true, palettes: parsed.palettes || [] });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Palette error:", err.message);
    return NextResponse.json({ error: "Failed to generate palettes" }, { status: 500 });
  }
}
