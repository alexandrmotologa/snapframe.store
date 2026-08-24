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

  // 1. Resolve Client Token from environment variables
  const clientToken =
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ||
    process.env.NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN ||
    "";

  // 2. Resolve Price IDs from environment variables
  const monthlyPriceId =
    process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ||
    process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_MONTHLY ||
    "";

  const annualPriceId =
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ||
    process.env.NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ANNUAL ||
    "";

  // 3. Determine Paddle Environment
  const forcedEnv = process.env.NEXT_PUBLIC_PADDLE_ENV?.toLowerCase();
  let environment: "sandbox" | "production" = "production";

  if (forcedEnv === "production") {
    environment = "production";
  } else if (forcedEnv === "sandbox") {
    environment = "sandbox";
  } else if (clientToken.startsWith("live_")) {
    environment = "production";
  } else if (clientToken.startsWith("test_")) {
    environment = "sandbox";
  } else if (
    hostname.includes("develop.snapframe.store") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1")
  ) {
    environment = "sandbox";
  }

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
            if (process.env.NODE_ENV !== "production" || config.environment === "sandbox") {
              console.log("[Paddle Event]", data);
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
    toast.error("Failed to open payment checkout. Please check your Paddle configuration.");
  }
}
