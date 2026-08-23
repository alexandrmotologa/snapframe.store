import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const inlineFirebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    "",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    "",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.FIREBASE_MEASUREMENT_ID ||
    "",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let githubProvider: GithubAuthProvider | null = null;
let initPromise: Promise<Auth | null> | null = null;

function setupProviders(_instanceAuth?: Auth) {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  githubProvider = new GithubAuthProvider();
  githubProvider.addScope("read:user");
  githubProvider.addScope("user:email");
}

// 1. Synchronous attempt (if NEXT_PUBLIC_* variables exist in client bundle)
if (inlineFirebaseConfig.apiKey && inlineFirebaseConfig.projectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(inlineFirebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setupProviders(auth);
  } catch (err) {
    console.warn("Firebase inline initialization warning:", err);
  }
}

// 2. Asynchronous helper: guarantees client has Auth initialized by fetching server config if needed
export async function getFirebaseAuth(): Promise<{
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
  githubProvider: GithubAuthProvider | null;
}> {
  if (auth) {
    return { auth, googleProvider, githubProvider };
  }

  if (initPromise) {
    await initPromise;
    return { auth, googleProvider, githubProvider };
  }

  initPromise = (async () => {
    try {
      if (typeof window === "undefined") return null;
      const res = await fetch("/api/auth/firebase-config");
      if (!res.ok) return null;
      const data = await res.json();
      if (data.isConfigured && data.config?.apiKey) {
        app = getApps().length > 0 ? getApp() : initializeApp(data.config);
        db = getFirestore(app);
        auth = getAuth(app);
        setupProviders(auth);
        return auth;
      }
    } catch (err) {
      console.warn("Dynamic Firebase config fetch error:", err);
    }
    return null;
  })();

  await initPromise;
  return { auth, googleProvider, githubProvider };
}

export async function getFirebaseDb(): Promise<Firestore | null> {
  if (db) {
    return db;
  }
  await getFirebaseAuth();
  return db;
}

export const isFirebaseConfigured = Boolean(
  inlineFirebaseConfig.apiKey && inlineFirebaseConfig.projectId
);

export { app, db, auth, googleProvider, githubProvider };
