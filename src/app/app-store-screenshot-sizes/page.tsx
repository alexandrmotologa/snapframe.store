"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  Layers,
  HelpCircle,
  Zap,
  Info,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";
import { motion, AnimatePresence } from "framer-motion";

const IOS_SIZES = [
  {
    category: "6.9\" Display (iPhone 16 Pro Max)",
    portrait: "1320 × 2868 px",
    landscape: "2868 × 1320 px",
    aspectRatio: "19.5:9 (~9:19.5)",
    devices: "iPhone 16 Pro Max",
    status: "Latest 2025/2026 Spec",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    category: "6.7\" Display (iPhone 15 Pro Max / 16 Plus)",
    portrait: "1290 × 2796 px",
    landscape: "2796 × 1290 px",
    aspectRatio: "19.5:9",
    devices: "iPhone 16 Plus, 15 Pro Max, 15 Plus, 14 Pro Max",
    status: "Primary Required",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    category: "6.5\" Display (iPhone 11 Pro Max / XS Max)",
    portrait: "1242 × 2688 px",
    landscape: "2688 × 1242 px",
    aspectRatio: "19.5:9",
    devices: "iPhone 11 Pro Max, iPhone XS Max, iPhone XR (828 × 1792)",
    status: "Standard Spec",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    category: "5.5\" Display (iPhone 8 Plus / SE legacy)",
    portrait: "1242 × 2208 px",
    landscape: "2208 × 1242 px",
    aspectRatio: "16:9",
    devices: "iPhone 8 Plus, 7 Plus, 6s Plus",
    status: "Legacy Option",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    category: "13\" Display (iPad Pro M4 / iPad Pro 12.9\")",
    portrait: "2064 × 2752 px",
    landscape: "2752 × 2064 px",
    aspectRatio: "4:3 (3:4)",
    devices: "iPad Pro 13\" (M4), iPad Pro 12.9\" (1st–6th gen: 2048 × 2732)",
    status: "iPad Primary Required",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    category: "11\" Display (iPad Pro 11\" / iPad Air)",
    portrait: "1668 × 2388 px",
    landscape: "2388 × 1668 px",
    aspectRatio: "1.43:1",
    devices: "iPad Pro 11\" (1st–4th gen, M4), iPad Air 11\" (M2)",
    status: "iPad Standard",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
];

const ANDROID_SIZES = [
  {
    type: "Phone (Default / Standard 2026)",
    resolution: "1080 × 2400 px or 1080 × 1920 px",
    aspectRatio: "20:9 or 16:9",
    specs: "Min: 320px, Max: 3840px. 2:1 max aspect ratio. Min 2, max 8 screenshots per set.",
    recommendation: "1080 × 2400 px (FHD+) or 1344 × 2992 px (Google Pixel 10 Pro / Pixel 9)",
  },
  {
    type: "7-Inch Tablet",
    resolution: "1200 × 1920 px or 1080 × 1920 px",
    aspectRatio: "16:10 or 16:9",
    specs: "Min: 320px, Max: 3840px. Required to qualify for tablet featuring on Google Play.",
    recommendation: "1200 × 1920 px (WUXGA)",
  },
  {
    type: "10-Inch & 14-Inch Tablet",
    resolution: "1600 × 2560 px or 1848 × 2960 px",
    aspectRatio: "16:10",
    specs: "High-density tablet layouts. Essential for Google Play Tablet Tier badge.",
    recommendation: "1848 × 2960 px (Samsung Galaxy Tab S10 Ultra)",
  },
];

export default function AppStoreScreenshotSizesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* ── Top Header ── */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SnapFrameLogo size={28} />
            </Link>
            <span className="text-muted-foreground/40 text-sm hidden sm:inline">/</span>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground hidden sm:inline">
              App Store Screenshot Sizes 2026 Guide
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserMenu />
            <Link
              href="/projects"
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-primary/30 active:scale-95"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official 2026 Developer Reference</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] max-w-4xl mx-auto">
          App Store & Google Play <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-purple-500">
            Screenshot Sizes & Dimensions (2026)
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mt-5 max-w-2xl mx-auto leading-relaxed">
          The complete, up-to-date guide to exact pixel resolutions, aspect ratios, file formats, and upload requirements for App Store Connect and Google Play Console.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/projects"
            className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/25 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Exact Dimensions in SnapFrame</span>
          </Link>
          <Link
            href="/pricing"
            className="h-11 px-6 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/60 text-foreground transition-all font-semibold text-sm flex items-center gap-2"
          >
            <span>View Pro Plans ($9/mo)</span>
          </Link>
        </div>
      </section>

      {/* ── Section 1: Apple iOS App Store Requirements ── */}
      <section className="py-10 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Apple iOS App Store Dimensions (iPhone & iPad)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Required and optional pixel resolutions for App Store Connect submission.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40 text-muted-foreground">
                <th className="p-4 font-semibold">Display Size & Target</th>
                <th className="p-4 font-semibold">Portrait Resolution</th>
                <th className="p-4 font-semibold">Landscape Resolution</th>
                <th className="p-4 font-semibold">Aspect Ratio</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {IOS_SIZES.map((item, idx) => (
                <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{item.category}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.devices}</div>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${item.badgeColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium text-foreground">{item.portrait}</td>
                  <td className="p-4 font-mono text-muted-foreground">{item.landscape}</td>
                  <td className="p-4 font-medium text-muted-foreground">{item.aspectRatio}</td>
                  <td className="p-4 text-right">
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all border border-border/60"
                    >
                      <span>Create</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Apple Key Rules Callout ── */}
        <div className="mt-6 p-5 rounded-3xl bg-secondary/40 border border-border/60 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Info className="w-4 h-4 text-primary" />
            <span>Apple App Store Connect Screenshot Guidelines:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>File format:</strong> 72 dpi, RGB color profile, flattened PNG (no alpha/transparency) or high-quality JPEG.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>File limit:</strong> Maximum 10 screenshots per localization. Max file size: 8 MB per image.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Corner Radius:</strong> Upload rectangular screenshots. Apple automatically crops device corners in the store.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Fastlane Support:</strong> SnapFrame Pro exports 1-click organized Fastlane folders ready for `fastlane deliver`.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 2: Google Play Store Requirements ── */}
      <section className="py-10 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
            <Tablet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Google Play Store Dimensions (Phone & Tablet)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Official specifications for Google Play Console submissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANDROID_SIZES.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-foreground">{item.type}</h3>
                <div className="mt-3 font-mono text-sm font-semibold text-primary">{item.resolution}</div>
                <div className="text-xs text-muted-foreground mt-1">Aspect Ratio: {item.aspectRatio}</div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t border-border/40 pt-3">
                  {item.specs}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Recommended 2026</span>
                <Link
                  href="/projects"
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>Build Set</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: FAQ ── */}
      <section className="py-14 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Common questions regarding App Store and Google Play screenshot compliance.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Can I upload 6.7\" screenshots for 6.9\" iPhone 16 Pro Max displays?",
              a: "Yes! App Store Connect allows you to provide 6.7\" screenshots (1290 × 2796) and Apple will automatically scale them for 6.9\" displays. However, to achieve maximum visual clarity and pixel sharpness, SnapFrame allows you to export true 1320 × 2868 lossless 6.9\" assets.",
            },
            {
              q: "Why does App Store Connect reject PNG screenshots with transparency?",
              a: "Apple requires all screenshot submissions to have a solid background without alpha channels (transparency). SnapFrame guarantees that all exported PNG, WebP, and JPEG files are flattened with 0% alpha channel to eliminate App Store upload rejection errors.",
            },
            {
              q: "How many screenshots should I include for optimal conversion rates?",
              a: "Top grossing apps upload between 5 to 7 screenshots per localization. The first 3 screenshots represent over 80% of all user impressions in App Store search results, so make sure your first 3 screens convey your primary value proposition with bold, legible headlines.",
            },
            {
              q: "Does SnapFrame generate localized screenshots for international App Stores?",
              a: "Yes! With SnapFrame Pro, you can design your master set once and automatically duplicate and translate headlines across 40+ languages (German, French, Japanese, Spanish, Romanian, Chinese, and more) with 1-click Fastlane ZIP exports.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/70 bg-card/60 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-muted-foreground border-t border-border/40 pt-3 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-14 px-4 sm:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/15 via-indigo-500/10 to-purple-500/15 border border-primary/25 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Ready to design your store screenshots?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed">
            Create high-converting App Store & Google Play presentations with official 2026 device mockups in under 5 minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/projects"
              className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Free Studio</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <AuthModal />
    </div>
  );
}
