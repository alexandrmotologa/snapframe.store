import { create } from "zustand";
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  linkWithPopup,
  linkWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirebaseAuth, getIdTokenSafe } from "@/lib/firebase";
import { toast } from "@/lib/store/toastStore";
import { verifyAndSyncUserEnvironment } from "@/lib/authEnvironment";
import { syncProjectsOnLogin, stopCloudSync } from "@/lib/cloudProjectSync";
import { DEFAULT_FREE_AI_CREDITS } from "@/lib/constants";

interface AuthState {
  user: User | any | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  authError: string | null;
  isInitialized: boolean;
  isPro: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  aiCredits: number;
  usedAiCredits: number;

  setAuthModalOpen: (open: boolean) => void;
  setUpgradeModalOpen: (open: boolean) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  signIn: (provider: "google" | "github") => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  signInWithGithub: () => Promise<User | null>;
  signInAnonymous: () => Promise<any>;
  link: (provider: "google" | "github") => Promise<User | null>;
  linkWithGoogle: () => Promise<User | null>;
  linkWithGithub: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  consumeAiCredit: (feature?: string) => Promise<{ allowed: boolean; remaining: number; isPro: boolean }>;
  setProStatus: (isPro: boolean, plan?: string) => void;
}

interface CachedAuthSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAnonymous: boolean;
  } | null;
  isPro: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  aiCredits: number;
  usedAiCredits: number;
  timestamp: number;
}

const AUTH_STORAGE_KEY = "snapframe-cached-auth-session";

function getInitialCachedAuth(): {
  user: any | null;
  isInitialized: boolean;
  isPro: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
  aiCredits: number;
  usedAiCredits: number;
} {
  if (typeof window === "undefined") {
    return {
      user: null,
      isInitialized: false,
      isPro: false,
      plan: null,
      subscriptionStatus: null,
      aiCredits: 0,
      usedAiCredits: 0,
    };
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed: CachedAuthSession = JSON.parse(raw);
      if (parsed && parsed.user && typeof parsed.user.uid === "string") {
        return {
          user: parsed.user,
          isInitialized: true,
          isPro: Boolean(parsed.isPro),
          plan: parsed.plan || null,
          subscriptionStatus: parsed.subscriptionStatus || null,
          aiCredits: typeof parsed.aiCredits === "number" ? parsed.aiCredits : 3,
          usedAiCredits: typeof parsed.usedAiCredits === "number" ? parsed.usedAiCredits : 0,
        };
      }
    }
  } catch (e) {
    console.warn("Cached auth load error:", e);
  }

  return {
    user: null,
    isInitialized: false,
    isPro: false,
    plan: null,
    subscriptionStatus: null,
    aiCredits: 0,
    usedAiCredits: 0,
  };
}

function persistAuthSession(state: {
  user: any | null;
  isPro?: boolean;
  plan?: string | null;
  subscriptionStatus?: string | null;
  aiCredits?: number;
  usedAiCredits?: number;
}) {
  if (typeof window === "undefined") return;
  try {
    if (!state.user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const session: CachedAuthSession = {
      user: {
        uid: state.user.uid,
        email: state.user.email || null,
        displayName: state.user.displayName || null,
        photoURL: state.user.photoURL || null,
        isAnonymous: Boolean(state.user.isAnonymous),
      },
      isPro: Boolean(state.isPro),
      plan: state.plan || null,
      subscriptionStatus: state.subscriptionStatus || null,
      aiCredits: typeof state.aiCredits === "number" ? state.aiCredits : 3,
      usedAiCredits: typeof state.usedAiCredits === "number" ? state.usedAiCredits : 0,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Cached auth save error:", e);
  }
}

async function handleProviderAuth(
  providerName: "google" | "github",
  mode: "signIn" | "link",
  set: any,
  get: any
): Promise<User | null> {
  try {
    set({ isLoading: true, authError: null });
    const { auth, googleProvider, githubProvider } = await getFirebaseAuth();
    const provider = providerName === "google" ? googleProvider : githubProvider;

    if (!auth || !provider) {
      const errMsg = "Firebase Auth credentials not found. Please check .env configuration.";
      set({ authError: errMsg, isLoading: false });
      toast.error(errMsg);
      return null;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {}

    const currentUser = auth.currentUser;
    const isLinking = mode === "link" && currentUser && currentUser.isAnonymous;

    try {
      const result = isLinking
        ? await linkWithPopup(currentUser, provider)
        : await signInWithPopup(auth, provider);

      const verification = await verifyAndSyncUserEnvironment(result.user);
      if (!verification.allowed) {
        await signOut(auth);
        persistAuthSession({ user: null });
        const err = verification.error || "This account is not allowed on this environment.";
        set({ user: null, isAuthModalOpen: true, isLoading: false, authError: err });
        toast.error(err);
        return null;
      }

      const isProVal = Boolean(verification.isPro);
      const planVal = verification.plan || null;
      const subStatusVal = verification.subscriptionStatus || null;
      const creditsVal = typeof verification.aiCredits === "number" ? verification.aiCredits : DEFAULT_FREE_AI_CREDITS;
      const usedVal = typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0;

      persistAuthSession({
        user: result.user,
        isPro: isProVal,
        plan: planVal,
        subscriptionStatus: subStatusVal,
        aiCredits: creditsVal,
        usedAiCredits: usedVal,
      });

      set({
        user: result.user,
        isAuthModalOpen: false,
        isLoading: false,
        authError: null,
        isInitialized: true,
        isPro: isProVal,
        plan: planVal,
        subscriptionStatus: subStatusVal,
        aiCredits: creditsVal,
        usedAiCredits: usedVal,
      });

      const welcomeName = result.user.displayName || result.user.email || (providerName === "github" ? "Developer" : "Creator");
      toast.success(isLinking ? `Account linked! Welcome, ${welcomeName}!` : `Welcome, ${welcomeName}!`);
      return result.user;
    } catch (popupErr: any) {
      if (popupErr.code === "auth/credential-already-in-use" && isLinking) {
        return await handleProviderAuth(providerName, "signIn", set, get);
      }
      if (popupErr.code === "auth/popup-blocked") {
        if (isLinking) {
          await linkWithRedirect(currentUser, provider);
        } else {
          await signInWithRedirect(auth, provider);
        }
        return null;
      }
      throw popupErr;
    }
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      set({ isLoading: false, isAuthModalOpen: false, authError: null });
      return null;
    }

    let message = error.message || `Failed to authenticate with ${providerName === "google" ? "Google" : "GitHub"}`;
    if (error.code === "auth/account-exists-with-different-credential") {
      message = "An account already exists with this email address.";
    } else if (error.code === "auth/configuration-not-found" || error.code === "auth/operation-not-allowed") {
      message = `${providerName === "google" ? "Google" : "GitHub"} Sign-In is not enabled yet in Firebase Console.`;
    } else if (error.code === "auth/unauthorized-domain") {
      message = "This domain is not authorized in Firebase Console.";
    }

    set({ authError: message, isLoading: false });
    toast.error(message);
    return null;
  }
}

const initialCached = getInitialCachedAuth();

export const useAuthStore = create<AuthState>((set, get) => {
  // Attach auth listener and check redirect results on startup
  if (typeof window !== "undefined") {
    setTimeout(async () => {
      try {
        const { auth } = await getFirebaseAuth();
        if (auth) {
          try {
            await setPersistence(auth, browserLocalPersistence);
          } catch {}

          // Seamless check if user just returned from a redirect fallback
          try {
            const redirectResult = await getRedirectResult(auth);
            if (redirectResult?.user) {
              const verification = await verifyAndSyncUserEnvironment(redirectResult.user);
              if (!verification.allowed) {
                await signOut(auth);
                persistAuthSession({ user: null });
                set({
                  user: null,
                  isLoading: false,
                  isAuthModalOpen: true,
                  authError: verification.error || "Account environment mismatch.",
                  isInitialized: true,
                });
                toast.error(verification.error || "Access denied for this environment.");
                return;
              }

              const isProVal = Boolean(verification.isPro);
              const planVal = verification.plan || null;
              const subStatusVal = verification.subscriptionStatus || null;
              const creditsVal = typeof verification.aiCredits === "number" ? verification.aiCredits : 3;
              const usedVal = typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0;

              persistAuthSession({
                user: redirectResult.user,
                isPro: isProVal,
                plan: planVal,
                subscriptionStatus: subStatusVal,
                aiCredits: creditsVal,
                usedAiCredits: usedVal,
              });

              set({
                user: redirectResult.user,
                isLoading: false,
                isAuthModalOpen: false,
                isInitialized: true,
                isPro: isProVal,
                plan: planVal,
                subscriptionStatus: subStatusVal,
                aiCredits: creditsVal,
                usedAiCredits: usedVal,
              });
              toast.success(`Welcome, ${redirectResult.user.displayName || "Creator"}!`);
              return;
            }
          } catch (redirectErr: any) {
            console.warn("Redirect result check:", redirectErr);
          }

          onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
              const verification = await verifyAndSyncUserEnvironment(currentUser);
              if (!verification.allowed) {
                await signOut(auth);
                persistAuthSession({ user: null });
                set({
                  user: null,
                  isLoading: false,
                  isAuthModalOpen: false,
                  authError: verification.error || "Account environment mismatch.",
                  isInitialized: true,
                });
                toast.error(verification.error || "Access denied for this environment.");
                return;
              }

              const isProVal = Boolean(verification.isPro);
              const planVal = verification.plan || null;
              const subStatusVal = verification.subscriptionStatus || null;
              const creditsVal = typeof verification.aiCredits === "number" ? verification.aiCredits : (currentUser.isAnonymous ? 0 : 3);
              const usedVal = typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0;

              persistAuthSession({
                user: currentUser,
                isPro: isProVal,
                plan: planVal,
                subscriptionStatus: subStatusVal,
                aiCredits: creditsVal,
                usedAiCredits: usedVal,
              });

              set({
                user: currentUser,
                isLoading: false,
                isInitialized: true,
                isPro: isProVal,
                plan: planVal,
                subscriptionStatus: subStatusVal,
                aiCredits: creditsVal,
                usedAiCredits: usedVal,
              });

              // Trigger multi-device cloud project sync
              if (!currentUser.isAnonymous) {
                try {
                  syncProjectsOnLogin(currentUser.uid);
                } catch {}
              }
            } else {
              try {
                stopCloudSync();
              } catch {}
              const currentLocalUser = get().user;
              if (!currentLocalUser?.isAnonymous || currentLocalUser?.email) {
                persistAuthSession({ user: null });
                set({ user: null, isLoading: false, isInitialized: true, isPro: false, aiCredits: 0 });
              } else {
                set({ isLoading: false, isInitialized: true, isPro: false, aiCredits: 0 });
              }
            }
          });
        } else {
          set({ isLoading: false, isInitialized: true });
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
        set({ isLoading: false, isInitialized: true });
      }
    }, 10);
  }

  return {
    user: initialCached.user,
    isLoading: false,
    isAuthModalOpen: false,
    isUpgradeModalOpen: false,
    authError: null,
    isInitialized: initialCached.isInitialized,
    isPro: initialCached.isPro,
    plan: initialCached.plan,
    subscriptionStatus: initialCached.subscriptionStatus,
    aiCredits: initialCached.aiCredits,
    usedAiCredits: initialCached.usedAiCredits,

    setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
    setUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
    clearError: () => set({ authError: null }),
    setProStatus: (isPro, plan) => {
      const nextPlan = plan || (isPro ? "pro-monthly" : null);
      set({ isPro, plan: nextPlan });
      persistAuthSession({ ...get(), isPro, plan: nextPlan });
    },

    consumeAiCredit: async (feature = "general") => {
      const state = get();
      const currentUser = state.user;

      // 1. If Guest (unregistered / anonymous), block & prompt sign in
      if (!currentUser || currentUser.isAnonymous) {
        set({ isAuthModalOpen: true });
        toast.info("AI features require a free account. Sign in with Google or GitHub to get 3 free AI credits!");
        return { allowed: false, remaining: 0, isPro: false };
      }

      // 2. If Pro, check daily Fair-Use safety limit (150 AI calls / day)
      if (state.isPro) {
        if (typeof window !== "undefined") {
          const todayStr = new Date().toISOString().split("T")[0];
          const usageKey = `sf_pro_ai_usage_${currentUser.uid}_${todayStr}`;
          const currentDailyUsage = parseInt(localStorage.getItem(usageKey) || "0", 10);

          if (currentDailyUsage >= 150) {
            toast.info("⚡ You've reached today's 150 AI generations limit (Fair Usage Policy). Resets at midnight UTC.");
            return { allowed: false, remaining: 0, isPro: true };
          }

          localStorage.setItem(usageKey, (currentDailyUsage + 1).toString());
        }
        return { allowed: true, remaining: 9999, isPro: true };
      }

      // 3. If credits exhausted, open Upgrade modal
      if (state.aiCredits <= 0) {
        set({ isUpgradeModalOpen: true });
        toast.info("You've used all 3 free AI credits. Upgrade to SnapFrame Pro for unlimited AI!");
        return { allowed: false, remaining: 0, isPro: false };
      }

      // 4. Consume 1 credit via API
      try {
        const idToken = await getIdTokenSafe(currentUser);
        const res = await fetch("/api/ai/consume-credit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({ uid: currentUser.uid, feature }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.allowed) {
            const remaining = typeof data.remaining === "number" ? data.remaining : Math.max(0, state.aiCredits - 1);
            const nextUsed = (state.usedAiCredits || 0) + 1;
            const nextIsPro = Boolean(data.isPro);
            set({
              aiCredits: remaining,
              usedAiCredits: nextUsed,
              isPro: nextIsPro,
            });
            persistAuthSession({ ...get(), aiCredits: remaining, usedAiCredits: nextUsed, isPro: nextIsPro });
            if (remaining === 0) {
              toast.info("⚡ Last free AI credit used! Upgrade to Pro anytime for unlimited generations.");
            }
            return { allowed: true, remaining, isPro: nextIsPro };
          } else {
            set({ isUpgradeModalOpen: true, aiCredits: 0 });
            persistAuthSession({ ...get(), aiCredits: 0 });
            toast.info(data.message || "Free AI credits exhausted. Upgrade to Pro for unlimited AI!");
            return { allowed: false, remaining: 0, isPro: false };
          }
        }
      } catch (err) {
        console.warn("Credit API error, falling back locally:", err);
      }

      // Local fallback decrement
      const nextRemaining = Math.max(0, state.aiCredits - 1);
      const nextUsed = (state.usedAiCredits || 0) + 1;
      set({ aiCredits: nextRemaining, usedAiCredits: nextUsed });
      persistAuthSession({ ...get(), aiCredits: nextRemaining, usedAiCredits: nextUsed });
      return { allowed: true, remaining: nextRemaining, isPro: false };
    },

    initializeAuth: async () => {
      await getFirebaseAuth();
      return;
    },

    signIn: async (provider: "google" | "github") => {
      return await handleProviderAuth(provider, "signIn", set, get);
    },

    signInWithGoogle: async () => {
      return await get().signIn("google");
    },

    signInWithGithub: async () => {
      return await get().signIn("github");
    },

    signInAnonymous: async () => {
      try {
        set({ isLoading: true, authError: null });
        const { auth } = await getFirebaseAuth();

        if (auth) {
          try {
            const result = await signInAnonymously(auth);
            persistAuthSession({ user: result.user, isPro: false, aiCredits: 0 });
            set({ user: result.user, isAuthModalOpen: false, isLoading: false, isInitialized: true, isPro: false, aiCredits: 0 });
            toast.info("Continuing in Guest Mode (30-day auto clean-up applies). Link an account to keep projects permanently.");
            return result.user;
          } catch (firebaseErr: any) {
            console.warn("Firebase Anonymous Sign-In fallback to local guest:", firebaseErr);
          }
        }

        // Local Guest Session Fallback (Zero network friction)
        const guestId = "guest_" + Math.random().toString(36).slice(2, 10);
        const guestUser = {
          uid: guestId,
          isAnonymous: true,
          displayName: "Guest Creator",
          email: null,
          photoURL: null,
        };
        persistAuthSession({ user: guestUser, isPro: false, aiCredits: 0 });
        set({ user: guestUser, isAuthModalOpen: false, isLoading: false, isInitialized: true, isPro: false, aiCredits: 0 });
        toast.info("Continuing in Guest Mode. Note: Anonymous accounts are subject to 30-day auto clean-up.");
        return guestUser;
      } catch (error: any) {
        console.error("Anonymous Sign-In Error:", error);
        const fallbackGuest = {
          uid: "guest_" + Date.now(),
          isAnonymous: true,
          displayName: "Guest Creator",
          email: null,
          photoURL: null,
        };
        persistAuthSession({ user: fallbackGuest, isPro: false, aiCredits: 0 });
        set({ user: fallbackGuest, isAuthModalOpen: false, isLoading: false, isInitialized: true, isPro: false, aiCredits: 0 });
        toast.info("Continuing in Guest Mode.");
        return fallbackGuest;
      }
    },

    link: async (provider: "google" | "github") => {
      return await handleProviderAuth(provider, "link", set, get);
    },

    linkWithGoogle: async () => {
      return await get().link("google");
    },

    linkWithGithub: async () => {
      return await get().link("github");
    },

    signOutUser: async () => {
      try {
        set({ isLoading: true });
        const { auth } = await getFirebaseAuth();
        if (auth) {
          await signOut(auth);
        }
        persistAuthSession({ user: null });
        set({ user: null, isLoading: false, isInitialized: true, isPro: false, plan: null, subscriptionStatus: null, aiCredits: 0, usedAiCredits: 0 });
        toast.info("Signed out successfully.");
      } catch (error: any) {
        console.error("Sign-out Error:", error);
        persistAuthSession({ user: null });
        set({ user: null, isLoading: false, isInitialized: true, isPro: false, plan: null, subscriptionStatus: null, aiCredits: 0, usedAiCredits: 0 });
        toast.info("Signed out.");
      }
    },
  };
});
