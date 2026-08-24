import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  if ((formatted.startsWith('"') && formatted.endsWith('"')) || (formatted.startsWith("'") && formatted.endsWith("'"))) {
    formatted = formatted.slice(1, -1);
  }
  formatted = formatted.replace(/\\n/g, "\n").replace(/\\r/g, "");
  return formatted;
}

export function getFirebaseAdmin(): {
  app: App | null;
  db: Firestore | null;
  isConfigured: boolean;
} {
  if (adminApp && adminDb) {
    return { app: adminApp, db: adminDb, isConfigured: true };
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    ? process.env.FIREBASE_CLIENT_EMAIL.trim().replace(/^["']|["']$/g, "")
    : undefined;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const isConfigured = Boolean(projectId && clientEmail && privateKey);
  if (!isConfigured) {
    return { app: null, db: null, isConfigured: false };
  }

  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
    adminDb = getFirestore(adminApp);
  } catch (error: any) {
    console.error("[Firebase Admin] Initialization error:", error?.message || error);
    return { app: null, db: null, isConfigured: false };
  }

  return {
    app: adminApp,
    db: adminDb,
    isConfigured: Boolean(adminApp && adminDb),
  };
}

let cachedAuth: any = null;
export async function getAdminAuth() {
  if (cachedAuth) return cachedAuth;
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const { app } = getFirebaseAdmin();
    if (app) {
      cachedAuth = getAuth(app);
      return cachedAuth;
    }
  } catch (err) {
    console.warn("[Firebase Admin] Auth dynamic module load:", err);
  }
  return null;
}

export const isAdminConfigured = Boolean(
  (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

export const adminDbProxy = new Proxy({} as Firestore, {
  get(_target, prop) {
    const { db } = getFirebaseAdmin();
    if (!db) throw new Error("Firebase Admin Firestore is not initialized.");
    return (db as any)[prop];
  },
});

export const adminAuthProxy = new Proxy({} as any, {
  get(_target, prop) {
    return async (...args: any[]) => {
      const auth = await getAdminAuth();
      if (!auth) throw new Error("Firebase Admin Auth is not initialized.");
      return (auth as any)[prop](...args);
    };
  },
});

export { adminDbProxy as adminDb, adminAuthProxy as adminAuth, FieldValue };
