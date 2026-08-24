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
import { getFirebaseAuth } from "@/lib/firebase";
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
        const err = verification.error || "This account is not allowed on this environment.";
        set({ user: null, isAuthModalOpen: true, isLoading: false, authError: err });
        toast.error(err);
        return null;
      }

      set({
        user: result.user,
        isAuthModalOpen: false,
        isLoading: false,
        authError: null,
        isPro: Boolean(verification.isPro),
        plan: verification.plan || null,
        subscriptionStatus: verification.subscriptionStatus || null,
        aiCredits: typeof verification.aiCredits === "number" ? verification.aiCredits : DEFAULT_FREE_AI_CREDITS,
        usedAiCredits: typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0,
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

              set({
                user: redirectResult.user,
                isLoading: false,
                isAuthModalOpen: false,
                isInitialized: true,
                isPro: Boolean(verification.isPro),
                plan: verification.plan || null,
                subscriptionStatus: verification.subscriptionStatus || null,
                aiCredits: typeof verification.aiCredits === "number" ? verification.aiCredits : 3,
                usedAiCredits: typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0,
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

              set({
                user: currentUser,
                isLoading: false,
                isInitialized: true,
                isPro: Boolean(verification.isPro),
                plan: verification.plan || null,
                subscriptionStatus: verification.subscriptionStatus || null,
                aiCredits: typeof verification.aiCredits === "number" ? verification.aiCredits : (currentUser.isAnonymous ? 0 : 3),
                usedAiCredits: typeof verification.usedAiCredits === "number" ? verification.usedAiCredits : 0,
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
    user: null,
    isLoading: false,
    isAuthModalOpen: false,
    isUpgradeModalOpen: false,
    authError: null,
    isInitialized: false,
    isPro: false,
    plan: null,
    subscriptionStatus: null,
    aiCredits: 0,
    usedAiCredits: 0,

    setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
    setUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
    clearError: () => set({ authError: null }),
    setProStatus: (isPro, plan) => set({ isPro, plan: plan || (isPro ? "pro-monthly" : null) }),

    consumeAiCredit: async (feature = "general") => {
      const state = get();
      const currentUser = state.user;

      // 1. If Guest (unregistered / anonymous), block & prompt sign in
      if (!currentUser || currentUser.isAnonymous) {
        set({ isAuthModalOpen: true });
        toast.info("AI features require a free account. Sign in with Google or GitHub to get 3 free AI credits!");
        return { allowed: false, remaining: 0, isPro: false };
      }

      // 2. If Pro, check daily Fair-Use safety limit (50 AI calls / day)
      if (state.isPro) {
        if (typeof window !== "undefined") {
          const todayStr = new Date().toISOString().split("T")[0];
          const usageKey = `sf_pro_ai_usage_${currentUser.uid}_${todayStr}`;
          const currentDailyUsage = parseInt(localStorage.getItem(usageKey) || "0", 10);

          if (currentDailyUsage >= 50) {
            toast.info("⚡ You've reached today's 50 AI generations limit (Fair Usage Policy). Resets at midnight UTC.");
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
        const idToken = await currentUser.getIdToken().catch(() => "");
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
            set({
              aiCredits: remaining,
              usedAiCredits: (state.usedAiCredits || 0) + 1,
              isPro: Boolean(data.isPro),
            });
            if (remaining === 0) {
              toast.info("⚡ Last free AI credit used! Upgrade to Pro anytime for unlimited generations.");
            }
            return { allowed: true, remaining, isPro: Boolean(data.isPro) };
          } else {
            set({ isUpgradeModalOpen: true, aiCredits: 0 });
            toast.info(data.message || "Free AI credits exhausted. Upgrade to Pro for unlimited AI!");
            return { allowed: false, remaining: 0, isPro: false };
          }
        }
      } catch (err) {
        console.warn("Credit API error, falling back locally:", err);
      }

      // Local fallback decrement
      const nextRemaining = Math.max(0, state.aiCredits - 1);
      set({ aiCredits: nextRemaining, usedAiCredits: (state.usedAiCredits || 0) + 1 });
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
            set({ user: result.user, isAuthModalOpen: false, isLoading: false, isPro: false, aiCredits: 0 });
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
        set({ user: guestUser, isAuthModalOpen: false, isLoading: false, isPro: false, aiCredits: 0 });
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
        set({ user: fallbackGuest, isAuthModalOpen: false, isLoading: false, isPro: false, aiCredits: 0 });
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
        set({ user: null, isLoading: false, isPro: false, plan: null, subscriptionStatus: null, aiCredits: 0, usedAiCredits: 0 });
        toast.info("Signed out successfully.");
      } catch (error: any) {
        console.error("Sign-out Error:", error);
        set({ user: null, isLoading: false, isPro: false, plan: null, subscriptionStatus: null, aiCredits: 0, usedAiCredits: 0 });
        toast.info("Signed out.");
      }
    },
  };
});
