import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

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
  auth: Auth | null;
  isConfigured: boolean;
} {
  if (adminApp && adminDb && adminAuth) {
    return { app: adminApp, db: adminDb, auth: adminAuth, isConfigured: true };
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
    return { app: null, db: null, auth: null, isConfigured: false };
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
    adminAuth = getAuth(adminApp);
  } catch (error: any) {
    console.error("[Firebase Admin] Initialization error:", error?.message || error);
    return { app: null, db: null, auth: null, isConfigured: false };
  }

  return {
    app: adminApp,
    db: adminDb,
    auth: adminAuth,
    isConfigured: Boolean(adminApp && adminDb && adminAuth),
  };
}

export const isAdminConfigured = Boolean(
  (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

// Lazy proxies for backward compatibility
export const adminDbProxy = new Proxy({} as Firestore, {
  get(_target, prop) {
    const { db } = getFirebaseAdmin();
    if (!db) throw new Error("Firebase Admin Firestore is not initialized.");
    return (db as any)[prop];
  },
});

export const adminAuthProxy = new Proxy({} as Auth, {
  get(_target, prop) {
    const { auth } = getFirebaseAdmin();
    if (!auth) throw new Error("Firebase Admin Auth is not initialized.");
    return (auth as any)[prop];
  },
});

export { adminDbProxy as adminDb, adminAuthProxy as adminAuth, FieldValue };
