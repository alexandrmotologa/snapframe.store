"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  FileText,
  Lock,
  Crown,
  CreditCard,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { GithubIcon } from "@/components/ui/GithubIcon";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30 dark:bg-card/15 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        {/* Main Grid: Brand on Left, Navigation Links on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-border/40">
          {/* Brand Info (Spans 6 cols on md/lg) */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 group w-fit transition-transform hover:opacity-90"
            >
              <SnapFrameLogo size={30} withText textClassName="text-lg font-bold" />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Studio-grade App Store &amp; Google Play screenshot creator. Powered by AI Auto-Pilot, 3D device mockups, and seamless multi-language translation.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-foreground/90 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-foreground/90 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Instant 4K Export
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-foreground/90 shadow-2xs">
                <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                Paddle.com (Merchant of Record)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Navigation Columns (Spans 6 cols on md, 5 cols on lg) */}
          <div className="md:col-span-6 lg:col-span-5 grid grid-cols-2 gap-8 sm:gap-12">
            {/* Plans & Pricing Col */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Plans &amp; Pricing
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors font-medium text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Pricing Plans</span>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Pro Annual</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                      Save 36%
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>14-Day Money-Back</span>
                  </Link>
                </li>
                <li>
                  <Link href="/app-store-screenshot-sizes" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>2026 Screenshot Sizes</span>
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Free Starter (3 AI Credits)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trust & Legal Col */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Trust &amp; Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground/70" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground/70" />
                    FAQ &amp; Support
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/alexandrmotologa/snapframe.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright on left & Fast Legal Navigation on right */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} SnapFrame by <strong className="text-foreground font-semibold">MTLG Labs</strong>. All rights reserved.</p>

          <div className="flex items-center gap-3.5 text-xs font-medium">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/refunds" className="hover:text-foreground transition-colors">
              Refunds
            </Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
