"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  Crown,
  LayoutGrid,
  Layers,
  ChevronRight,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { Footer } from "@/components/dashboard/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_TEMPLATES, getAllTemplates, isProTemplate } from "@/lib/templates";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { toast } from "@/lib/store/toastStore";
import { Template } from "@/lib/types";

const CATEGORIES = [
  "All",
  "Finance",
  "Health & Fitness",
  "Productivity",
  "Games",
  "Food & Drink",
  "Education",
  "Entertainment",
  "Travel",
  "Modern",
];

// ── SVG Preview Component ──
function TemplateCardPreview({ template }: { template: Template }) {
  const gradColors = template.previewGradient ?? [template.previewColor];
  const id = `preview-${template.id}`;

  return (
    <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-3.5 border border-white/10 group-hover:scale-[1.02] transition-transform duration-300">
      <svg
        viewBox="0 0 120 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="120" y2="180" gradientUnits="userSpaceOnUse">
            {gradColors.length === 1 ? (
              <stop offset="0%" stopColor={gradColors[0]} />
            ) : gradColors.length === 2 ? (
              <>
                <stop offset="0%" stopColor={gradColors[0]} />
                <stop offset="100%" stopColor={gradColors[1]} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={gradColors[0]} />
                <stop offset="50%" stopColor={gradColors[1]} />
                <stop offset="100%" stopColor={gradColors[2] ?? gradColors[1]} />
              </>
            )}
          </linearGradient>
        </defs>
        <rect width="120" height="180" fill={`url(#${id})`} />
      </svg>

      {/* Mini Mockup Visual Preview */}
      <div className="relative z-10 space-y-1.5 pt-1">
        <div className="h-2 w-16 rounded-full bg-white/40 shadow-xs" />
        <div className="h-3 w-22 rounded-full bg-white/90 shadow-xs" />
        <div className="h-1.5 w-20 rounded-full bg-white/50" />
      </div>

      <div className="relative z-10 mx-auto w-4/5 h-28 rounded-t-lg bg-black/40 border-t-2 border-x-2 border-white/20 shadow-2xl flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white/30 mb-auto mt-1" />
      </div>
    </div>
  );
}

export function TemplatesClient() {
  const router = useRouter();
  const { user, isPro, setUpgradeModalOpen, setAuthModalOpen } = useAuthStore();
  const { createProject } = useProjectStore();

  const [templates, setTemplates] = useState<Template[]>(BASE_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getAllTemplates().then((all) => {
      setTemplates(all);
    });
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (t.id === "blank") return false;
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" ||
        t.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        t.tags?.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [templates, searchQuery, selectedCategory]);

  const handleUseTemplate = (template: Template) => {
    const isProTpl = isProTemplate(template);
    if (isProTpl && !isPro) {
      if (!user || user.isAnonymous) {
        toast.info("Pro Suite Templates require SnapFrame Pro. Sign in with Google or GitHub to upgrade.");
        setAuthModalOpen(true);
      } else {
        toast.info("Pro Suite Templates require SnapFrame Pro. Upgrade to unlock luxury industry presets.");
        setUpgradeModalOpen(true);
      }
      return;
    }

    const project = createProject(template.id, template.name, { ios: true, android: true }, template);
    router.push(`/editor/${project.id}`);
  };

  // Structured Data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "55+ App Store & Google Play Screenshot Templates | SnapFrame",
    description:
      "Curated library of 55+ screenshot design templates for iOS App Store and Google Play listing optimization.",
    url: "https://snapframe.store/templates",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filteredTemplates.slice(0, 15).map((t, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: t.name,
        description: t.description,
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/templates"
              className="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Templates</span>
            </Link>
            <Link
              href="/pricing"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing</span>
            </Link>
            <Link
              href="/app-store-screenshot-sizes"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary flex items-center gap-1.5"
            >
              <span>iOS Specs</span>
            </Link>
            <Link
              href="/google-play-screenshot-sizes"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary flex items-center gap-1.5"
            >
              <span>Play Store Specs</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Button
              size="sm"
              className="hidden sm:inline-flex rounded-xl text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const project = createProject(null, "New App Presentation");
                router.push(`/editor/${project.id}`);
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </Button>
            <ThemeToggle />
            <UserMenu />

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl px-6 py-4 space-y-3 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col space-y-2 text-sm font-medium">
                <Link
                  href="/templates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 text-primary font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <span>55+ Screenshot Templates</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const project = createProject(null, "New App Presentation");
                    router.push(`/editor/${project.id}`);
                  }}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-primary text-primary-foreground font-bold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Studio Editor</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8 sm:space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>50+ Production-Ready App Store Templates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
            Curated Screenshot Templates for iOS &amp; Android
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Choose a pixel-perfect design layout tailored to your app category. Drop your screenshots, adjust headlines, and export compliant 4K sets in seconds.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search templates by niche (e.g. Fintech, Meditation, OLED, Gaming, Food)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-card border-border/80 text-sm shadow-xs"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const isProTpl = isProTemplate(template);
            const screenCount = template.screens?.length ?? 5;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 p-4 shadow-xs hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Visual Preview */}
                  <TemplateCardPreview template={template} />

                  {/* Header info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </h2>
                      {isProTpl && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold shrink-0 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          <span>PRO</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-primary" />
                      <span>{screenCount} Ready Screens</span>
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded-full bg-secondary/80 text-[10px] font-medium">
                      {template.category ?? "General"}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className={`w-full h-9 rounded-xl text-xs font-semibold gap-1.5 shadow-xs cursor-pointer transition-all ${
                      isProTpl && !isPro
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20 hover:shadow-md"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 group-hover:shadow-md group-hover:shadow-primary/20"
                    }`}
                  >
                    {isProTpl && !isPro ? (
                      <>
                        <Crown className="w-3.5 h-3.5 text-amber-200" />
                        <span>Unlock with Pro</span>
                      </>
                    ) : (
                      <>
                        <span>Customize in Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-base font-semibold text-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search terms or select another category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="rounded-xl text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <AuthModal />
      <UpgradeModal />
    </div>
  );
}
