"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Check, Layers, LayoutTemplate, Lock, Crown, Plus, Sparkles, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { useEditorStore } from "@/lib/store/editorStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { BASE_TEMPLATES, getAllTemplates, isProTemplate } from "@/lib/templates";
import { recordTemplateSelection } from "@/lib/templatePopularity";
import { getLocalCustomTemplates, customTemplateToTemplate, CustomTemplate, deleteCustomTemplate } from "@/lib/customTemplates";
import { SaveTemplateModal } from "@/components/editor/SaveTemplateModal";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

// ── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "My Presets",
  "Pro Niches",
  "10 Screens",
  "8 Screens",
  "6 Screens",
  "5 Screens",
  "Community",
  "Modern",
  "Minimal",
  "Bold",
  "Classic",
] as const;
type Category = (typeof CATEGORIES)[number];

// ── Template preview card ───────────────────────────────────────────────────
function TemplateCard({
  template,
  isApplied,
  isProUser,
  onApply,
}: {
  template: Template;
  isApplied: boolean;
  isProUser: boolean;
  onApply: () => void;
}) {
  // Preview gradient colors from template
  const [c1, c2] = template.previewGradient ?? [template.previewColor ?? "#1a1a2e", "#6366f1"];
  const gradientStyle = {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
  };

  const screenCount = template.screens?.length || 1;
  const isProTpl = isProTemplate(template);

  return (
    <button
      type="button"
      onClick={onApply}
      className={cn(
        "group relative w-full text-left rounded-xl overflow-hidden border transition-all duration-200 shadow-xs",
        isApplied
          ? "border-primary ring-2 ring-primary/40"
          : "border-border/50 hover:border-border hover:shadow-md",
        "hover:scale-[1.01] active:scale-[0.99]"
      )}
    >
      {/* Visual preview */}
      <div
        className="relative h-32 flex flex-col"
        style={gradientStyle}
      >
        {/* Mock layout preview based on template layout */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          {/* Screenshot zone mock */}
          {template.layout !== "text-only" && (
            <div
              className={cn(
                "rounded-lg opacity-80 bg-white/20 backdrop-blur-sm border border-white/20",
                template.layout === "screenshot-top" ? "h-[60%]" :
                template.layout === "screenshot-bottom" ? "mt-auto h-[55%]" :
                template.layout === "screenshot-float" ? "mx-auto w-[55%] h-[75%]" :
                template.layout === "screenshot-full" ? "absolute inset-0 opacity-40" :
                "h-[65%]"
              )}
            />
          )}
          {/* Text mock lines */}
          <div className="space-y-1.5">
            <div className="h-2.5 rounded-full bg-white/60 w-3/4" />
            <div className="h-1.5 rounded-full bg-white/35 w-1/2" />
          </div>
        </div>

        {/* Screen count & Pro badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10 gap-1">
          <div>
            {isProTpl && (
              <div className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 text-[9px] font-black tracking-wide shadow-xs flex items-center gap-1 border border-amber-300/40">
                {!isProUser ? (
                  <>
                    <Lock className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />
                    <span>PRO</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-2.5 h-2.5 text-zinc-950 fill-zinc-950" />
                    <span>PRO</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-[9px] font-medium text-white/95 border border-white/15 flex items-center gap-1 whitespace-nowrap shadow-xs ml-auto">
            <Layers className="w-2.5 h-2.5 shrink-0 opacity-80" />
            <span>{screenCount} {screenCount === 1 ? "screen" : "screens"}</span>
          </div>
        </div>

        {/* Applied checkmark overlay */}
        {isApplied && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 bg-card/90 dark:bg-secondary/40 border-t border-border/40 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-semibold text-foreground truncate leading-tight flex-1" title={template.name}>
            {template.name}
          </p>
          {isProTpl && !isProUser && (
            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 min-w-0">
          <span className="text-[8.5px] font-mono uppercase font-semibold text-muted-foreground/90 px-1 py-0.2 rounded bg-secondary/80 shrink-0 border border-border/30">
            {template.category}
          </span>
          <p className="text-[10px] text-muted-foreground truncate flex-1" title={template.description}>
            {template.description}
          </p>
        </div>
      </div>
    </button>
  );
}

// ── Main panel ──────────────────────────────────────────────────────────────
export function TemplatesPanel() {
  const { screenSets, getActiveSet, applyTemplate } = useEditorStore();
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);

  const [templates, setTemplates] = useState<Template[]>(BASE_TEMPLATES);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [applyScope, setApplyScope] = useState<"all" | "active">("all");
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Load custom templates from storage
  const loadCustomTemplates = useCallback(() => {
    const local = getLocalCustomTemplates();
    setCustomTemplates(local);
  }, []);

  useEffect(() => {
    getAllTemplates().then(setTemplates).catch(() => {});
    loadCustomTemplates();

    const handleCustomUpdated = () => {
      loadCustomTemplates();
    };
    window.addEventListener("snapframe_custom_templates_updated", handleCustomUpdated);
    return () => {
      window.removeEventListener("snapframe_custom_templates_updated", handleCustomUpdated);
    };
  }, [loadCustomTemplates]);

  const activeSet = getActiveSet();

  const filtered = useMemo(() => {
    if (category === "My Presets") {
      const converted = customTemplates.map(customTemplateToTemplate);
      if (!query.trim()) return converted;
      const q = query.toLowerCase();
      return converted.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    }

    return templates.filter((t) => {
      const count = t.screens?.length || 1;
      let matchCat = false;
      if (category === "All") matchCat = true;
      else if (category === "Pro Niches") matchCat = isProTemplate(t) || t.tags.some(tag => ["fintech", "crypto", "fitness", "saas", "social", "ecommerce", "meditation"].includes(tag.toLowerCase()));
      else if (category === "10 Screens") matchCat = count === 10;
      else if (category === "8 Screens") matchCat = count === 8;
      else if (category === "6 Screens") matchCat = count === 6;
      else if (category === "5 Screens") matchCat = count === 5;
      else matchCat = t.category.toLowerCase() === category.toLowerCase() || t.tags.some(tag => tag.toLowerCase() === category.toLowerCase());

      const q = query.toLowerCase();
      const matchQ = !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      return matchCat && matchQ;
    });
  }, [templates, customTemplates, query, category]);

  const handleApply = (template: Template) => {
    // Check Pro Gating
    if (isProTemplate(template) && !isPro) {
      if (isGuest) {
        setAuthModalOpen(true);
        toast.info("Pro Suite Templates require SnapFrame Pro. Sign in with Google or GitHub to upgrade.");
      } else {
        setUpgradeModalOpen(true);
        toast.info("Pro Suite Templates require SnapFrame Pro. Upgrade to unlock luxury industry presets.");
      }
      return;
    }

    // Record template usage count (+1)
    recordTemplateSelection(template.id);
    // Apply to all sets or active set
    const target = applyScope === "all" ? "all" : (activeSet?.id || "all");
    applyTemplate(target, template);
    setAppliedId(template.id);
    const scopeLabel = applyScope === "all" ? "all platforms (iOS & Android)" : (activeSet?.store === "android" ? "Google Play" : "App Store");
    toast.success(`Applied "${template.name}" (${template.screens?.length || 1} screens) to ${scopeLabel}`);
    // Reset applied indicator after 2s
    setTimeout(() => setAppliedId(null), 2000);
  };

  const handleDeleteCustom = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this custom preset?")) {
      await deleteCustomTemplate(templateId);
      loadCustomTemplates();
      toast.success("Custom preset deleted.");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={isSaveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        screens={activeSet?.screens || []}
      />

      {/* Search & Action Header */}
      <div className="p-3 border-b border-border/40 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
            <span>Templates &amp; Presets</span>
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (!isPro) {
                if (isGuest) {
                  setAuthModalOpen(true);
                  toast.info("Custom Template Presets require SnapFrame Pro. Sign in to upgrade.");
                } else {
                  setUpgradeModalOpen(true);
                  toast.info("Custom Template Presets require SnapFrame Pro. Upgrade to create presets.");
                }
                return;
              }
              setSaveModalOpen(true);
            }}
            className="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Save Preset</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/70 border border-border/40">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search templates or styles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground min-w-0"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b border-border/30 px-2 py-1 bg-card/40">
        <HorizontalScrollRail>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                setCategory(cat);
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
                category === cat
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95",
                cat === "My Presets" && "font-bold text-indigo-400 dark:text-indigo-300"
              )}
            >
              {cat === "My Presets" && <Sparkles className="w-3 h-3 text-indigo-400" />}
              <span>{cat}</span>
              {cat === "My Presets" && customTemplates.length > 0 && (
                <span className="px-1 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">
                  {customTemplates.length}
                </span>
              )}
            </button>
          ))}
        </HorizontalScrollRail>
      </div>

      {/* Scope Selector: All platforms vs Active */}
      {screenSets.length > 1 && (
        <div className="px-3 py-2 bg-secondary/25 border-b border-border/30 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Apply To:</span>
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {screenSets.length} sets
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-background/80 p-0.5 rounded-lg border border-border/40 text-[11px]">
            <button
              type="button"
              onClick={() => setApplyScope("all")}
              className={cn(
                "py-1 px-1.5 rounded-md font-medium text-center transition-all cursor-pointer truncate",
                applyScope === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
              title="Apply to all platforms (iOS & Android)"
            >
              All Platforms
            </button>
            <button
              type="button"
              onClick={() => setApplyScope("active")}
              className={cn(
                "py-1 px-1.5 rounded-md font-medium text-center transition-all cursor-pointer truncate",
                applyScope === "active"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
              title={`Apply to active ${activeSet?.store === "android" ? "Android" : "iOS"} set only`}
            >
              {activeSet?.store === "android" ? "Android" : "iOS"} Only
            </button>
          </div>
        </div>
      )}

      {/* Template grid */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 grid grid-cols-2 gap-2.5">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-8 px-4 text-xs text-muted-foreground space-y-2">
              {category === "My Presets" ? (
                <>
                  <Sparkles className="w-8 h-8 text-indigo-400/50 mx-auto" />
                  <p className="font-bold text-foreground">No custom presets saved yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Customize your canvas with your favorite frames &amp; gradients, then click &ldquo;Save Preset&rdquo; above.
                  </p>
                </>
              ) : (
                <p>No templates found matching &ldquo;{query}&rdquo;</p>
              )}
            </div>
          )}

          {filtered.map((template) => {
            const isCustom = template.tags?.includes("custom");
            const customData = isCustom ? customTemplates.find((c) => c.id === template.id) : null;

            return (
              <div key={template.id} className="relative group/custom">
                <TemplateCard
                  template={template}
                  isApplied={appliedId === template.id}
                  isProUser={isPro}
                  onApply={() => handleApply(template)}
                />

                {isCustom && customData && (
                  <div className="absolute top-2 left-2 z-10 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-white text-[9px] font-bold">
                      {customData.status === "approved" ? "✅ Public" : customData.status === "pending_review" ? "⏳ In Review" : "🔒 Private"}
                    </span>
                  </div>
                )}

                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustom(e, template.id)}
                    className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover/custom:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
