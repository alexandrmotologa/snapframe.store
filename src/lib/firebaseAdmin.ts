import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  ? process.env.FIREBASE_CLIENT_EMAIL.trim().replace(/^["']|["']$/g, "")
  : undefined;

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  // Strip outer quotes if pasted with quotes
  if ((formatted.startsWith('"') && formatted.endsWith('"')) || (formatted.startsWith("'") && formatted.endsWith("'"))) {
    formatted = formatted.slice(1, -1);
  }
  // Replace escaped newlines
  formatted = formatted.replace(/\\n/g, "\n").replace(/\\r/g, "");
  return formatted;
}

const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

if (isAdminConfigured) {
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
    console.error("Firebase Admin initialization error:", error?.message || "Unknown initialization error");
  }
}

export { adminDb, adminAuth, FieldValue };
