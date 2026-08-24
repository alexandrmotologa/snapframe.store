"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Zap, Shield, Crown, Globe, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

import { openPaddleCheckout } from "@/lib/paddle";
import { toast } from "@/lib/store/toastStore";
import { getIdTokenSafe, getFirebaseDb } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";


const PRO_FEATURES = [
  {
    icon: Crown,
    title: "Full 10-Screen Multi-Platform ZIP",
    desc: "Export all 10 screens per set for iPhone, iPad Pro, Android Phone, and Android Tablet in one click.",
  },
  {
    icon: Globe,
    title: "Batch 40+ Language Localizations",
    desc: "Generate and export screenshots across 40+ regional languages organized into separate ZIP subfolders.",
  },
  {
    icon: Shield,
    title: "Fastlane & Store Listing Suite",
    desc: "Export complete title, subtitle, keywords, and description packages in Fastlane & text formats ready for store submission.",
  },
  {
    icon: Zap,
    title: "1,500 AI Generations / Month",
    desc: "Auto-Pilot vision generation, AI copywriting & instant multi-language translation (up to 150/day).",
  },
  {
    icon: Sparkles,
    title: "Custom Canvas, Presets & Mockup Sizing",
    desc: "Freeform Width × Height canvas sizing, Product Hunt / Twitter / Instagram presets, and custom mockup frame scaling (50%–150%).",
  },
  {
    icon: ImageIcon,
    title: "Pro Niches & Cloud Sync",
    desc: "Unlimited cloud projects (Firestore), dual themes, and exclusive templates for Fintech, Crypto, SaaS, Fitness, Dating, and Ecommerce.",
  },
];

export function UpgradeModal() {
  const { isUpgradeModalOpen, setUpgradeModalOpen, user, isPro, setAuthModalOpen, setProStatus, aiCredits } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  const isGuest = Boolean(!user || user.isAnonymous);

  const handleUpgrade = async () => {
    if (isGuest) {
      setUpgradeModalOpen(false);
      setAuthModalOpen(true);
      toast.info("Please create a free account with Google or GitHub first to link your Pro subscription.");
      return;
    }

    setIsProcessing(true);
    await openPaddleCheckout({
      plan: billingCycle,
      userEmail: user?.email,
      userId: user?.uid,
      onSuccess: async () => {
        setProStatus(true, billingCycle);
        setUpgradeModalOpen(false);
        setIsProcessing(false);
        toast.success("🎉 Welcome to SnapFrame Pro! Your subscription is now active.");

        if (user && !user.isAnonymous) {
          const isAnnual = billingCycle === "annual";
          const durationMs = isAnnual ? 365 * 86400000 : 30 * 86400000;
          const now = Date.now();

          // 1. Direct client-side Firestore resilience
          try {
            const db = await getFirebaseDb();
            if (db) {
              await setDoc(
                doc(db, "users", user.uid),
                {
                  isPro: true,
                  plan: isAnnual ? "pro-annual" : "pro-monthly",
                  subscriptionStatus: "active",
                  lastPaymentAt: now,
                  subscriptionExpiresAt: now + durationMs,
                  nextBilledAt: now + durationMs,
                  billingAmount: isAnnual ? 69 : 9,
                  currency: "USD",
                  aiCredits: 9999,
                  updatedAt: now,
                },
                { merge: true }
              );
            }
          } catch (dbErr) {
            console.warn("Client Firestore Pro sync notice:", dbErr);
          }

          // 2. Server API sync
          try {
            const idToken = await getIdTokenSafe(user);
            await fetch("/api/account/billing", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
              },
              body: JSON.stringify({
                action: "activate_pro",
                plan: billingCycle,
              }),
            }).catch(() => {});
          } catch {}
        }
      },
    });

    setIsProcessing(false);
  };

  return (
    <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Upgrade to SnapFrame Pro</DialogTitle>
        <DialogDescription className="sr-only">Choose between monthly and annual plans for unlimited AI, 4K exports, and video studio.</DialogDescription>

        {/* Top Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-background border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Crown className="w-3.5 h-3.5" />
              <span>SnapFrame Pro Studio</span>
            </div>

            {/* AI Credits Badge */}
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-muted-foreground">
              {isPro ? (
                <span className="text-emerald-400 font-bold">👑 Pro Active (Unlimited)</span>
              ) : isGuest ? (
                <span>👤 Guest Mode (0 Credits)</span>
              ) : (
                <span>
                  ⚡ <strong className="text-foreground">{aiCredits}</strong> of 3 Free AI Credits Left
                </span>
              )}
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-3">
            Scale Your App Installs With <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pro Superpowers</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Unlock unlimited AI Vision screen generation, 4K Ultra-HD lossless exports, animated video ads, and batch translation in 40+ languages.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-6">
            <div className="p-1 rounded-xl bg-secondary/80 border border-border/60 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual Billing
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Save 36%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Pricing Highlight Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30">
            <div className="md:col-span-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">
                  {billingCycle === "annual" ? "$5.75" : "$9"}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  / month {billingCycle === "annual" && <span className="text-primary font-bold">(billed annually at $69/year)</span>}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {billingCycle === "annual"
                  ? "🎉 Includes 4+ months free + all future feature updates and pro niches."
                  : "Cancel anytime with 1 click. Instant access to all Pro features."}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGuest ? "Sign In & Upgrade" : "Unlock Pro Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRO_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{feat.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Security / Trust Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/50">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure Checkout powered by <strong>Paddle</strong> (Merchant of Record)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>💳 Apple Pay, Google Pay, Cards &amp; PayPal</span>
              <span>•</span>
              <span>14-Day Fair Refund Guarantee</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
