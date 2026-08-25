import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isUserAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Validates whether the incoming request is authorized by an admin
 */
function verifyAdminRequest(req: NextRequest): boolean {
  const adminEmail =
    req.headers.get("x-admin-email") ||
    new URL(req.url).searchParams.get("adminEmail") ||
    "";

  return isUserAdmin(adminEmail);
}

/**
 * GET /api/admin/reviews
 * Returns all reviews with full administrative details and stats
 */
export async function GET(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json(
      { error: "Unauthorized access. Administrator credentials required." },
      { status: 403 }
    );
  }

  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const snapshot = await db.collection("reviews").orderBy("createdAt", "desc").get();
    const reviews: Record<string, unknown>[] = [];

    snapshot.forEach((doc: any) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      reviews,
      total: reviews.length,
      pendingCount: reviews.filter((r) => r.status === "pending").length,
      approvedCount: reviews.filter((r) => r.status === "approved").length,
      rejectedCount: reviews.filter((r) => r.status === "rejected").length,
    });
  } catch (error) {
    console.error("Error in admin reviews GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reviews
 * Updates review moderation status (approve, reject, toggle featured, toggle beta_user)
 */
export async function PATCH(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json(
      { error: "Unauthorized access. Administrator credentials required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, status, featured, beta_user, title, body: reviewBody, rating, authorRole } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (beta_user !== undefined) updateData.beta_user = Boolean(beta_user);
    if (title !== undefined) updateData.title = title;
    if (reviewBody !== undefined) updateData.body = reviewBody;
    if (rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Math.round(Number(rating) * 2) / 2));
    if (authorRole !== undefined) updateData.authorRole = authorRole;

    await db.collection("reviews").doc(id).set(updateData, { merge: true });

    return NextResponse.json({ success: true, updatedId: id, updateData });
  } catch (error) {
    console.error("Error in admin reviews PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/reviews
 * Permanently deletes a review document
 */
export async function DELETE(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json(
      { error: "Unauthorized access. Administrator credentials required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    if (db) {
      await db.collection("reviews").doc(id).delete();
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Error in admin reviews DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
