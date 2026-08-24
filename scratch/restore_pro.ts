import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  if ((formatted.startsWith('"') && formatted.endsWith('"')) || (formatted.startsWith("'") && formatted.endsWith("'"))) {
    formatted = formatted.slice(1, -1);
  }
  formatted = formatted.replace(/\\n/g, "\n").replace(/\\r/g, "");
  return formatted;
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, "");
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  console.log("Connecting to Firestore with project:", projectId);
  const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
  const db = getFirestore(app);

  const snapshot = await db.collection("users").where("email", "==", "doe943799@gmail.com").get();
  if (snapshot.empty) {
    console.log("No user found with email doe943799@gmail.com");
    return;
  }

  const userDoc = snapshot.docs[0];
  const expiresAt = Date.now() + 30 * 86400000; // 30 days from now

  await userDoc.ref.set({
    isPro: true,
    subscriptionStatus: "canceled",
    subscriptionExpiresAt: expiresAt,
    aiCredits: 9999,
    updatedAt: Date.now(),
  }, { merge: true });

  console.log("Successfully updated user", userDoc.id, "to isPro: true (canceled, active until", new Date(expiresAt).toISOString(), ")");
}

main().catch(console.error);
