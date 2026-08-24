import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

export interface AuthResult {
  uid: string;
  email?: string;
  token?: any;
}

function decodeJwt(token: string): { uid: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const uid = payload.user_id || payload.sub || payload.uid;
    if (!uid) return null;
    return { uid, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Authenticates a request by verifying the Firebase ID Token from Authorization header.
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

  // Decode JWT payload first
  const decoded = decodeJwt(idToken);
  if (!decoded) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid token format." },
        { status: 401 }
      ),
    };
  }

  // Attempt dynamic cryptographic verification if Admin Auth is available
  try {
    const adminAuth = await getAdminAuth();
    if (adminAuth) {
      const verifiedToken = await adminAuth.verifyIdToken(idToken);
      return {
        success: true,
        data: {
          uid: verifiedToken.uid,
          email: verifiedToken.email,
          token: verifiedToken,
        },
      };
    }
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.warn("[ServerAuth] Cryptographic verify failed:", error?.message || error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid or expired authentication token." },
        { status: 401 }
      ),
    };
  }

  // In production, reject unverified tokens if Admin Auth is not configured
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Authentication verification service unavailable." },
        { status: 503 }
      ),
    };
  }

  // Non-production local development fallback only when Admin SDK is unconfigured
  return {
    success: true,
    data: {
      uid: decoded.uid,
      email: decoded.email,
    },
  };
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
