import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { verifyAuth } from "@/lib/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

export interface CreditLogEntry {
  id: string;
  feature: string;
  timestamp: number;
  cost: number;
  remaining: number;
  isPro: boolean;
  status: string;
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`billing:${ip}`, { limit: 60, windowMs: 60000, keyPrefix: "billing" });
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { uid } = authResult.data;
    if (!uid) {
      return NextResponse.json({ error: "Missing or invalid authenticated user." }, { status: 401 });
    }

    const { db: adminDb, isConfigured } = getFirebaseAdmin();

    // Default response when running without Admin SDK
    if (!isConfigured || !adminDb) {
      return NextResponse.json({
        user: {
          uid,
          isPro: false,
          plan: "free",
          subscriptionStatus: "active",
          aiCredits: 3,
          usedAiCredits: 0,
          createdAt: Date.now() - 86400000 * 5,
        },
        creditLogs: [
          {
            id: "log_welcome",
            feature: "Free Welcome Bonus Credits",
            timestamp: Date.now() - 86400000 * 5,
            cost: -3,
            remaining: 3,
            isPro: false,
            status: "credited",
          },
        ],
        transactions: [],
        paddlePortalUrl: "https://paddle.net",
      });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({
        user: {
          uid,
          isPro: false,
          plan: "free",
          subscriptionStatus: "active",
          aiCredits: 3,
          usedAiCredits: 0,
          createdAt: Date.now(),
        },
        creditLogs: [],
        transactions: [],
        paddlePortalUrl: "https://paddle.net",
      });
    }

    const userData = userDoc.data() || {};
    const now = Date.now();

    // Determine if Pro is still active (active subscription or canceled but before period expiration)
    const isPeriodValid = userData.subscriptionExpiresAt ? userData.subscriptionExpiresAt > now : true;
    const isPro = Boolean(userData.isPro && isPeriodValid);

    // If subscription has expired past its period end, update Firestore status
    if (userData.isPro && userData.subscriptionExpiresAt && userData.subscriptionExpiresAt <= now) {
      await userRef.set(
        {
          isPro: false,
          subscriptionStatus: "expired",
          aiCredits: 3,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    // Fetch latest 50 credit spending logs
    let creditLogs: CreditLogEntry[] = [];
    try {
      const logsSnap = await userRef
        .collection("credit_logs")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      creditLogs = logsSnap.docs.map((doc) => ({
        id: doc.id,
        feature: doc.data().feature || "AI Generation",
        timestamp: doc.data().timestamp || Date.now(),
        cost: doc.data().cost ?? 1,
        remaining: doc.data().remaining ?? 0,
        isPro: Boolean(doc.data().isPro),
        status: doc.data().status || "completed",
      }));
    } catch (e) {
      console.warn("[Billing API] Failed to query credit_logs:", e);
    }

    // Fetch transactions / invoices if recorded
    let transactions: Array<Record<string, unknown>> = [];
    try {
      const txSnap = await userRef
        .collection("transactions")
        .orderBy("timestamp", "desc")
        .limit(20)
        .get();

      transactions = txSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (e) {
      // Subcollection might be empty
    }

    const paddlePortalUrl = "https://paddle.net";

    return NextResponse.json({
      user: {
        uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        isPro,
        plan: userData.plan || (isPro ? "pro-monthly" : "free"),
        subscriptionStatus: isPro
          ? (userData.subscriptionStatus || "active")
          : (userData.subscriptionStatus === "canceled" ? "expired" : "free"),
        subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
        paddleCustomerId: userData.paddleCustomerId || null,
        paddleSubscriptionId: userData.paddleSubscriptionId || null,
        createdAt: userData.createdAt || Date.now(),
        aiCredits: isPro ? (typeof userData.aiCredits === "number" ? userData.aiCredits : 9999) : Math.min(typeof userData.aiCredits === "number" ? userData.aiCredits : 3, 3),
        usedAiCredits: typeof userData.usedAiCredits === "number" ? userData.usedAiCredits : 0,
        canceledAt: userData.canceledAt || null,
        cancelReason: userData.cancelReason || null,
      },
      creditLogs,
      transactions,
      paddlePortalUrl,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Billing API] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch billing details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { uid } = authResult.data;
    const body = await req.json();
    const { action, reason, plan, transactionId } = body;

    const { db: adminDb, isConfigured } = getFirebaseAdmin();

    if (action === "activate_pro") {
      const isAnnual = plan === "annual" || plan === "pro-annual";
      const durationMs = isAnnual ? 365 * 86400000 : 30 * 86400000;
      const now = Date.now();
      const expiresAt = now + durationMs;

      if (isConfigured && adminDb) {
        const userRef = adminDb.collection("users").doc(uid);
        await userRef.set(
          {
            isPro: true,
            plan: isAnnual ? "pro-annual" : "pro-monthly",
            subscriptionStatus: "active",
            lastPaymentAt: now,
            subscriptionExpiresAt: expiresAt,
            aiCredits: 9999,
            canceledAt: null,
            cancelReason: null,
            updatedAt: now,
          },
          { merge: true }
        );

        if (transactionId) {
          await userRef.collection("transactions").add({
            transactionId,
            plan: isAnnual ? "pro-annual" : "pro-monthly",
            timestamp: now,
            status: "completed",
            amount: isAnnual ? 69 : 9,
          });
        }
      }

      return NextResponse.json({
        success: true,
        isPro: true,
        message: "Pro subscription activated successfully.",
      });
    }

    if (action === "cancel_subscription") {
      const now = Date.now();
      let expiresAt = now + 30 * 86400000;

      if (isConfigured && adminDb) {
        const userRef = adminDb.collection("users").doc(uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data() || {};

        const isAnnual = userData.plan?.includes("annual");
        const periodDuration = isAnnual ? 365 * 86400000 : 30 * 86400000;
        const lastPayment = userData.lastPaymentAt || userData.createdAt || now;

        // Preserve current billing period end date
        if (userData.subscriptionExpiresAt && userData.subscriptionExpiresAt > now) {
          expiresAt = userData.subscriptionExpiresAt;
        } else {
          expiresAt = lastPayment + periodDuration;
          if (expiresAt <= now) {
            expiresAt = now + 30 * 86400000; // Guarantee at least current cycle
          }
        }

        // Set status to canceled, but keep isPro: true until the billing period expires!
        await userRef.set(
          {
            subscriptionStatus: "canceled",
            isPro: expiresAt > now,
            subscriptionExpiresAt: expiresAt,
            canceledAt: now,
            cancelReason: reason || "User requested cancellation via account dashboard",
            updatedAt: now,
          },
          { merge: true }
        );
      }

      return NextResponse.json({
        success: true,
        isPro: true,
        subscriptionStatus: "canceled",
        subscriptionExpiresAt: expiresAt,
        message: `Your subscription has been canceled. You retain full Pro access until ${new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`,
        paddlePortalUrl: "https://paddle.net",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Billing API] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to process billing request" },
      { status: 500 }
    );
  }
}
