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
  console.log("==================================================");
  console.log("🚨 Starting complete cleanup of all users from Firebase Auth & Firestore");
  console.log("==================================================");

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, "");
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const app = getApps().length === 0
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    : getApps()[0];

  const db = getFirestore(app);
  const auth = getAuth(app);

  // 1. Delete all users from Firebase Auth
  console.log("\n--- STEP 1: Cleaning up Firebase Authentication ---");
  let nextPageToken: string | undefined = undefined;
  let totalAuthDeleted = 0;

  do {
    const listUsersResult = await auth.listUsers(100, nextPageToken);
    const uids = listUsersResult.users.map((u) => u.uid);

    if (uids.length > 0) {
      const deleteResult = await auth.deleteUsers(uids);
      totalAuthDeleted += deleteResult.successCount;
      console.log(`Deleted ${deleteResult.successCount} users from Firebase Auth. (Failures: ${deleteResult.failureCount})`);
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`✅ Total Firebase Auth users deleted: ${totalAuthDeleted}`);

  // 2. Delete all user documents and subcollections in Firestore
  console.log("\n--- STEP 2: Cleaning up Cloud Firestore 'users' collection ---");
  const usersSnapshot = await db.collection("users").get();
  console.log(`Found ${usersSnapshot.size} user document(s) in Firestore.`);

  let totalFirestoreDeleted = 0;
  const subcollections = ["projects", "credit_logs", "transactions"];

  for (const userDoc of usersSnapshot.docs) {
    const userRef = userDoc.ref;

    // Delete known subcollections
    for (const sub of subcollections) {
      const subSnapshot = await userRef.collection(sub).get();
      if (!subSnapshot.empty) {
        for (const d of subSnapshot.docs) {
          await d.ref.delete();
        }
        console.log(`  - Deleted ${subSnapshot.size} doc(s) from subcollection '${sub}' of user ${userDoc.id}`);
      }
    }

    // Delete user doc
    await userRef.delete();
    totalFirestoreDeleted++;
    console.log(`  ✅ Deleted user document: ${userDoc.id} (${userDoc.data()?.email || "anonymous"})`);
  }

  console.log(`\n🎉 Complete! Deleted ${totalAuthDeleted} auth account(s) and ${totalFirestoreDeleted} Firestore user doc(s).`);
  console.log("Database & Auth are now 100% clean and ready for fresh testing from zero.");
}

main().catch(console.error);
