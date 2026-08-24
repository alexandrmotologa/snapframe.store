import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue, isAdminConfigured } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

export async function GET() {
  if (!isAdminConfigured || !adminDb) {
    return NextResponse.json({ success: true, counts: {}, configured: false });
  }

  try {
    const querySnapshot = await adminDb.collection("template_stats").get();
    const counts: Record<string, number> = {};
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.count === "number") {
        counts[docSnap.id] = data.count;
      }
    });

    return NextResponse.json({ success: true, counts, configured: true });
  } catch (error: any) {
    console.warn("Firestore template stats fetch warning:", error?.message || error);
    return NextResponse.json({ success: true, counts: {}, fallback: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`template-popularity:${clientIp}`, {
      limit: 60,
      windowMs: 60000,
      keyPrefix: "tpl_pop",
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { templateId } = await req.json();
    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ success: false, error: "Invalid templateId" }, { status: 400 });
    }

    if (!isAdminConfigured || !adminDb) {
      return NextResponse.json({ success: true, configured: false, note: "Recorded locally (Firebase Admin not configured)" });
    }

    const docRef = adminDb.collection("template_stats").doc(templateId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({
        count: FieldValue.increment(1),
        lastUsedAt: new Date().toISOString(),
      });
    } else {
      await docRef.set({
        count: 1,
        templateId,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, templateId, configured: true });
  } catch (error: any) {
    console.warn("Firestore template stats update warning:", error?.message || error);
    return NextResponse.json({ success: true, templateId: "local-fallback", fallback: true });
  }
}
