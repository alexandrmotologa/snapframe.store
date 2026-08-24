import { NextRequest, NextResponse } from "next/server";
import { adminAuth, isAdminConfigured } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface AuthResult {
  uid: string;
  email?: string;
  token?: DecodedIdToken;
}

/**
 * Authenticates a request by verifying the Firebase ID Token from Authorization header.
 * Usage in API route:
 * const authResult = await verifyAuth(req);
 * if (!authResult.success) {
 *   return authResult.response;
 * }
 * const { uid } = authResult.data;
 */
export async function verifyAuth(
  req: NextRequest,
  options: { required?: boolean } = { required: true }
): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!options.required) {
      return { success: true, data: { uid: "" } };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Missing or malformed Bearer token in Authorization header." },
        { status: 401 }
      ),
    };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  if (!idToken) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Empty Bearer token." },
        { status: 401 }
      ),
    };
  }

  // If Admin SDK is not configured
  if (!isAdminConfigured || !adminAuth) {
    if (process.env.NODE_ENV === "production") {
      console.error("[ServerAuth] Firebase Admin Auth is not configured in production");
      return {
        success: false,
        response: NextResponse.json(
          { error: "Internal Server Configuration Error: Authentication provider is unavailable." },
          { status: 500 }
        ),
      };
    }

    // In local development fallback
    console.warn("[ServerAuth] Admin SDK not configured - allowing simulated token in local development");
    return {
      success: true,
      data: {
        uid: idToken.startsWith("local-") ? idToken.replace("local-", "") : idToken,
        email: "dev@localhost",
      },
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return {
      success: true,
      data: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        token: decodedToken,
      },
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.warn("[ServerAuth] Token verification failed:", error.code || error.message);

    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Unauthorized: Invalid or expired authentication token.",
          code: error.code || "auth/invalid-token",
        },
        { status: 401 }
      ),
    };
  }
}

/**
 * Validates that an AI generation request is permitted (rate-limited + authenticated via Firebase token)
 */
export async function authorizeAIRequest(
  req: NextRequest
): Promise<
  | { success: true; user: AuthResult }
  | { success: false; response: NextResponse }
> {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`ai:${ip}`, { limit: 30, windowMs: 60000, keyPrefix: "ai" });

  if (!rateLimit.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Too many AI generation requests. Please wait a moment before trying again." },
        { status: 429 }
      ),
    };
  }

  // All AI requests must be authenticated with verified Firebase token
  const authResult = await verifyAuth(req);
  if (!authResult.success) {
    return authResult;
  }

  return { success: true, user: authResult.data };
}

