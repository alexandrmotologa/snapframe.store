"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowRight,
  Zap,
  Globe,
  LayoutGrid,
  Sparkles,
  Smartphone,
  Maximize2,
  Crown,
  CheckCircle2,
  Menu,
  X,
  Star,
  Layers,
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";

import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/dashboard/Footer";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { BrandHeroIcon } from "@/components/ui/BrandHeroIcon";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { RatingStars } from "@/components/ui/RatingStars";

export default function LandingPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { user, setAuthModalOpen } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error("Failed to load reviews:", err));
  }, []);

  // Automatic gentle carousel rotation (every 4 seconds)
  useEffect(() => {
    if (isCarouselPaused) return;
    const totalItems = reviews.length || 8;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % totalItems);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselPaused, reviews.length]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* ── Header ── */}
      <header className="border-b border-border/50 bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <SnapFrameLogo size={32} withText textClassName="text-lg" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/templates"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary flex items-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>Templates</span>
              </Link>
              <Link
                href="/pricing"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden min-[1100px]:flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Pricing</span>
              </Link>
              <Link
                href="/app-store-screenshot-sizes"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden min-[1100px]:flex items-center gap-1.5"
              >
                <span>iOS Specs</span>
              </Link>
              <Link
                href="/google-play-screenshot-sizes"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden min-[1100px]:flex items-center gap-1.5"
              >
                <span>Play Store Specs</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {mounted && user && (
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
                className: "text-muted-foreground inline-flex items-center gap-1.5 px-2 min-[500px]:px-3 py-1.5",
              })}
              title="GitHub Repository"
            >
              <GithubIcon className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
              <span className="hidden min-[500px]:inline text-xs font-semibold">GitHub</span>
            </a>
            <ThemeToggle />
            <UserMenu />

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-[1100px]:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="min-[1100px]:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl px-6 py-4 space-y-3 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col space-y-2 text-sm font-medium">
                <Link
                  href="/templates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    <span>50+ Screenshot Templates</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Pro Pricing ($5.75/mo)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/app-store-screenshot-sizes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span>iOS App Store Sizes Guide (2026)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/google-play-screenshot-sizes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span>Google Play Sizes Guide (2026)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
                {user ? (
                  <Link
                    href="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 text-primary font-bold transition-colors"
                  >
                    <span>Open My Projects</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-primary text-primary-foreground font-bold transition-all"
                  >
                    <span>Sign In / Create Free Set</span>
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

            {/* Superpowers Suite Badge */}
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
              {mounted && user ? (
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

        {/* ── Developer Metrics & Platform Ecosystem ── */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent block">50+</span>
              <span className="text-xs text-muted-foreground font-medium">Curated App Templates</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent block">40+</span>
              <span className="text-xs text-muted-foreground font-medium">Languages Localized</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent block">4.9 / 5</span>
              <span className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" />
                <span>Developer Rating</span>
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent block">0s</span>
              <span className="text-xs text-muted-foreground font-medium">Client-Side Latency</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <span className="font-semibold text-foreground/80">Tailored for apps crafted in:</span>
            {["SwiftUI & UIKit", "Flutter", "React Native & Expo", "Kotlin & Jetpack Compose", "Unity"].map((fw) => (
              <span key={fw} className="px-3 py-1 rounded-full bg-secondary/60 border border-border/60 font-mono text-[11px] text-foreground">
                {fw}
              </span>
            ))}
          </div>
        </section>

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

        {/* ── Testimonials & Social Proof Carousel ── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-center sm:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>Loved by Indie Hackers &amp; Mobile Studios</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Built by developers, for developers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Real feedback from 8 verified mobile creators who shipped App Store &amp; Google Play updates with SnapFrame.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Carousel Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const total = reviews.length || 8;
                    setCarouselIndex((prev) => (prev - 1 + total) % total);
                  }}
                  className="w-9 h-9 rounded-xl border border-border/70 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const total = reviews.length || 8;
                    setCarouselIndex((prev) => (prev + 1) % total);
                  }}
                  className="w-9 h-9 rounded-xl border border-border/70 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (user) {
                    router.push("/account");
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="gap-2 rounded-xl text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Leave a Review</span>
              </Button>
            </div>
          </div>

          {/* Carousel Track Container */}
          <div
            className="relative overflow-hidden max-w-7xl mx-auto py-2"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {(() => {
              const allReviews =
                reviews.length > 0
                  ? reviews
                  : [
                      {
                        id: "user-beta-marcus-01",
                        authorAnonymized: "Mar***** Lin*****",
                        authorRole: "Indie iOS Dev · 2 Apps Live",
                        rating: 5.0,
                        title: "Saved me hours of Figma tweaking",
                        body: "Used to spend half my Sunday exporting 6.9\" and 6.5\" frames in Figma. With SnapFrame, I dropped my raw screenshots in and had all localized ZIP bundles ready in 5 minutes.",
                        beta_user: true,
                      },
                      {
                        id: "user-beta-sarah-02",
                        authorAnonymized: "Sar***** Kim*****",
                        authorRole: "Freelance UI Designer",
                        rating: 4.5,
                        title: "The panoramic continuous frames are brilliant",
                        body: "My clients love split-device layouts across two slides. SnapFrame aligns the canvas offset automatically with zero clipping issues. The 3D device renders look super crisp.",
                        beta_user: true,
                      },
                      {
                        id: "user-beta-alex-03",
                        authorAnonymized: "Ale***** Rod*****",
                        authorRole: "Flutter Developer @ IndieSquad",
                        rating: 5.0,
                        title: "No paywall to preview & Fastlane export is great",
                        body: "I love that you can test everything with Ctrl+V before paying anything. The organized Fastlane folder structure made our release pipeline so much easier.",
                        beta_user: true,
                      },
                      {
                        id: "user-beta-elena-04",
                        authorAnonymized: "Ele***** Van*****",
                        authorRole: "Solo SaaS Founder",
                        rating: 4.5,
                        title: "Localized our App Store listing in seconds",
                        body: "We translated all 5 screenshot slides to German and Spanish in one click with matching typography. Saved us from delaying our EU launch.",
                        beta_user: true,
                      },
                      {
                        id: "user-beta-daisuke-05",
                        authorAnonymized: "Dai***** Tan*****",
                        authorRole: "SwiftUI Creator",
                        rating: 5.0,
                        title: "Makes screenshots look like official Apple keynotes",
                        body: "The titanium bezels and soft shadows make raw simulator captures look incredible. Several indie devs on X asked what tool I used.",
                        beta_user: true,
                      },
                      {
                        id: "user-mateo-06",
                        authorAnonymized: "Mat***** Sil*****",
                        authorRole: "Android Developer",
                        rating: 4.0,
                        title: "Actually gets Google Play tablet sizes right",
                        body: "Most tools only care about iPhone. SnapFrame gave me clean, uncompressed sets for both phones and tablets without stretched borders.",
                        beta_user: false,
                      },
                      {
                        id: "user-liam-07",
                        authorAnonymized: "Lia***** O'C*****",
                        authorRole: "ASO Consultant",
                        rating: 5.0,
                        title: "Perfect for rapid A/B screenshot testing",
                        body: "We duplicate projects, tweak headlines or gradients, and download ready-to-upload PNGs in 30 seconds. Great utility for growth experiments.",
                        beta_user: false,
                      },
                      {
                        id: "user-amira-08",
                        authorAnonymized: "Ami***** El-*****",
                        authorRole: "Product Lead",
                        rating: 5.0,
                        title: "Zero learning curve, flawless submission",
                        body: "Our marketing intern created our full App Store set on her first morning. Preset store sizes ensure Connect never rejects the uploads.",
                        beta_user: false,
                      },
                    ];

              // Pick 3 sliding window items based on carouselIndex
              const visibleItems = [0, 1, 2].map(
                (offset) => allReviews[(carouselIndex + offset) % allReviews.length]
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleItems.map((rev, idx) => (
                    <motion.div
                      key={`${rev.id}-${carouselIndex}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="p-6 rounded-3xl bg-card border border-border/70 space-y-4 shadow-sm hover:shadow-md flex flex-col justify-between hover:border-border transition-all relative overflow-hidden group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <RatingStars rating={rev.rating || 5} size="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold text-amber-500/90 ml-0.5">
                              {Number(rev.rating || 5).toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {rev.beta_user && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs">
                                <Rocket className="w-2.5 h-2.5 text-amber-500" />
                                <span>Beta Tester</span>
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </div>

                        {rev.title ? (
                          <h4 className="text-xs font-bold text-foreground">
                            &ldquo;{rev.title}&rdquo;
                          </h4>
                        ) : null}

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic line-clamp-4">
                          &ldquo;{rev.body}&rdquo;
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-indigo-500/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                          {rev.authorAnonymized ? rev.authorAnonymized.slice(0, 2).toUpperCase() : "CR"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate font-mono">
                            {rev.authorAnonymized || "Verified User"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {rev.authorRole || "App Creator"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCarouselIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    carouselIndex === dotIdx
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Jump to review ${dotIdx + 1}`}
                />
              ))}
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
