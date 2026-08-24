"use client";

import { toast } from "@/lib/store/toastStore";

declare global {
  interface Window {
    Paddle?: any;
  }
}

/**
 * Dynamically resolves Paddle environment and credentials based on domain & environment variables
 */
export function getPaddleConfig() {
  const isBrowser = typeof window !== "undefined";
  const hostname = isBrowser ? window.location.hostname : "";

  // Auto-detect sandbox on develop.snapframe.store, localhost, or Vercel preview URLs
  const isDevelopOrLocal =
    hostname.includes("develop.snapframe.store") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("vercel.app");

  // Determine active environment
  const forcedEnv = process.env.NEXT_PUBLIC_PADDLE_ENV?.toLowerCase();
  const environment: "sandbox" | "production" =
    forcedEnv === "production"
      ? "production"
      : forcedEnv === "sandbox"
      ? "sandbox"
      : isDevelopOrLocal
      ? "sandbox"
      : "production";

  // Resolve Client Token
  const clientToken =
    environment === "sandbox"
      ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN ||
        process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
        ""
      : process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
        process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN ||
        "";

  // Resolve Price IDs
  const monthlyPriceId =
    environment === "sandbox"
      ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY ||
        process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ||
        ""
      : process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ||
        process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY ||
        "";

  const annualPriceId =
    environment === "sandbox"
      ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ANNUAL ||
        process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ||
        ""
      : process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ||
        process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ANNUAL ||
        "";

  return {
    environment,
    clientToken,
    prices: {
      monthly: monthlyPriceId,
      annual: annualPriceId,
    },
    isLive: environment === "production",
  };
}

let paddleInitialized = false;

/**
 * Ensures Paddle.js is loaded and initialized in the browser
 */
export async function initializePaddle(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const config = getPaddleConfig();
  if (!config.clientToken) return false;

  if (paddleInitialized && window.Paddle) {
    return true;
  }

  return new Promise((resolve) => {
    const initInstance = () => {
      try {
        if (!window.Paddle) {
          resolve(false);
          return;
        }

        window.Paddle.Environment.set(config.environment);
        window.Paddle.Initialize({
          token: config.clientToken,
          eventCallback: (data: any) => {
            if (process.env.NODE_ENV !== "production" || config.environment === "sandbox") {
              console.log("[Paddle Event]", data);
            }
          },
        });
        paddleInitialized = true;
        resolve(true);
      } catch (e) {
        console.warn("[Paddle Init Warning]:", e);
        resolve(false);
      }
    };

    // If Paddle script is already present
    if (window.Paddle) {
      initInstance();
      return;
    }

    // Load Paddle.js dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => initInstance();
    script.onerror = () => {
      console.warn("Failed to load Paddle.js CDN script");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

export interface CheckoutOptions {
  plan: "monthly" | "annual";
  userEmail?: string | null;
  userId?: string | null;
  onSuccess?: () => void;
}

/**
 * Opens Paddle Checkout Overlay for Subscription Upgrade
 */
export async function openPaddleCheckout({
  plan,
  userEmail,
  userId,
  onSuccess,
}: CheckoutOptions) {
  const config = getPaddleConfig();
  const priceId = plan === "annual" ? config.prices.annual : config.prices.monthly;

  // Fallback demo simulation if Paddle keys have not yet been configured in environment
  const isDummyOrMissing =
    !config.clientToken ||
    !priceId ||
    config.clientToken.startsWith("test_0123") ||
    config.clientToken.startsWith("test_4ec75") ||
    priceId.startsWith("pri_0123") ||
    priceId.startsWith("pri_01m0g") ||
    priceId.startsWith("pri_monthly_snapframe_pro") ||
    priceId.startsWith("pri_annual_snapframe_pro");

  if (isDummyOrMissing) {
    console.log(`[Paddle] Simulation mode (${config.environment}) for:`, {
      plan,
      userEmail,
      userId,
    });
    toast.info(
      `Demo Mode: Paddle API keys not configured. Simulating Pro Upgrade for testing (${
        plan === "annual" ? "$69/year" : "$9/month"
      })...`
    );

    setTimeout(() => {
      toast.success("🎉 Welcome to SnapFrame Pro! (Test Upgrade Active)");
      onSuccess?.();
    }, 800);
    return;
  }

  const isLoaded = await initializePaddle();

  if (!isLoaded || !window.Paddle) {
    toast.error("Unable to load Paddle payment gateway. Please check your connection or ad-blocker.");
    return;
  }

  try {
    window.Paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "dark",
        locale: "en",
        successUrl:
          typeof window !== "undefined"
            ? `${window.location.origin}/projects?checkout=success`
            : undefined,
      },
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      customer: userEmail ? { email: userEmail } : undefined,
      customData: {
        user_id: userId || "",
        user_email: userEmail || "",
        plan,
        environment: config.environment,
      },
    });
  } catch (err: any) {
    console.error("Paddle Checkout error:", err);
    toast.error("Failed to open payment checkout. Please try again or contact support.");
  }
}

