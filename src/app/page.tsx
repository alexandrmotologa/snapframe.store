"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowRight,
  Zap,
  Globe,
  LayoutGrid,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Crown,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/dashboard/Footer";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { BrandHeroIcon } from "@/components/ui/BrandHeroIcon";
import { GithubIcon } from "@/components/ui/GithubIcon";

export default function LandingPage() {
  const router = useRouter();
  const { user, setAuthModalOpen } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 ml-1">Beta</Badge>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden sm:inline-flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing</span>
            </Link>
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1.5 font-semibold hidden sm:flex border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => router.push("/projects")}
              >
                <span>My Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
            <a
              href="https://github.com/alexandrmotologa/snapframe.store"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-muted-foreground hidden sm:inline-flex items-center gap-1.5",
              })}
            >
              <GithubIcon className="w-3.5 h-3.5 text-muted-foreground/80" />
              <span>GitHub</span>
            </a>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-20">
        {/* ── Hero Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex flex-col items-center justify-center py-20 text-center overflow-hidden rounded-3xl border border-border/60 dark:border-border/50 bg-gradient-to-b from-indigo-500/[0.04] via-card/50 to-card/90 dark:from-indigo-950/20 dark:via-card/30 dark:to-card/20 backdrop-blur-sm px-6 shadow-xl shadow-indigo-500/[0.03] dark:shadow-none"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 dark:bg-primary/20 opacity-60 dark:opacity-50 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <div className="mb-6">
              <BrandHeroIcon size="xl" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI-Powered App Store &amp; Google Play Screenshot Studio</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-5 bg-gradient-to-b from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-[1.15]">
              Create stunning app screenshots in minutes
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mb-8 leading-relaxed">
              Design high-converting App Store &amp; Google Play screenshots with 3D device mockups, panoramic continuous flows, multilingual translation, and 4K exports.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-10 max-w-2xl">
              {[
                "📸 Instant Ctrl+V Paste",
                "📱 3D & 2D Device Mockups",
                "🎨 Continuous Panorama Flows",
                "🤖 Vision AI Auto-Pilot",
                "📐 Custom Canvas & Social Presets",
                "🌙 Dual Theme Matching Sets",
                "⚡ Fastlane Deliverfile ZIP",
                "🌐 40+ Languages i18n",
                "📱 Live Store & Tablet Simulator",
              ].map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-card/90 dark:bg-secondary/60 border border-border/70 dark:border-border/50 text-foreground/90 dark:text-secondary-foreground text-xs font-medium backdrop-blur-md shadow-2xs hover:bg-secondary transition-colors">
                  {f}
                </span>
              ))}
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {user ? (
                <Button
                  size="lg"
                  onClick={() => router.push("/projects")}
                  className="gap-2 px-8 py-6 rounded-2xl text-base font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Go to Your Projects</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <div className="relative inline-block group">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-pink-500 opacity-40 group-hover:opacity-70 blur-lg transition duration-500" />
                  <Button
                    size="lg"
                    onClick={() => setAuthModalOpen(true)}
                    className="relative gap-2 px-8 py-6 rounded-2xl text-base font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Screenshot Set (Free)</span>
                  </Button>
                </div>
              )}

              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "px-6 py-6 rounded-2xl text-sm font-semibold bg-card/80 dark:bg-card/40 border-border/80 dark:border-border/70 hover:bg-secondary/80 text-foreground shadow-2xs gap-2",
                })}
              >
                <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Explore Pro Plans</span>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ── Submission Compliance Trust Banner ── */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/[0.05] via-card/70 to-card/90 dark:from-card/40 dark:via-card/40 dark:to-card/40 border border-border/70 dark:border-border/60 shadow-sm dark:shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-foreground font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% App Store Connect &amp; Google Play Console Compliant</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Outputs 72 DPI sRGB RGB images with zero alpha channel transparency, exact Apple &amp; Google pixel specs, and organized Fastlane packages.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-foreground/85 dark:text-muted-foreground">
            <span className="px-2.5 py-1 rounded-lg bg-card dark:bg-secondary/60 border border-border/70 dark:border-border/50 shadow-2xs">iPhone 16 Pro Max (1320×2868)</span>
            <span className="px-2.5 py-1 rounded-lg bg-card dark:bg-secondary/60 border border-border/70 dark:border-border/50 shadow-2xs">iPad Pro 13&quot; (2048×2732)</span>
            <span className="px-2.5 py-1 rounded-lg bg-card dark:bg-secondary/60 border border-border/70 dark:border-border/50 shadow-2xs">Google Play 9:16 &amp; 16:10</span>
          </div>
        </section>

        {/* ── Feature Highlights Grid (6 Pillars) ── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Everything you need to dominate the App Stores
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From continuous panoramic storytelling to automated vision AI and developer-ready Fastlane packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Panorama Flows */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Panoramic Continuous Flows</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Create seamless multi-screen narratives where background gradients, device mockups, and visual accents span fluidly across adjacent screenshot frames.
              </p>
            </div>

            {/* Card 2: Vision AI Auto-Pilot */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Vision AI Auto-Pilot &amp; Copy</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Automatically analyze UI screenshots with vision intelligence to generate persuasive marketing headlines, matching color palettes, and tone presets.
              </p>
            </div>

            {/* Card 3: Custom Canvas & Presets */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 shadow-xs">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Custom Canvas &amp; Social Presets</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Design for Product Hunt (1270×760), Twitter/X, Instagram, and custom freeform dimensions (W × H) with real-time mockup frame scaling (50%–150%).
              </p>
            </div>

            {/* Card 4: Multi-Language i18n */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Instant 40+ Language i18n</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Localize entire screenshot sets across 40+ App Store and Google Play languages with 1-click batch translation and custom localized typography.
              </p>
            </div>

            {/* Card 5: Store & Tablet Simulator */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Live Store &amp; Tablet Simulator</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Preview your screenshots in a realistic App Store and Google Play listing on iPhone, iPad Pro 13&quot;, Pixel, and Samsung Galaxy Tablets before launch.
              </p>
            </div>

            {/* Card 6: 4K Export & Fastlane */}
            <div className="p-6 rounded-3xl bg-card border border-border/70 dark:border-border/60 space-y-3 shadow-sm hover:shadow-md dark:shadow-xs hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">4K Lossless Export &amp; Fastlane</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Export pixel-perfect PNGs, multi-platform ZIP archives, and automated Fastlane Deliver/Supply metadata ready for immediate deployment.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom High-Converting CTA Banner ── */}
        <section className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-indigo-500/[0.07] via-purple-500/[0.04] to-card dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-card border-2 border-indigo-500/30 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/5 dark:shadow-2xl text-center space-y-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Ready to boost your App Store conversion rate?
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
              Join developers, agencies, and top indie creators who build high-converting screenshots with SnapFrame. Get started free in under 3 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => (user ? router.push("/projects") : setAuthModalOpen(true))}
                className="gap-2 px-8 py-6 rounded-2xl text-base font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>{user ? "Go to Dashboard" : "Start Creating Free"}</span>
              </Button>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "px-6 py-6 rounded-2xl text-sm font-semibold bg-card/80 dark:bg-card/40 border-border/80 dark:border-border/70 hover:bg-secondary text-foreground shadow-2xs gap-2",
                })}
              >
                <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>View Pro Pricing ($5.75/mo)</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
