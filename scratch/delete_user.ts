import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
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
  const targetEmail = "doe943799@gmail.com";
  console.log(`Starting deletion for user: ${targetEmail}`);

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, "");
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const app = getApps().length === 0
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    : getApps()[0];

  const db = getFirestore(app);
  const auth = getAuth(app);

  let targetUid: string | null = null;

  // 1. Find and delete in Firebase Auth
  try {
    const authUser = await auth.getUserByEmail(targetEmail);
    targetUid = authUser.uid;
    console.log(`Found Firebase Auth user: UID = ${targetUid}`);
    await auth.deleteUser(targetUid);
    console.log(`✅ Deleted user from Firebase Auth (UID: ${targetUid})`);
  } catch (authErr: any) {
    if (authErr?.code === "auth/user-not-found") {
      console.log(`ℹ️ User not found in Firebase Auth`);
    } else {
      console.error(`Firebase Auth lookup/delete error:`, authErr);
    }
  }

  // 2. Find and delete in Firestore
  const usersByEmail = await db.collection("users").where("email", "==", targetEmail).get();
  const uidsToDelete = new Set<string>();
  if (targetUid) uidsToDelete.add(targetUid);
  usersByEmail.forEach((doc) => uidsToDelete.add(doc.id));

  for (const uid of uidsToDelete) {
    const userRef = db.collection("users").doc(uid);

    // Delete subcollections: projects, credit_logs, transactions
    const subcollections = ["projects", "credit_logs", "transactions"];
    for (const sub of subcollections) {
      const subDocs = await userRef.collection(sub).get();
      for (const d of subDocs.docs) {
        await d.ref.delete();
      }
      if (!subDocs.empty) {
        console.log(`✅ Deleted ${subDocs.size} documents from subcollection ${sub} of user ${uid}`);
      }
    }

    // Delete root user document
    await userRef.delete();
    console.log(`✅ Deleted Firestore document users/${uid}`);
  }

  console.log(`🎉 Completed complete deletion of ${targetEmail} from Firebase Auth & Firestore.`);
}

main().catch(console.error);
