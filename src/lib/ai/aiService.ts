// Server-side Unified AI Service with Multi-Provider Fallbacks
// Supports Google Gemini, OpenAI, Groq, and Mistral with automatic failover

export interface VisionScreenInput {
  index: number;
  base64OrUrl: string;
  name?: string;
}

export interface GeneratedScreenStory {
  index: number;
  headline: string;
  subcaption: string;
  detectedType: "hero" | "analytics" | "feature" | "darkmode" | "social" | "paywall" | "general";
  recommendedGradient: {
    stops: Array<{ color: string; position: number }>;
    direction: string;
  };
}

export interface StoreListingAIInput {
  appName: string;
  category?: string;
  nicheKeywords?: string;
  targetLang: string;
  screenHeadlines?: string[];
}

export interface StoreListingAIOutput {
  ios: {
    name: string; // <= 30 chars
    subtitle: string; // <= 30 chars
    promotionalText: string; // <= 170 chars
    keywords: string; // <= 100 chars
    description: string; // <= 4000 chars
    whatsNew: string; // <= 500 chars
  };
  android: {
    title: string; // <= 30 chars
    shortDescription: string; // <= 80 chars
    fullDescription: string; // <= 4000 chars
    whatsNew: string; // <= 500 chars
  };
}

// ─── HELPER: Enforce strict character limits ─────────────────────────────────
export function trimToLimit(text: string, maxLen: number): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  // Try to cut at word boundary
  const sub = trimmed.slice(0, maxLen - 1);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.7) {
    return sub.slice(0, lastSpace);
  }
  return sub;
}

// ─── API KEY RESOLUTION (strictly from server environment variables) ─────────
export function getAIKeys() {
  return {
    gemini: process.env.GEMINI_API_KEY || "",
    openai: process.env.OPENAI_API_KEY || "",
    groq: process.env.GROQ_API_KEY || "",
    mistral: process.env.MISTRAL_API_KEY || "",
    xai: process.env.XAI_API_KEY || process.env.GROK_API_KEY || "",
  };
}

// ─── CALL GEMINI 1.5 / 2.0 FLASH ─────────────────────────────────────────────
export async function callGemini(
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  const parts: any[] = [{ text: prompt }];

  if (imagesBase64 && imagesBase64.length > 0) {
    imagesBase64.forEach((img) => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/png",
          data: img.data,
        },
      });
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3000,
          responseMimeType: responseJson ? "application/json" : "text/plain",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

// ─── HELPER: OpenAI-Compatible Provider Request ──────────────────────────────
async function callOpenAICompatible(
  endpoint: string,
  model: string,
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true,
  providerName: string = "AI",
  temperature: number = 0.3
): Promise<string> {
  const hasImages = imagesBase64 && imagesBase64.length > 0;
  let content: any = prompt;

  if (hasImages) {
    content = [{ type: "text", text: prompt }];
    imagesBase64.forEach((img) => {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${img.mimeType || "image/png"};base64,${img.data}`,
        },
      });
    });
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      temperature,
      response_format: responseJson ? { type: "json_object" } : undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${providerName} API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── CALL OPENAI (GPT-4o / GPT-4o-mini) ──────────────────────────────────────
export async function callOpenAI(
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  return callOpenAICompatible(
    "https://api.openai.com/v1/chat/completions",
    "gpt-4o-mini",
    prompt,
    apiKey,
    imagesBase64,
    responseJson,
    "OpenAI",
    0.4
  );
}

// ─── CALL GROQ (GPT-OSS 120B / Llama 3.2 11B Vision) ───────────────────────
export async function callGroq(
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  const hasImages = imagesBase64 && imagesBase64.length > 0;
  const model = hasImages ? "llama-3.2-11b-vision-preview" : "openai/gpt-oss-120b";
  return callOpenAICompatible(
    "https://api.groq.com/openai/v1/chat/completions",
    model,
    prompt,
    apiKey,
    imagesBase64,
    responseJson,
    "Groq",
    0.3
  );
}

// ─── CALL MISTRAL (Mistral Small / Pixtral 12B Vision) ─────────────────────────
export async function callMistral(
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  const hasImages = imagesBase64 && imagesBase64.length > 0;
  const model = hasImages ? "pixtral-12b-2409" : "mistral-small-latest";
  return callOpenAICompatible(
    "https://api.mistral.ai/v1/chat/completions",
    model,
    prompt,
    apiKey,
    imagesBase64,
    responseJson,
    "Mistral",
    0.3
  );
}

// ─── CALL XAI (Grok 3 / Grok 2 Vision) ───────────────────────────────────────
export async function callXAI(
  prompt: string,
  apiKey: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  const hasImages = imagesBase64 && imagesBase64.length > 0;
  const model = hasImages ? "grok-2-vision-1212" : "grok-3";
  return callOpenAICompatible(
    "https://api.x.ai/v1/chat/completions",
    model,
    prompt,
    apiKey,
    imagesBase64,
    responseJson,
    "xAI (Grok)",
    0.3
  );
}

// ─── UNIVERSAL RESILIENT AI RUNNER ──────────────────────────────────────────
export async function runAIWithFallbacks(
  prompt: string,
  imagesBase64?: Array<{ mimeType: string; data: string }>,
  responseJson: boolean = true
): Promise<string> {
  const keys = getAIKeys();
  const errors: string[] = [];

  // 1. Try Gemini (handles text and vision)
  if (keys.gemini) {
    try {
      return await callGemini(prompt, keys.gemini, imagesBase64, responseJson);
    } catch (e: any) {
      console.warn("Gemini AI attempt failed:", e.message);
      errors.push(`Gemini: ${e.message}`);
    }
  }

  // 2. Try OpenAI (handles text and vision)
  if (keys.openai) {
    try {
      return await callOpenAI(prompt, keys.openai, imagesBase64, responseJson);
    } catch (e: any) {
      console.warn("OpenAI attempt failed:", e.message);
      errors.push(`OpenAI: ${e.message}`);
    }
  }

  // 3. Try Groq (handles ultra fast text AND multimodal vision)
  if (keys.groq) {
    try {
      return await callGroq(prompt, keys.groq, imagesBase64, responseJson);
    } catch (e: any) {
      console.warn("Groq attempt failed:", e.message);
      errors.push(`Groq: ${e.message}`);
    }
  }

  // 4. Try Mistral (handles text AND Pixtral multimodal vision)
  if (keys.mistral) {
    try {
      return await callMistral(prompt, keys.mistral, imagesBase64, responseJson);
    } catch (e: any) {
      console.warn("Mistral attempt failed:", e.message);
      errors.push(`Mistral: ${e.message}`);
    }
  }

  // 5. Try xAI Grok (handles text AND Grok 2 Vision)
  if (keys.xai) {
    try {
      return await callXAI(prompt, keys.xai, imagesBase64, responseJson);
    } catch (e: any) {
      console.warn("xAI Grok attempt failed:", e.message);
      errors.push(`xAI: ${e.message}`);
    }
  }

  throw new Error(`All AI providers failed or no API keys provided in .env.local. Errors: ${errors.join("; ")}`);
}
