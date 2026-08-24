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

  const isDevelopOrLocal =
    hostname.includes("develop.snapframe.store") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("vercel.app");

  // Determine target environment
  const forcedEnv = process.env.NEXT_PUBLIC_PADDLE_ENV?.toLowerCase();
  const rawToken =
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
    process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN ||
    "";

  let environment: "sandbox" | "production" = "production";
  if (forcedEnv === "production" || forcedEnv === "sandbox") {
    environment = forcedEnv;
  } else if (rawToken.startsWith("live_")) {
    environment = "production";
  } else if (rawToken.startsWith("test_")) {
    environment = "sandbox";
  } else if (isDevelopOrLocal) {
    environment = "sandbox";
  }

  // Resolve matching credentials for that environment
  const clientToken =
    environment === "sandbox"
      ? (process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN || process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "")
      : (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN || "");

  const monthlyPriceId =
    environment === "sandbox"
      ? (process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY || process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY || "")
      : (process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY || "");

  const annualPriceId =
    environment === "sandbox"
      ? (process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ANNUAL || process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL || "")
      : (process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ANNUAL || "");

  // Strict token-type alignment
  if (clientToken.startsWith("live_")) {
    environment = "production";
  } else if (clientToken.startsWith("test_")) {
    environment = "sandbox";
  }

  return {
    environment,
    clientToken: clientToken.trim(),
    prices: {
      monthly: monthlyPriceId.trim(),
      annual: annualPriceId.trim(),
    },
    isLive: environment === "production",
  };
}

let paddleInitialized = false;
let activeSuccessHandler: (() => void) | null = null;

/**
 * Ensures Paddle.js is loaded and initialized in the browser
 */
export async function initializePaddle(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const config = getPaddleConfig();
  if (!config.clientToken) {
    console.warn("[Paddle] Missing client token in environment");
    return false;
  }

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
            console.log("[Paddle Event]", data?.name, data);
            
            if (data?.name === "checkout.error" || data?.name === "checkout.warning") {
              console.error("[Paddle Checkout Error/Warning]:", data);
            }

            if (data?.name === "checkout.completed" || data?.data?.status === "completed") {
              toast.success("🎉 Payment successful! Welcome to SnapFrame Pro.");
              if (activeSuccessHandler) {
                activeSuccessHandler();
                activeSuccessHandler = null;
              }
            }
          },
        });
        paddleInitialized = true;
        resolve(true);
      } catch (e) {
        console.warn("[Paddle Init Error]:", e);
        resolve(false);
      }
    };

    // If Paddle script is already loaded on page
    if (window.Paddle) {
      initInstance();
      return;
    }

    // Load Paddle.js CDN script dynamically
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
 * Opens Official Paddle Checkout Overlay for Subscription Upgrade
 */
export async function openPaddleCheckout({
  plan,
  userEmail,
  userId,
  onSuccess,
}: CheckoutOptions) {
  const config = getPaddleConfig();
  const priceId = plan === "annual" ? config.prices.annual : config.prices.monthly;

  if (!config.clientToken || !priceId) {
    toast.error(
      "Paddle payment keys are not configured. Please verify NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and Price IDs in your Vercel project settings."
    );
    return;
  }

  const isLoaded = await initializePaddle();

  if (!isLoaded || !window.Paddle) {
    toast.error("Unable to load Paddle payment gateway. Please check your connection or ad-blocker.");
    return;
  }

  activeSuccessHandler = onSuccess || null;

  console.log("[Paddle] Opening Checkout with payload config:", {
    environment: config.environment,
    tokenPrefix: config.clientToken.slice(0, 10),
    priceId,
    userEmail: userEmail || "(none)",
  });

  const checkoutPayload: any = {
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
  };

  if (userEmail && userEmail.trim().includes("@")) {
    checkoutPayload.customer = { email: userEmail.trim() };
  }

  const customData: Record<string, string> = { plan };
  if (userId) customData.userId = userId;
  if (userEmail) customData.userEmail = userEmail;
  checkoutPayload.customData = customData;

  try {
    window.Paddle.Checkout.open(checkoutPayload);
  } catch (err: any) {
    console.error("Paddle Checkout error:", err);
    toast.error("Failed to open payment checkout. Please check your Paddle configuration.");
  }
}
