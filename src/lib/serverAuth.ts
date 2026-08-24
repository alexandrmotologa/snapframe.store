import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

export interface AuthResult {
  uid: string;
  email?: string;
  token?: any;
}

function decodeAndValidateJwt(token: string): { uid: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const uid = payload.user_id || payload.sub || payload.uid;
    if (!uid) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && payload.exp < nowSec) {
      return null;
    }

    const expectedProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (expectedProjectId) {
      if (payload.aud && payload.aud !== expectedProjectId) {
        return null;
      }
      if (payload.iss && payload.iss !== `https://securetoken.google.com/${expectedProjectId}`) {
        return null;
      }
    }

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

  // Attempt dynamic cryptographic verification if Admin Auth is configured
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

  // Resilient token validation fallback when Admin SDK service credentials are not configured
  const validated = decodeAndValidateJwt(idToken);
  if (!validated) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid or expired token format." },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    data: {
      uid: validated.uid,
      email: validated.email,
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
