import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseDb, getIdTokenSafe } from "@/lib/firebase";

export type AppEnvironment = "production" | "develop" | "localhost";

export function getAppEnvironment(): AppEnvironment {
  if (typeof window === "undefined") {
    if (process.env.VERCEL_ENV === "production") return "production";
    return "localhost";
  }

  const hostname = window.location.hostname.toLowerCase();

  // 1. Production domain
  if (hostname === "snapframe.store" || hostname === "www.snapframe.store") {
    return "production";
  }

  // 2. Develop / Preview domain
  if (
    hostname === "develop.snapframe.store" ||
    hostname.startsWith("develop.") ||
    hostname.includes("develop-") ||
    hostname.includes("preview") ||
    hostname.endsWith(".vercel.app")
  ) {
    return "develop";
  }

  // 3. Localhost / default
  return "localhost";
}

export function getEnvironmentLabel(env: string): string {
  switch (env) {
    case "production":
      return "Production (snapframe.store)";
    case "develop":
      return "Develop (develop.snapframe.store)";
    case "localhost":
      return "Localhost (Development)";
    default:
      return env;
  }
}

export interface EnvironmentVerificationResult {
  allowed: boolean;
  registeredEnvironment?: AppEnvironment;
  currentEnvironment: AppEnvironment;
  error?: string;
  isPro?: boolean;
  plan?: string | null;
  subscriptionStatus?: string | null;
  aiCredits?: number;
  usedAiCredits?: number;
}

/**
 * Verifies that the user is registering / logging in on their authorized environment.
 * If the user was registered on another environment, access is blocked.
 */
export async function verifyAndSyncUserEnvironment(
  user: User | any
): Promise<EnvironmentVerificationResult> {
  const currentEnv = getAppEnvironment();

  if (!user || !user.uid) {
    return { allowed: true, currentEnvironment: currentEnv, isPro: false, aiCredits: 0 };
  }

  // Anonymous guest sessions are scoped to current environment locally with 0 AI credits
  if (user.isAnonymous) {
    return { allowed: true, registeredEnvironment: currentEnv, currentEnvironment: currentEnv, isPro: false, aiCredits: 0 };
  }

  // 1. Try server-side API verification first (secure & bypasses client Firestore rules)
  try {
    const idToken = await getIdTokenSafe(user);
    const res = await fetch("/api/auth/verify-environment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        environment: currentEnv,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.allowed) {
        return {
          allowed: false,
          registeredEnvironment: data.registeredEnvironment,
          currentEnvironment: currentEnv,
          error:
            data.message ||
            `This account is registered on ${getEnvironmentLabel(
              data.registeredEnvironment
            )} and cannot be used on ${getEnvironmentLabel(currentEnv)}.`,
        };
      }
      return {
        allowed: true,
        registeredEnvironment: data.registeredEnvironment || currentEnv,
        currentEnvironment: currentEnv,
        isPro: Boolean(data.isPro),
        plan: data.plan || null,
        subscriptionStatus: data.subscriptionStatus || null,
        aiCredits: typeof data.aiCredits === "number" ? data.aiCredits : 3,
        usedAiCredits: typeof data.usedAiCredits === "number" ? data.usedAiCredits : 0,
      };
    }
  } catch (apiErr) {
    console.warn("[AuthEnv] Server verification endpoint error, falling back to client Firestore:", apiErr);
  }

  // 2. Client-side Firestore fallback
  try {
    const db = await getFirebaseDb();
    if (!db) {
      // If Firestore is completely offline/unconfigured, allow local dev
      return { allowed: true, registeredEnvironment: currentEnv, currentEnvironment: currentEnv };
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const registeredEnv = data.registeredEnvironment as AppEnvironment | undefined;

      if (registeredEnv && registeredEnv !== currentEnv) {
        return {
          allowed: false,
          registeredEnvironment: registeredEnv,
          currentEnvironment: currentEnv,
          error: `This account is registered on ${getEnvironmentLabel(
            registeredEnv
          )} and cannot be accessed from ${getEnvironmentLabel(currentEnv)}.`,
        };
      }

      // If registeredEnvironment was not set previously, set it now
      await updateDoc(userRef, {
        registeredEnvironment: registeredEnv || currentEnv,
        lastLoginAt: Date.now(),
        lastLoginEnvironment: currentEnv,
      });

      return {
        allowed: true,
        registeredEnvironment: registeredEnv || currentEnv,
        currentEnvironment: currentEnv,
        isPro: Boolean(data.isPro),
        plan: data.plan || null,
        subscriptionStatus: data.subscriptionStatus || null,
        aiCredits: typeof data.aiCredits === "number" ? data.aiCredits : 3,
        usedAiCredits: typeof data.usedAiCredits === "number" ? data.usedAiCredits : 0,
      };
    } else {
      // First-time registration for this user
      // Also verify if another doc with the same email exists with a different environment
      if (user.email) {
        try {
          const emailQuery = query(collection(db, "users"), where("email", "==", user.email));
          const querySnap = await getDocs(emailQuery);
          for (const docItem of querySnap.docs) {
            const docData = docItem.data();
            if (docData.registeredEnvironment && docData.registeredEnvironment !== currentEnv) {
              return {
                allowed: false,
                registeredEnvironment: docData.registeredEnvironment,
                currentEnvironment: currentEnv,
                error: `An account with email ${user.email} is already registered on ${getEnvironmentLabel(
                  docData.registeredEnvironment
                )} and cannot be accessed from ${getEnvironmentLabel(currentEnv)}.`,
              };
            }
          }
        } catch (emailQueryErr) {
          console.warn("[AuthEnv] Email query check warning:", emailQueryErr);
        }
      }

      // Create new user record
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        registeredEnvironment: currentEnv,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        lastLoginEnvironment: currentEnv,
        isPro: false,
        plan: null,
        subscriptionStatus: null,
        aiCredits: 3,
        usedAiCredits: 0,
      });

      return {
        allowed: true,
        registeredEnvironment: currentEnv,
        currentEnvironment: currentEnv,
        isPro: false,
        plan: null,
        subscriptionStatus: null,
        aiCredits: 3,
        usedAiCredits: 0,
      };
    }
  } catch (firestoreErr) {
    console.error("[AuthEnv] Client-side Firestore verification error:", firestoreErr);
    // In case of network error, allow local execution without crashing
    return { allowed: true, registeredEnvironment: currentEnv, currentEnvironment: currentEnv, isPro: false, aiCredits: 3 };
  }
}
