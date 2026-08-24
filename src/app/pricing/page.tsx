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
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { Footer } from "@/components/dashboard/Footer";
import { useAuthStore } from "@/lib/store/authStore";
import { openPaddleCheckout } from "@/lib/paddle";
import { toast } from "@/lib/store/toastStore";
import { getIdTokenSafe } from "@/lib/firebase";

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
  const { user, isPro, setAuthModalOpen, setProStatus, setUpgradeModalOpen } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  const isGuest = Boolean(!user || user.isAnonymous);

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
            Start for free with 3 AI credits or upgrade to SnapFrame Pro for unlimited AI Auto-Pilot, 4K lossless exports, and video preview creation.
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
                  <span>Phone Live Store Simulator &amp; App Icon Studio</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                  <span>Standard 1x &amp; 2x PNG / JPEG Exports</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground/70 dark:text-muted-foreground/40">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Multi-Device Real-Time Cloud Sync</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground/70 dark:text-muted-foreground/40">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Full 10-Screen Multi-Platform ZIP (iOS + iPad + Android)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground/70 dark:text-muted-foreground/40">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Dual Theme Generator (Light &amp; Dark matching sets)</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground/70 dark:text-muted-foreground/40">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Batch 40+ Language Export &amp; Fastlane Suite</span>
                </div>
              </div>
            </div>

            <Link
              href="/projects"
              className="w-full py-3 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold flex items-center justify-center gap-2 border border-border/60 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* PRO TIER CARD */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-card dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-card border-2 border-indigo-500/30 dark:border-indigo-500/50 shadow-xl shadow-indigo-500/10 dark:shadow-2xl flex flex-col justify-between space-y-6">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-[11px] font-bold shadow-md uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-xl font-bold text-foreground">SnapFrame Pro</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  Full Access
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
                  <span><strong>Custom Canvas Dimensions &amp; Freeform W × H</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Social Media Presets</strong> (Product Hunt, Twitter, Instagram 1:1, Web Hero)</span>
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
                  <span><strong>iPad Pro &amp; Tablet Store Simulator</strong></span>
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

        {/* Merchant of Record & Guarantee Banner */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">14-Day Money-Back Guarantee (Fair Policy)</h4>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Try SnapFrame Pro with confidence. 100% full refund within 14 days for unutilized accounts. Once AI generations or Pro exports are consumed, cancel anytime in 1-click with zero lock-in.
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
