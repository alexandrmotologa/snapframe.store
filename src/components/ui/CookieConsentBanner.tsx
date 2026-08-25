"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";

const CONSENT_STORAGE_KEY = "snapframe-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consent) {
      // Delay slightly for smooth UX after initial paint
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    } else if (consent === "essential") {
      // Respect previous choice: disable analytics
      if (typeof window !== "undefined") {
        if (GA_ID) (window as any)[`ga-disable-${GA_ID}`] = true;
        if (posthog.__loaded) posthog.opt_out_capturing();
      }
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "all");
    if (typeof window !== "undefined") {
      if (GA_ID) (window as any)[`ga-disable-${GA_ID}`] = false;
      if (posthog.__loaded) posthog.opt_in_capturing();
    }
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "essential");
    if (typeof window !== "undefined") {
      if (GA_ID) (window as any)[`ga-disable-${GA_ID}`] = true;
      if (posthog.__loaded) posthog.opt_out_capturing();
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Cookie and Privacy Consent"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/30 select-none"
        >
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Decline non-essential & close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="space-y-3 pt-1">
            {/* Header with Icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-xs">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground">
                  Cookie & Privacy Preferences
                </h2>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>GDPR & CCPA Compliant</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use essential cookies and local storage to secure your sessions, remember editor preferences, and collect anonymous telemetry to improve SnapFrame.
            </p>

            {/* Links */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
              <Link
                href="/privacy"
                className="text-primary hover:underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="text-primary hover:underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="h-9 px-3 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-foreground text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-primary/20 active:scale-[0.98]"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
