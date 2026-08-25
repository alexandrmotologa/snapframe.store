import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { isUserAdmin } from "@/lib/adminAuth";
import { CustomTemplate } from "@/lib/customTemplates";

export const dynamic = "force-dynamic";

function verifyAdminRequest(req: NextRequest): boolean {
  const adminEmail =
    req.headers.get("x-admin-email") ||
    new URL(req.url).searchParams.get("adminEmail") ||
    "";

  return isUserAdmin(adminEmail);
}

/**
 * GET /api/admin/templates
 * Retrieves all submitted custom templates across users for moderation
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
      return NextResponse.json({ templates: [], total: 0 });
    }

    const snapshot = await db.collection("custom_templates").orderBy("updatedAt", "desc").get();
    const templates: CustomTemplate[] = [];

    snapshot.forEach((doc: any) => {
      templates.push({ id: doc.id, ...doc.data() } as CustomTemplate);
    });

    return NextResponse.json({
      templates,
      total: templates.length,
      pendingCount: templates.filter((t) => t.status === "pending_review").length,
      approvedCount: templates.filter((t) => t.status === "approved").length,
      rejectedCount: templates.filter((t) => t.status === "rejected").length,
      privateCount: templates.filter((t) => t.status === "private").length,
    });
  } catch (error) {
    console.error("Error in admin templates GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/templates
 * Moderates a template (Approve to community, Reject with feedback, set Pro flag, change category)
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
    const { id, status, isPro, rejectionReason, category, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (status !== undefined) updateData.status = status;
    if (isPro !== undefined) updateData.isPro = Boolean(isPro);
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (category !== undefined) updateData.category = category;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await db.collection("custom_templates").doc(id).set(updateData, { merge: true });

    return NextResponse.json({ success: true, updatedId: id, updateData });
  } catch (error) {
    console.error("Error in admin templates PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/templates
 * Permanently deletes a custom template
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
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    if (db) {
      await db.collection("custom_templates").doc(id).delete();
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Error in admin templates DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
