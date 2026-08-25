"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Crown,
  Shield,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CreditCard,
  Clock,
  Zap,
  Lock,
  Eye,
  Sliders,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { Footer } from "@/components/dashboard/Footer";
import { useAuthStore } from "@/lib/store/authStore";
import { openPaddleCheckout } from "@/lib/paddle";
import { getIdTokenSafe, getFirebaseDb } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/lib/store/toastStore";

const PRICING_FAQS = [
  {
    q: "What are the export differences between Free and Pro?",
    a: "Free accounts can export up to 3 screenshots per set for a single platform (e.g. iPhone) in your primary language, with full commercial rights. SnapFrame Pro unlocks the complete 10-screen multi-platform ZIP package (iPhone, iPad Pro, Android Phone, and Android Tablet), batch 40+ language exports in organized subfolders, and the complete Fastlane & App Store Connect metadata suite.",
  },
  {
    q: "How does project saving and Multi-Device Cloud Sync work?",
    a: "Free accounts can create up to 3 projects, which are saved locally in your current browser (localStorage). When you upgrade to SnapFrame Pro, Multi-Device Cloud Sync via Google Cloud Firestore is automatically activated: all your existing local projects are securely backed up to the cloud and available in real-time across your Mac, PC, and iPad.",
  },
  {
    q: "What is the difference between Free and Pro AI generations?",
    a: "Free accounts receive 3 complimentary AI credits upon registration with Google or GitHub to test our AI Auto-Pilot and copywriter. SnapFrame Pro includes up to 1,500 AI generations per month (up to 150/day) under our Fair Usage Policy, covering Vision Auto-Pilot, 3D Background Cutouts, and multi-language translations in 40+ languages.",
  },
  {
    q: "Are Video / GIF and App Icon Studio exports free?",
    a: "Yes! Creating and exporting 60fps MP4/WebM videos, animated GIFs, official App Store / Google Play 1024x1024 icons, and full Xcode AppIcon.appiconset.zip / Android mipmap.zip packages is 100% free and unlimited for all registered accounts.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 14-day money-back guarantee for unutilized accounts. If you purchase SnapFrame Pro and request a refund within 14 calendar days without having consumed AI generation credits or stored data in multi-device cloud sync, you will receive a 100% full refund through Paddle. Once AI credits or cloud storage are actively utilized, computational costs have been incurred on your behalf and the service is considered fulfilled.",
  },
  {
    q: "Can I use the exported screenshots for commercial apps?",
    a: "Yes! 100% of the artwork, device mockups, and screenshots you export with SnapFrame come with a perpetual commercial license. You own all rights to publish them to the Apple App Store, Google Play, marketing websites, and ad campaigns.",
  },
  {
    q: "What payment methods are accepted and who processes billing?",
    a: "Our order process is conducted by our online reseller and Merchant of Record, Paddle.com. Through Paddle, we accept all major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and PayPal worldwide with automatic VAT/sales tax invoicing.",
  },
];

export default function PricingPage() {
  const { user, isPro, setAuthModalOpen, setProStatus } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  // Interactive ROI Calculator State
  const [calcApps, setCalcApps] = useState<number>(2);
  const [calcLanguages, setCalcLanguages] = useState<number>(5);

  // 1080p vs 4K Quality Preview Tab
  const [previewQuality, setPreviewQuality] = useState<"1080p" | "4k">("4k");

  const isGuest = Boolean(!user || user.isAnonymous);

  // Calculated ROI Metrics
  const totalScreenshots = calcApps * calcLanguages * 10;
  const hoursInFigma = Math.max(1, Math.round((totalScreenshots * 3.5) / 60));
  const estimatedDesignCost = totalScreenshots * 4; // $4 per screen design/localization in market
  const proAnnualCost = 69;
  const netSavings = Math.max(0, estimatedDesignCost - proAnnualCost);

  // Schema.org FAQPage structured data for Google SERP rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const handleCheckout = async (plan: "annual" | "monthly") => {
    if (isGuest) {
      setAuthModalOpen(true);
      toast.info("Please create a free account with Google or GitHub first to link your Pro subscription.");
      return;
    }

    setIsProcessing(true);
    await openPaddleCheckout({
      plan,
      userEmail: user?.email,
      userId: user?.uid,
      onSuccess: async () => {
        setProStatus(true, plan);
        setIsProcessing(false);
        toast.success("🎉 Welcome to SnapFrame Pro! Your subscription is now active.");

        if (user && !user.isAnonymous) {
          const isAnnual = plan === "annual";
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
                plan,
              }),
            }).catch(() => {});
          } catch {}
        }
      },
    });

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 sm:py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <Crown className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            Ship High-Converting Screenshots{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start for free with 3 AI credits or upgrade to SnapFrame Pro for unlimited AI Auto-Pilot, 4K lossless exports, and Fastlane store automation.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-6 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-secondary/80 border border-border/80 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Save 36%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* FREE TIER CARD */}
          <div className="p-8 rounded-3xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-border transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Free Starter</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border/60">
                  Forever Free
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Perfect for indie developers testing their first mobile application screenshots.
              </p>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-black text-foreground">$0</span>
                <span className="text-xs text-muted-foreground font-semibold">/ forever</span>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>3 Free AI Generations (Auto-Pilot &amp; Copywriter)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>Up to 3 Projects (Stored locally in browser)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>Export up to 3 screens per set (1 platform, 1 language)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>1-Click Clipboard PNG copy (Screens 1 to 3)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>Freeform Shapes, Text Styling &amp; Custom Shadows</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>Unlimited 60fps MP4/GIF &amp; 1024px App Icon Exports</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground line-through opacity-60">
                  <X className="w-4 h-4 shrink-0" />
                  <span>10-Screen Multi-Platform ZIP (iOS + Android + Tablet)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground line-through opacity-60">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Batch 40+ Language Localization Export</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground line-through opacity-60">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Fastlane &amp; Store Listing Metadata Automation</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground line-through opacity-60">
                  <X className="w-4 h-4 shrink-0" />
                  <span>4K Lossless Ultra-HD Master Exports</span>
                </div>
              </div>
            </div>

            <Link
              href="/projects"
              className="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold text-center border border-border/80 transition-colors"
            >
              Start Free (No Card Required)
            </Link>
          </div>

          {/* PRO TIER CARD */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-card via-card to-primary/5 border-2 border-primary shadow-xl shadow-primary/10 flex flex-col justify-between space-y-6 relative hover:shadow-2xl hover:shadow-primary/15 transition-all">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-[10.5px] font-black tracking-wide uppercase shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Most Popular</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">SnapFrame Pro</h3>
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Pro Suite
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For ambitious developers, agencies, and studios who want maximum downloads and conversions.
              </p>
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-black text-foreground">
                  {billingCycle === "annual" ? "$5.75" : "$9"}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  / month {billingCycle === "annual" && <span className="text-primary font-bold">(billed annually at $69/year)</span>}
                </span>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Full 10-Screen Multi-Platform ZIP</strong> (iPhone + iPad + Android + Tablet)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Social Media Presets</strong> (Product Hunt, Twitter, Instagram, Web Hero)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>ASO A/B Testing Variant Generator</strong> (4 High-Converting Strategies)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Mockup Frame Scaling (50%–150%)</strong> &amp; Luxury 3D Frames</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>1-Click Clipboard PNG copy on all 10 screens</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Batch 40+ Language Localization Export</strong> in organized folders</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Fastlane &amp; Store Listing Metadata Suite</strong> (.txt, .json)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Dual Theme Generator</strong> (1-Click Light &amp; Dark matching sets)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Projects &amp; Multi-Device Cloud Sync</strong> (Firestore)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>1,500 AI Generations / Month</strong> (Vision Auto-Pilot, Copy &amp; Tone)</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>4K Lossless Ultra-HD Master Exports</strong> (Pixel-perfect 3x/4K)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheckout(billingCycle)}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPro ? "Manage Pro Plan" : isGuest ? "Sign In & Upgrade to Pro" : "Upgrade to Pro ($" + (billingCycle === "annual" ? "69/yr" : "9/mo") + ")"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── INTERACTIVE ROI & TIME SAVINGS CALCULATOR ── */}
        <section className="p-8 sm:p-10 rounded-3xl bg-card border border-border/80 shadow-lg max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">Interactive ROI &amp; Time Savings Calculator</h2>
              <p className="text-xs text-muted-foreground">See how much time and freelance designer costs SnapFrame Pro eliminates for your app.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6 bg-secondary/30 p-6 rounded-2xl border border-border/60">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Active Mobile Apps:</span>
                  <span className="font-mono font-black text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                    {calcApps} {calcApps === 1 ? "App" : "Apps"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcApps}
                  onChange={(e) => setCalcApps(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 app</span>
                  <span>5 apps</span>
                  <span>10 apps</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Target Localization Languages:</span>
                  <span className="font-mono font-black text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                    {calcLanguages} {calcLanguages === 1 ? "Language" : "Languages"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={calcLanguages}
                  onChange={(e) => setCalcLanguages(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 lang (EN)</span>
                  <span>10 langs</span>
                  <span>40+ Global</span>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 text-center">
                  <span className="text-[11px] font-semibold text-muted-foreground block">Total Screenshots</span>
                  <strong className="text-2xl font-black text-foreground font-mono">{totalScreenshots}</strong>
                  <span className="text-[10px] text-muted-foreground block">screens required</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <span className="text-[11px] font-semibold text-rose-500 block">Manual Figma Time</span>
                  <strong className="text-2xl font-black text-rose-500 font-mono">~{hoursInFigma} hrs</strong>
                  <span className="text-[10px] text-muted-foreground block">wasted in design tools</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>With SnapFrame Pro:</span>
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    45 SECONDS
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-emerald-500/20">
                  <span className="text-xs text-muted-foreground">Estimated Freelancer Savings:</span>
                  <strong className="text-xl font-black text-foreground font-mono">
                    Save ${netSavings.toLocaleString()} / yr
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 1080P VS 4K ULTRA-HD QUALITY COMPARISON ── */}
        <section className="p-8 sm:p-10 rounded-3xl bg-secondary/20 border border-border/70 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                  Visual Fidelity
                </span>
                <h3 className="text-xl font-black text-foreground">Standard 1080p vs. 4K Ultra-HD Lossless</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                App Store guidelines penalize blurry, compressed graphics. Compare our zero-compression 4K master output.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border/80 shadow-xs">
              <button
                type="button"
                onClick={() => setPreviewQuality("1080p")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewQuality === "1080p"
                    ? "bg-secondary text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Standard (1080p)
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuality("4k")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewQuality === "4k"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>4K Pro Master</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 relative overflow-hidden shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  {previewQuality === "4k" ? "✨ 4K Pro Vector Rendering (Lossless 3840×2160)" : "⚠️ Standard 1080p Raster Output"}
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  {previewQuality === "4k" ? "Crisp Typographic Precision & Chamfered Hardware" : "Compressed Pixels & Blurry Fine Text"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {previewQuality === "4k"
                    ? "Every font glyph, sub-pixel shadow, and titanium device bezel is rendered natively at up to 4K resolution using SVG bezier curves and 32-bit color depth."
                    : "Standard exports can suffer from downscaled blurriness, blurry captions on retina displays, and compression artifacts in App Store search results."}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {previewQuality === "4k" ? "100% Passed Apple & Google Store Quality Review" : "Standard Resolution"}
                  </span>
                </div>
              </div>

              <div className="relative h-44 rounded-xl overflow-hidden border border-border/70 flex items-center justify-center bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-background">
                <div className={`text-center space-y-2 transition-all duration-300 ${previewQuality === "1080p" ? "blur-[1.2px] opacity-80" : "scale-105"}`}>
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent block">
                    {previewQuality === "4k" ? "ULTRA HD · 4K" : "1080p STANDARD"}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    {previewQuality === "4k" ? "Pixel-Perfect Bezels & Zero Noise" : "Downscaled Compression"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Merchant of Record & Guarantee Banner */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">14-Day Money-Back Guarantee &amp; 1-Click Cancel</h4>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Try SnapFrame Pro with zero risk. 100% full refund within 14 days for unutilized accounts. Cancel anytime in 1-click directly from your account page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Resold by <strong>Paddle.com</strong> (Merchant of Record)</span>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about billing, licensing, and payment processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_FAQS.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card border border-border/70 space-y-2 hover:border-border transition-colors"
              >
                <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Reseller Disclosure */}
        <div className="text-center pt-8 border-t border-border/40 text-[11px] text-muted-foreground max-w-3xl mx-auto space-y-2">
          <p>
            Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
            <Link href="/terms" className="hover:text-foreground transition-colors underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/refunds" className="hover:text-foreground transition-colors underline">
              Refund Policy
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal />
      <UpgradeModal />
    </div>
  );
}
