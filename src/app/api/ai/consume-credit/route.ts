import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured, FieldValue } from "@/lib/firebaseAdmin";
import { verifyAuth } from "@/lib/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

function formatFeatureName(rawFeature?: string): string {
  if (!rawFeature) return "AI Vision Auto-Pilot";
  const map: Record<string, string> = {
    "vision-autopilot": "AI Vision Auto-Pilot",
    "ai-translate": "AI Multi-Language Translation",
    "ai-scrape-captions": "AI App Store Scraping & Captions",
    "ai-copywriter": "AI Headline & Marketing Copy",
    "ai-store-listing": "AI App Store Listing Metadata",
    "ai-cutout": "AI Magic Background Cutout",
    "ai-palette": "AI Smart Color Palette",
  };
  return map[rawFeature] || rawFeature.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`credit:${ip}`, { limit: 60, windowMs: 60000, keyPrefix: "credit" });
    if (!rateLimit.success) {
      return NextResponse.json(
        { allowed: false, error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    // 2. Verify authorization
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { uid } = authResult.data;
    const body = await req.json().catch(() => ({}));
    const { feature } = body;
    const formattedFeature = formatFeatureName(feature);

    // If Firebase Admin is not configured
    if (!isAdminConfigured || !adminDb) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { allowed: false, error: "Service unavailable: Database is not configured." },
          { status: 503 }
        );
      }
      return NextResponse.json({
        allowed: true,
        isPro: false,
        remaining: 3,
        warning: "Admin SDK not configured, simulated credit deduction for local dev",
      });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const now = Date.now();
      // Create user with 3 free credits and consume 1
      await userRef.set({
        uid,
        isPro: false,
        plan: null,
        subscriptionStatus: null,
        aiCredits: 2,
        usedAiCredits: 1,
        createdAt: now,
        lastAiUsedAt: now,
        lastAiFeature: formattedFeature,
      });

      // Record welcome credits log and initial consumption log
      try {
        await userRef.collection("credit_logs").add({
          feature: "Free Welcome Bonus Credits",
          timestamp: now - 1000,
          cost: -3,
          isPro: false,
          remaining: 3,
          status: "credited",
        });
        await userRef.collection("credit_logs").add({
          feature: formattedFeature,
          timestamp: now,
          cost: 1,
          isPro: false,
          remaining: 2,
          status: "completed",
        });
      } catch (logErr) {
        console.warn("[ConsumeCredit] Failed to write initial credit logs:", logErr);
      }

      return NextResponse.json({
        allowed: true,
        isPro: false,
        remaining: 2,
        used: 1,
      });
    }

    const data = userDoc.data() || {};
    const now = Date.now();

    // 1. Pro users have unlimited AI
    if (data.isPro) {
      await userRef.update({
        lastAiUsedAt: now,
        lastAiFeature: formattedFeature,
        usedAiCredits: FieldValue.increment(1),
      });

      // Append to credit logs subcollection
      try {
        await userRef.collection("credit_logs").add({
          feature: formattedFeature,
          timestamp: now,
          cost: 0,
          isPro: true,
          remaining: 9999,
          status: "completed",
        });
      } catch (logErr) {
        console.warn("[ConsumeCredit] Failed to record credit log:", logErr);
      }

      return NextResponse.json({
        allowed: true,
        isPro: true,
        remaining: 9999,
        used: (data.usedAiCredits || 0) + 1,
      });
    }

    // 2. Free users check remaining credits
    const currentCredits = typeof data.aiCredits === "number" ? data.aiCredits : 3;

    if (currentCredits <= 0) {
      return NextResponse.json({
        allowed: false,
        isPro: false,
        remaining: 0,
        used: data.usedAiCredits || 3,
        reason: "credits_exhausted",
        message: "You have used all your free AI credits. Upgrade to Pro for unlimited AI generations.",
      });
    }

    // Deduct 1 credit
    await userRef.update({
      aiCredits: FieldValue.increment(-1),
      usedAiCredits: FieldValue.increment(1),
      lastAiUsedAt: now,
      lastAiFeature: formattedFeature,
    });

    const remaining = currentCredits - 1;

    // Append to credit logs subcollection
    try {
      await userRef.collection("credit_logs").add({
        feature: formattedFeature,
        timestamp: now,
        cost: 1,
        isPro: false,
        remaining,
        status: "completed",
      });
    } catch (logErr) {
      console.warn("[ConsumeCredit] Failed to record credit log:", logErr);
    }

    return NextResponse.json({
      allowed: true,
      isPro: false,
      remaining,
      used: (data.usedAiCredits || 0) + 1,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[ConsumeCredit API] Error:", err);
    return NextResponse.json(
      { allowed: false, error: "Failed to process credit verification." },
      { status: 500 }
    );
  }
}

