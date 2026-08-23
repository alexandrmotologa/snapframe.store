"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowRight,
  Zap,
  Globe,
  LayoutGrid,
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
          className="relative flex flex-col items-center justify-center py-20 text-center overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm px-6"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 opacity-50 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <div className="mb-8">
              <BrandHeroIcon size="xl" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-5 bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.15]">
              Create stunning app screenshots in minutes
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mb-8 leading-relaxed">
              Design high-converting App Store & Google Play screenshots with 3D device mockups, panoramic continuous flows, multilingual translation, and 4K exports.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-10 max-w-2xl">
              {[
                "📱 3D & 2D Device Mockups", "🎨 Continuous Panorama Flows", "📐 App Store & Google Play Ready",
                "📐 Custom Canvas & Social Presets", "💾 Ultra HD PNG & ZIP Export", "🌐 40+ Languages i18n", "✨ AI Captions & Superpowers",
              ].map((f) => (
                <span key={f} className="px-3.5 py-1.5 rounded-full bg-secondary/60 border border-border/50 text-secondary-foreground text-xs font-medium backdrop-blur-md">
                  {f}
                </span>
              ))}
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
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
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-pink-500 opacity-40 blur-lg group-hover:opacity-70 transition duration-500" />
                  <Button
                    size="lg"
                    onClick={() => setAuthModalOpen(true)}
                    className="relative gap-2 px-8 py-6 rounded-2xl text-base font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Screenshot Set
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── Feature Highlights Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-card/60 border border-border/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Panoramic Continuous Flows</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Create seamless multi-screen narratives where background gradients, device mockups, and visual accents span across adjacent screenshot frames.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card/60 border border-border/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Instant Multi-Language i18n</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Localize entire screenshot sets across 40+ App Store and Google Play languages with 1-click batch translation and custom typography.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card/60 border border-border/60 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">4K Multi-Format Export</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Export pixel-perfect, store-compliant PNGs, ZIP packages, and animated preview GIFs ready for direct upload to App Store Connect & Google Play Console.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
