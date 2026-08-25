"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Search, Check, Sparkles, ArrowRight, Plus, Flame, ArrowUpDown, Lock, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_TEMPLATES, getAllTemplates, isProTemplate } from "@/lib/templates";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import {
  sortAndFilterTemplates,
  recordTemplateSelection,
  TemplateSortOption,
  getTemplateScore,
} from "@/lib/templatePopularity";
import { cn } from "@/lib/utils";
import { Template } from "@/lib/types";


interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

// ── Layout Preview SVG ──────────────────────────────────────────────────────────
function LayoutPreview({ template }: { template: Template }) {
  const gradColors = template.previewGradient ?? [template.previewColor];
  const layout = template.layout;
  const id = `grad-${template.id}`;

  const phoneColor = "rgba(255,255,255,0.18)";
  const phoneBg = "rgba(99,102,241,0.15)";
  const phoneBorder = "rgba(99,102,241,0.5)";
  const textColor = "rgba(255,255,255,0.8)";
  const textLight = "rgba(255,255,255,0.4)";

  return (
    <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="120" y2="160" gradientUnits="userSpaceOnUse">
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
        <clipPath id={`clip-${template.id}`}>
          <rect width="120" height="160" rx="10" />
        </clipPath>
      </defs>

      {/* Background with rounded corners */}
      <rect width="120" height="160" rx="10" fill={`url(#${id})`} />

      {/* Mock layout shapes */}
      {layout === "screenshot-top" && (
        <>
          <rect x="20" y="10" width="80" height="110" rx="6" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.5" strokeDasharray="5 3" />
          <rect x="28" y="18" width="64" height="95" rx="5" fill={phoneColor} />
          <rect x="20" y="130" width="80" height="8" rx="3" fill={textColor} />
          <rect x="30" y="142" width="60" height="5" rx="2" fill={textLight} />
        </>
      )}
      {layout === "screenshot-bottom" && (
        <>
          <rect x="20" y="18" width="80" height="8" rx="3" fill={textColor} />
          <rect x="30" y="30" width="60" height="5" rx="2" fill={textLight} />
          <rect x="20" y="48" width="80" height="112" rx="6" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.5" strokeDasharray="5 3" />
          <rect x="28" y="56" width="64" height="90" rx="5" fill={phoneColor} />
        </>
      )}
      {layout === "screenshot-float" && (
        <>
          <rect x="8" y="20" width="45" height="8" rx="3" fill={textColor} />
          <rect x="8" y="32" width="38" height="8" rx="3" fill={textColor} />
          <rect x="8" y="50" width="48" height="4" rx="2" fill={textLight} />
          <rect x="8" y="58" width="40" height="4" rx="2" fill={textLight} />
          <rect x="55" y="8" width="72" height="120" rx="6" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.5" strokeDasharray="5 3" />
          <rect x="63" y="16" width="56" height="106" rx="5" fill={phoneColor} />
        </>
      )}
      {layout === "screenshot-float-reverse" && (
        <>
          <rect x="-7" y="8" width="72" height="120" rx="6" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.5" strokeDasharray="5 3" />
          <rect x="1" y="16" width="56" height="106" rx="5" fill={phoneColor} />
          <rect x="67" y="20" width="45" height="8" rx="3" fill={textColor} />
          <rect x="67" y="32" width="38" height="8" rx="3" fill={textColor} />
          <rect x="67" y="50" width="48" height="4" rx="2" fill={textLight} />
          <rect x="67" y="58" width="40" height="4" rx="2" fill={textLight} />
        </>
      )}
      {layout === "screenshot-full" && (
        <>
          <rect x="0" y="0" width="120" height="110" fill={phoneBg} />
          <rect x="0" y="0" width="120" height="110" fill={phoneColor} />
          <rect x="0" y="60" width="120" height="100" fill="rgba(0,0,0,0.5)" />
          <rect x="10" y="115" width="65" height="9" rx="3" fill={textColor} />
          <rect x="10" y="130" width="90" height="5" rx="2" fill={textLight} />
          <rect x="10" y="140" width="70" height="5" rx="2" fill={textLight} />
        </>
      )}
      {layout === "screenshot-split" && (
        <>
          <rect x="10" y="8" width="70" height="8" rx="3" fill={textColor} />
          <rect x="10" y="20" width="90" height="4" rx="2" fill={textLight} />
          <rect x="4" y="32" width="54" height="118" rx="5" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.2" strokeDasharray="4 3" />
          <rect x="8" y="38" width="46" height="108" rx="4" fill={phoneColor} />
          <rect x="62" y="32" width="54" height="118" rx="5" fill={phoneBg} stroke={phoneBorder} strokeWidth="1.2" strokeDasharray="4 3" />
          <rect x="66" y="38" width="46" height="108" rx="4" fill={phoneColor} />
        </>
      )}
      {layout === "text-only" && (
        <>
          <rect x="10" y="28" width="80" height="12" rx="4" fill={textColor} />
          <rect x="10" y="44" width="65" height="12" rx="4" fill={textColor} />
          <rect x="10" y="60" width="50" height="12" rx="4" fill={textColor} />
          <rect x="10" y="82" width="95" height="5" rx="2" fill={textLight} />
          <rect x="10" y="92" width="80" height="5" rx="2" fill={textLight} />
          <rect x="10" y="102" width="60" height="5" rx="2" fill={textLight} />
        </>
      )}
    </svg>
  );
}

export function NewProjectModal({ open, onClose, onCreated }: NewProjectModalProps) {
  const { createProject, projects } = useProjectStore();
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(user && user.isAnonymous);
  const hasReachedGuestLimit = isGuest && projects.length >= 1;
  const hasReachedFreeLimit = !isGuest && !isPro && projects.length >= 3;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("My App Screenshots");
  const [platforms, setPlatforms] = useState<{ ios: boolean; android: boolean }>({ ios: true, android: true });
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(BASE_TEMPLATES);

  // Search, category and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TemplateSortOption>("popularity");
  const [globalCounts, setGlobalCounts] = useState<Record<string, number>>({});

  const handleClose = () => {
    setSelectedTemplate(null);
    setProjectName("My App Screenshots");
    setPlatforms({ ios: true, android: true });
    setCreating(false);
    setSearchQuery("");
    setSelectedCategory("all");
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    // Load full template catalog dynamically
    getAllTemplates().then(setTemplates).catch(() => {});

    // Fetch global popularity counts from API
    fetch("/api/templates/popularity")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.counts) {
          setGlobalCounts(data.counts);
        }
      })
      .catch(() => {});
  }, [open]);

  // Filtered & Sorted Themes
  const themes = useMemo(() => {
    let base = templates.filter((t) => t.id !== "blank");
    if (selectedCategory !== "all") {
      base = base.filter((t) => {
        if (selectedCategory === "pro") return isProTemplate(t);
        if (selectedCategory === "dark") {
          return (t.tags || []).some(tag => ["dark", "obsidian", "night", "cyber", "black"].includes(tag.toLowerCase())) ||
                 (t.name || "").toLowerCase().includes("dark") ||
                 (t.name || "").toLowerCase().includes("obsidian") ||
                 (t.name || "").toLowerCase().includes("cyber");
        }
        if (selectedCategory === "minimal") {
          return (t.tags || []).some(tag => ["minimal", "clean", "light", "white", "simple"].includes(tag.toLowerCase())) ||
                 (t.name || "").toLowerCase().includes("minimal") ||
                 (t.name || "").toLowerCase().includes("clean");
        }
        if (selectedCategory === "gradient") {
          return (t.tags || []).some(tag => ["gradient", "vibrant", "glow", "neon", "sunset", "mesh"].includes(tag.toLowerCase())) ||
                 (t.previewGradient && t.previewGradient.length > 1);
        }
        if (selectedCategory === "finance") {
          return (t.tags || []).some(tag => ["crypto", "finance", "fintech", "analytics", "banking", "saas", "dashboard", "business"].includes(tag.toLowerCase())) ||
                 (t.name || "").toLowerCase().includes("crypto") ||
                 (t.name || "").toLowerCase().includes("finance") ||
                 (t.name || "").toLowerCase().includes("analytics") ||
                 (t.name || "").toLowerCase().includes("saas");
        }
        if (selectedCategory === "fitness") {
          return (t.tags || []).some(tag => ["fitness", "health", "workout", "lifestyle", "habit", "sport", "meditation"].includes(tag.toLowerCase())) ||
                 (t.name || "").toLowerCase().includes("fitness") ||
                 (t.name || "").toLowerCase().includes("health") ||
                 (t.name || "").toLowerCase().includes("workout");
        }
        return true;
      });
    }
    return sortAndFilterTemplates(base, searchQuery, sortBy, globalCounts);
  }, [templates, selectedCategory, searchQuery, sortBy, globalCounts]);


  // Identify top 3 popular templates for 🔥 Popular badge
  const topPopularIds = useMemo(() => {
    const sorted = [...templates.filter((t) => t.id !== "blank")].sort((a, b) => {
      return getTemplateScore(b.id, globalCounts) - getTemplateScore(a.id, globalCounts);
    });
    return new Set(sorted.slice(0, 3).map((t) => t.id));
  }, [templates, globalCounts]);

  const handleCreate = async () => {
    if (hasReachedGuestLimit) {
      setAuthModalOpen(true);
      onClose();
      return;
    }
    if (hasReachedFreeLimit) {
      setUpgradeModalOpen(true);
      onClose();
      return;
    }
    if (!projectName.trim() || !selectedTemplate || (!platforms.ios && !platforms.android)) return;

    const chosenTemplate = templates.find((t) => t.id === selectedTemplate);
    if (isProTemplate(chosenTemplate) && !isPro) {
      if (isGuest) {
        setAuthModalOpen(true);
        toast.info("Pro Suite Templates require SnapFrame Pro. Sign in with Google or GitHub to upgrade.");
      } else {
        setUpgradeModalOpen(true);
        toast.info("Pro Suite Templates require SnapFrame Pro. Upgrade to unlock luxury presets.");
      }
      onClose();
      return;
    }

    setCreating(true);
    try {
      // Record popularity (+1 in localStorage + Firebase sync)
      recordTemplateSelection(selectedTemplate);

      const project = createProject(selectedTemplate, projectName.trim(), platforms, chosenTemplate);
      onClose();
      onCreated(project.id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent showCloseButton={false} className="max-w-5xl h-[88vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl">

        {/* Header */}
        <DialogHeader className="p-4 sm:px-7 sm:py-4 border-b border-border/50 shrink-0 flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold">Select a Theme</DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Choose a pre-designed theme for your screenshots
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close dialog" className="rounded-full -mr-2 -mt-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search, Filter & Sort Controls Row */}
          <div className="flex items-center gap-3 flex-wrap justify-between pt-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by theme name, style, or tag…"
                className="h-9 pl-9 pr-8 text-xs bg-secondary/40 border-border/50 rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector Dropdown/Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/40 text-xs">
                <span className="text-[11px] font-medium text-muted-foreground px-2 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Sort:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("popularity")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none",
                    sortBy === "popularity" || sortBy === "popularity-desc" || sortBy === "popularity-asc"
                      ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Most popular first"
                >
                  Popular
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none",
                    sortBy === "newest"
                      ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Newest templates first"
                >
                  Newest
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1">
            {[
              { id: "all", label: "All Themes" },
              { id: "pro", label: "👑 Pro Suites" },
              { id: "dark", label: "🌙 Dark & Cyber" },
              { id: "minimal", label: "☀️ Clean Minimal" },
              { id: "gradient", label: "🎨 Vibrant Glow" },
              { id: "finance", label: "📈 Finance & SaaS" },
              { id: "fitness", label: "⚡ Health & Fitness" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Body (Scrollable List) */}
        <ScrollArea className="flex-1 min-h-0 bg-secondary/20">
          <div className="p-4 sm:p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            
            {themes.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              const isPopular = topPopularIds.has(tpl.id);
              const isProTpl = isProTemplate(tpl);

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={cn(
                    "group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer bg-card shadow-xs hover:shadow-md hover:border-primary/50 text-left",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10"
                      : "border-border/60 hover:bg-accent/5"
                  )}
                >
                  {/* Top Badges Row */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    {/* Pro Badge */}
                    {isProTpl ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Crown className="w-2.5 h-2.5" />
                        <span>PRO</span>
                      </span>
                    ) : isPopular ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Flame className="w-2.5 h-2.5 text-rose-500" />
                        <span>POPULAR</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Checkbox indicator */}
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border/80 bg-background/80 group-hover:border-primary/50"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                  </div>

                  {/* Visual Preview SVG */}
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-background/50 border border-border/40 p-2 flex items-center justify-center mb-3 mt-4 group-hover:scale-[1.02] transition-transform">
                    <LayoutPreview template={tpl} />
                  </div>

                  {/* Meta */}
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {tpl.name}
                      </h3>
                      <span className="text-[10px] capitalize font-medium text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary/80 shrink-0">
                        {tpl.category ?? "General"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Custom / Blank Canvas Option */}
            <div
              onClick={() => setSelectedTemplate("blank")}
              className={cn(
                "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer bg-card/50 hover:bg-card shadow-xs hover:shadow-md text-left min-h-[220px]",
                selectedTemplate === "blank"
                  ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10"
                  : "border-border/70 hover:border-primary/50"
              )}
            >
              <div className={cn(
                "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                selectedTemplate === "blank"
                  ? "bg-primary border-primary"
                  : "border-border/80 bg-background/80 group-hover:border-primary/50"
              )}>
                {selectedTemplate === "blank" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>

              <div className="w-16 h-16 rounded-full bg-background shadow-sm border border-border/50 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="text-center w-full px-2">
                <h3 className="text-lg font-bold text-foreground">Custom Design</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Start with a blank canvas and create from scratch.</p>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 sm:px-7 sm:py-4 border-t border-border/50 shrink-0 bg-card flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 flex-1">
            <div className="flex flex-col gap-1 w-full sm:max-w-sm">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My App Screenshots"
                className="h-10 text-sm border-border/50 bg-secondary/30"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              />
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-border/50 mx-1" />
            
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Platforms</label>
              <div className="flex gap-2">
                <Button
                  variant={platforms.ios ? "default" : "outline"}
                  onClick={() => setPlatforms(prev => ({ ...prev, ios: !prev.ios }))}
                  className="flex-1 sm:flex-initial h-10 px-4 font-medium cursor-pointer"
                >
                  iOS
                </Button>
                <Button
                  variant={platforms.android ? "default" : "outline"}
                  onClick={() => setPlatforms(prev => ({ ...prev, android: !prev.android }))}
                  className="flex-1 sm:flex-initial h-10 px-4 font-medium cursor-pointer"
                >
                  Android
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-1 md:pt-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 px-4 sm:px-6 font-medium cursor-pointer"
            >
              Cancel
            </Button>
            {hasReachedGuestLimit ? (
              <Button
                onClick={() => {
                  onClose();
                  setAuthModalOpen(true);
                }}
                className="flex-1 sm:flex-initial h-10 px-4 sm:px-6 font-semibold gap-2 bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In Free (1/1 Max)</span>
              </Button>
            ) : hasReachedFreeLimit ? (
              <Button
                onClick={() => {
                  onClose();
                  setUpgradeModalOpen(true);
                }}
                className="flex-1 sm:flex-initial h-10 px-4 sm:px-6 font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro (3/3 Limit)</span>
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!projectName.trim() || !selectedTemplate || (!platforms.ios && !platforms.android) || creating}
                className="flex-1 sm:flex-initial h-10 px-6 sm:px-8 font-semibold gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating…
                  </span>
                ) : (
                  <>
                    <span>Select a Theme</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
