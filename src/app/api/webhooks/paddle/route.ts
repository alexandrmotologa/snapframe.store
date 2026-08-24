import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import crypto from "crypto";

/**
 * Paddle Webhook Signature Verifier (Paddle Billing v2)
 */
function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader || !secretKey) return false;

  try {
    // Signature format: ts=12345678;h1=hash
    const parts = signatureHeader.split(";").reduce((acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {} as Record<string, string>);

    const ts = parts["ts"];
    const h1 = parts["h1"];

    if (!ts || !h1) return false;

    // Payload for HMAC is: `${ts}:${rawBody}`
    const signedPayload = `${ts}:${rawBody}`;
    const computedHmac = crypto
      .createHmac("sha256", secretKey)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(computedHmac), Buffer.from(h1));
  } catch (err) {
    console.error("[Paddle Webhook] Signature verification error:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("paddle-signature");
    
    // Retrieve potential secret keys for sandbox and production
    const secretKeys = [
      process.env.PADDLE_WEBHOOK_SECRET_KEY,
      process.env.PADDLE_SANDBOX_WEBHOOK_SECRET_KEY,
    ].filter(Boolean) as string[];

    // In production or when keys are provided, require a valid signature
    if (secretKeys.length > 0) {
      const isValid = secretKeys.some((key) =>
        verifyPaddleSignature(rawBody, signatureHeader, key)
      );

      if (!isValid) {
        console.warn("[Paddle Webhook] Invalid signature rejected across configured secret keys");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("[Paddle Webhook] No Paddle webhook secret keys configured in production");
      return NextResponse.json({ error: "Webhook verification not configured" }, { status: 500 });
    }

    const payload = JSON.parse(rawBody);
    const { event_type, data } = payload;

    console.log(`[Paddle Webhook] Received event: ${event_type}`, {
      id: data?.id,
      status: data?.status,
      customer_id: data?.customer_id,
      custom_data: data?.custom_data,
    });

    const { db: adminDb, isConfigured } = getFirebaseAdmin();

    if (!isConfigured || !adminDb) {
      console.warn("[Paddle Webhook] Firebase Admin not configured, skipping Firestore update");
      return NextResponse.json({ received: true, warning: "Admin SDK not configured" });
    }

    const uid = data?.custom_data?.user_id || data?.custom_data?.uid;
    const userEmail = data?.custom_data?.user_email || data?.customer?.email;

    let targetDocRef = uid ? adminDb.collection("users").doc(uid) : null;

    // If uid was not in custom_data, attempt to look up by email
    if (!targetDocRef && userEmail) {
      const querySnap = await adminDb
        .collection("users")
        .where("email", "==", userEmail)
        .limit(1)
        .get();

      if (!querySnap.empty) {
        targetDocRef = querySnap.docs[0].ref;
      }
    }

    if (!targetDocRef) {
      console.warn("[Paddle Webhook] Could not resolve user document for event", { uid, userEmail });
      return NextResponse.json({ received: true, note: "User not found in Firestore" });
    }

    // Determine plan type (monthly vs annual)
    const interval = data?.items?.[0]?.price?.billing_cycle?.interval || "month";
    const plan = interval === "year" ? "annual" : "monthly";

    switch (event_type) {
      case "subscription.created":
      case "subscription.activated":
      case "subscription.updated":
      case "transaction.completed": {
        const status = data?.status || "active";
        const isPro = status === "active" || status === "trialing";

        await targetDocRef.set(
          {
            isPro,
            plan: plan === "annual" ? "pro-annual" : "pro-monthly",
            subscriptionStatus: status,
            paddleCustomerId: data?.customer_id || null,
            paddleSubscriptionId: data?.id || null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        console.log(`[Paddle Webhook] User upgraded to Pro (plan: ${plan}, status: ${status})`);
        break;
      }

      case "subscription.canceled": {
        const periodEndsAt = data?.current_billing_period?.ends_at
          ? new Date(data.current_billing_period.ends_at).getTime()
          : (data?.scheduled_change?.effective_at
            ? new Date(data.scheduled_change.effective_at).getTime()
            : Date.now() + 30 * 86400000);
        const isStillValid = periodEndsAt > Date.now();

        await targetDocRef.set(
          {
            isPro: isStillValid,
            subscriptionStatus: "canceled",
            subscriptionExpiresAt: periodEndsAt,
            canceledAt: Date.now(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        console.log(`[Paddle Webhook] User subscription canceled (active until: ${new Date(periodEndsAt).toISOString()})`);
        break;
      }

      case "subscription.past_due": {
        await targetDocRef.set(
          {
            subscriptionStatus: "past_due",
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        break;
      }

      default:
        console.log(`[Paddle Webhook] Unhandled event type: ${event_type}`);
    }

    return NextResponse.json({ received: true, event: event_type });
  } catch (error: any) {
    console.error("[Paddle Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
