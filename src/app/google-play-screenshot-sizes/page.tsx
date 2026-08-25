"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  Image as ImageIcon,
  Laptop,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";
import { GooglePlayIcon } from "@/components/icons/StoreIcons";

const PLAY_PHONE_SIZES = [
  {
    category: 'Standard FHD+ Phone (20:9 Aspect Ratio)',
    portrait: "1080 × 2400 px",
    landscape: "2400 × 1080 px",
    aspectRatio: "20:9",
    devices: "Google Pixel 8/9/10, Samsung Galaxy S24/S25, Xiaomi 14/15",
    status: "Most Recommended (Universal)",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    category: 'High-Density Flagship (Quad HD+)',
    portrait: "1344 × 2992 px",
    landscape: "2992 × 1344 px",
    aspectRatio: "20:9",
    devices: "Google Pixel 10 Pro XL, Pixel 9 Pro XL",
    status: "Ultra-HD Master",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    category: 'Classic 16:9 Phone',
    portrait: "1080 × 1920 px",
    landscape: "1920 × 1080 px",
    aspectRatio: "16:9",
    devices: "Legacy Android devices & landscape games",
    status: "Legacy / Gaming Standard",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    category: 'Foldable Inner Display (Fold Series)',
    portrait: "2156 × 2160 px",
    landscape: "2160 × 2156 px",
    aspectRatio: "~1:1 (Square/Foldable)",
    devices: "Galaxy Z Fold6, Google Pixel 9 Pro Fold",
    status: "Foldable Category Tier",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

const PLAY_TABLET_SIZES = [
  {
    category: '7-Inch Tablet (WUXGA)',
    portrait: "1200 × 1920 px",
    landscape: "1920 × 1200 px",
    aspectRatio: "16:10",
    devices: "Nexus 7, Lenovo Tab M7/M8, Fire HD 8",
    status: "Google Play Tablet Required",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    category: '10-Inch Tablet (WQXGA)',
    portrait: "1600 × 2560 px",
    landscape: "2560 × 1600 px",
    aspectRatio: "16:10",
    devices: "Samsung Galaxy Tab S9/S10, Pixel Tablet",
    status: "Featured Tab Eligibility",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    category: '14.6-Inch Ultra Tablet',
    portrait: "1848 × 2960 px",
    landscape: "2960 × 1848 px",
    aspectRatio: "16:10",
    devices: "Samsung Galaxy Tab S10 Ultra",
    status: "Top Tier Android Tablet",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
];

const PLAY_GRAPHIC_ASSETS = [
  {
    name: "Feature Graphic (Mandatory for Promo & Store Listing)",
    dimensions: "1024 × 500 px",
    format: "JPEG or 24-bit PNG (no alpha / transparency)",
    maxSize: "Up to 15 MB",
    description: "Shown prominently at the top of your Google Play Store listing and required for promotional featuring.",
  },
  {
    name: "App Icon (Hi-Res Icon)",
    dimensions: "512 × 512 px (or 1024 × 1024 px master)",
    format: "32-bit PNG (with alpha / transparency permitted)",
    maxSize: "Up to 1 MB",
    description: "Your primary store brand mark. Google Play automatically applies standard squircle dynamic mask.",
  },
  {
    name: "Chromebook & Desktop Listing",
    dimensions: "1920 × 1080 px or 2560 × 1440 px",
    format: "16:9 Landscape PNG / JPEG",
    maxSize: "Min 1080px width",
    description: "Recommended if your Android app supports large screens, keyboard input, and ChromeOS.",
  },
];

const GOOGLE_PLAY_FAQS = [
  {
    q: "How many screenshots can I upload to Google Play Console?",
    a: "Google Play Console allows between 2 and 8 screenshots per device type (Phone, 7-inch tablet, 10-inch tablet, Chromebook, Android TV, and Wear OS). We recommend uploading between 5 and 7 screenshots for optimal conversion.",
  },
  {
    q: "What is the minimum and maximum resolution for Google Play screenshots?",
    a: "Google Play requires screenshots with a minimum dimension of 320 px and a maximum dimension of 3,840 px. The aspect ratio must not exceed 2:1 (or 1:2). Our recommended standard is 1080 × 2400 px or 1344 × 2992 px in lossless PNG format.",
  },
  {
    q: "Is the 1024 × 500 Feature Graphic required on Google Play?",
    a: "Yes! The Feature Graphic (1024 × 500 px) is mandatory for your app to be published and featured across the Google Play Store, search recommendations, and category showcases. You can generate it directly in SnapFrame's Store Assets Studio.",
  },
  {
    q: "Do I need separate screenshots for Android Tablets?",
    a: "To qualify for the 'Designed for Tablets' badge and to be eligible for Google Play's featured tablet carousels, you must upload at least one 7-inch tablet and one 10-inch tablet screenshot set.",
  },
  {
    q: "Can I automate Google Play screenshot uploads with Fastlane?",
    a: "Yes! SnapFrame Pro exports complete Fastlane `supply` directory structures (`fastlane/metadata/android/`), including localized metadata and organized screenshot folders ready for automated deployment via `fastlane supply`.",
  },
];

export default function GooglePlayScreenshotSizesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Schema.org FAQPage structured data for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GOOGLE_PLAY_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://snapframe.store",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Google Play Screenshot Sizes Guide",
        item: "https://snapframe.store/google-play-screenshot-sizes",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app-store-screenshot-sizes"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary hidden md:inline-flex items-center gap-1.5"
            >
              <span>App Store iOS Specs</span>
            </Link>
            <Link
              href="/templates"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              Pricing
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 sm:py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-xs">
            <GooglePlayIcon className="w-3.5 h-3.5" />
            <span>2025 / 2026 Google Play Console Specs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
            Google Play Screenshot Sizes &amp;{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Feature Graphic Guide
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The complete, up-to-date reference for Google Play Store screenshot dimensions, aspect ratios, tablet guidelines, and 1024×500 feature graphics.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/projects"
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Design Google Play Screenshots Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app-store-screenshot-sizes"
              className="px-5 py-3 rounded-2xl border border-border/80 bg-card hover:bg-secondary text-foreground text-sm font-semibold transition-colors"
            >
              View Apple iOS Specs
            </Link>
          </div>
        </div>

        {/* ── Section 1: Phone Screenshots ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Android Phone Screenshot Sizes</h2>
                <p className="text-xs text-muted-foreground">Google Pixel, Samsung Galaxy &amp; modern 20:9 Android phones</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-secondary px-3 py-1 rounded-full border border-border/60 text-muted-foreground">
              Min 2 · Max 8 per listing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAY_PHONE_SIZES.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                    {item.category}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/40 border border-border/40 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block font-sans">Portrait</span>
                    <strong className="text-foreground">{item.portrait}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block font-sans">Landscape</span>
                    <strong className="text-foreground">{item.landscape}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground truncate">{item.devices}</span>
                  <Link
                    href="/projects"
                    className="text-primary font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Create</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Tablet Screenshots ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Tablet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Android Tablet Sizes (7&quot; &amp; 10&quot; Required)</h2>
                <p className="text-xs text-muted-foreground">Essential for Google Play &quot;Designed for Tablets&quot; badge and featuring</p>
              </div>
            </div>
            <span className="text-xs font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">
              16:10 Aspect Ratio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAY_TABLET_SIZES.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-purple-500 transition-colors">
                      {item.category}
                    </h3>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor} shrink-0`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 font-mono text-xs space-y-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block font-sans">Resolution</span>
                      <strong className="text-foreground">{item.portrait}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{item.devices}</p>
                </div>

                <Link
                  href="/projects"
                  className="w-full mt-3 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Launch Tablet Canvas</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Feature Graphic & Store Assets ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Google Play Feature Graphic &amp; Store Assets</h2>
              <p className="text-xs text-muted-foreground">Mandatory marketing promotional banner and high-resolution icons</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLAY_GRAPHIC_ASSETS.map((asset, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                      {asset.dimensions}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{asset.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{asset.description}</p>

                  <div className="pt-3 border-t border-border/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Format:</span>
                      <span className="font-semibold text-foreground">{asset.format}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>File Size:</span>
                      <span className="font-semibold text-foreground">{asset.maxSize}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/projects"
                  className="w-full mt-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-white text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Generate Asset in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Google Play Requirements Checklist ── */}
        <section className="p-8 rounded-3xl bg-secondary/30 border border-border/60 space-y-6">
          <div className="flex items-center gap-2.5 text-foreground">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <h2 className="text-xl font-bold">Google Play Store Screenshot Rules &amp; Policies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/80 border border-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-semibold mb-0.5">2:1 Max Aspect Ratio</strong>
                <p className="text-muted-foreground leading-relaxed">
                  The length of any side cannot be more than double the length of the shorter side (max aspect ratio 2:1).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/80 border border-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-semibold mb-0.5">No Alpha Channel on Feature Graphic</strong>
                <p className="text-muted-foreground leading-relaxed">
                  The 1024×500 Feature Graphic must be completely solid (24-bit PNG or JPEG) with zero transparent pixels.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/80 border border-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-semibold mb-0.5">Minimum 2 Screenshots Required</strong>
                <p className="text-muted-foreground leading-relaxed">
                  You must provide at least 2 screenshots (up to a maximum of 8) per supported form factor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/80 border border-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-semibold mb-0.5">Automated Fastlane Supply Support</strong>
                <p className="text-muted-foreground leading-relaxed">
                  SnapFrame Pro generates organized `metadata/android/` folders ready for automated CI/CD deployments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: FAQs with Google SERP Accordions ── */}
        <section className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Everything you need to know about Google Play Store screenshot publishing.</p>
          </div>

          <div className="space-y-3">
            {GOOGLE_PLAY_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs text-foreground cursor-pointer hover:bg-secondary/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/30 bg-secondary/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-background border border-emerald-500/30 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-foreground">
            Create Google Play &amp; App Store Screenshots in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Design for Google Pixel 10 Pro, Samsung Galaxy Tab, and iPhone 17 simultaneously with panoramic continuous backgrounds and 40+ language localizations.
          </p>
          <div className="pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Launch Free Screenshot Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      <AuthModal />
    </div>
  );
}
