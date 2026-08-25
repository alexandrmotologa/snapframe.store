import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { CustomTemplate } from "@/lib/customTemplates";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieves approved community templates or user's custom templates
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const { db } = getFirebaseAdmin();
    if (!db) {
      // In local dev without firestore admin configured, return empty array
      return NextResponse.json([]);
    }

    const templatesRef = db.collection("custom_templates");
    let querySnapshot;

    if (userId) {
      querySnapshot = await templatesRef.where("userId", "==", userId).get();
    } else {
      querySnapshot = await templatesRef.where("status", "==", "approved").get();
    }

    const templates: CustomTemplate[] = [];
    querySnapshot.forEach((doc: any) => {
      templates.push({ id: doc.id, ...doc.data() } as CustomTemplate);
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching community templates:", error);
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * POST: Saves or updates a custom template
 */
export async function POST(req: NextRequest) {
  try {
    const body: CustomTemplate = await req.json();
    if (!body || !body.id || !body.name) {
      return NextResponse.json({ error: "Invalid template payload" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    if (db) {
      await db.collection("custom_templates").doc(body.id).set(
        {
          ...body,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true, template: body });
  } catch (error) {
    console.error("Error saving custom template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE: Removes a custom template
 */
export async function DELETE(req: NextRequest) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
