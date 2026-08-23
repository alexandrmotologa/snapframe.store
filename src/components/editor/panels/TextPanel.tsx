"use client";

import { useState, memo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Lock, Sparkles, Link2, Palette, Check, RefreshCw } from "lucide-react";
import { TEXT_GRADIENT_PRESETS, TextGradientPreset } from "@/lib/textPresets";

// ── Google Fonts loader ────────────────────────────────────────────────────────
const GOOGLE_FONTS = [
  "Inter", "Roboto", "Poppins", "Montserrat", "Lato", "Oswald",
  "Raleway", "Nunito", "Playfair Display", "Merriweather",
  "Ubuntu", "Quicksand", "Josefin Sans", "Barlow",
  "Exo 2", "Syne", "Space Grotesk", "DM Sans", "Plus Jakarta Sans",
  "Outfit", "Cabin", "Bebas Neue", "Anton",
];

// ── Text preset categories ─────────────────────────────────────────────────────
interface TextPresetItem {
  label: string;
  preview?: {
    text: string;
    fontSize: number;
    fontWeight: number;
    letterSpacing?: number;
    lineHeight?: number;
    uppercase?: boolean;
    isMuted?: boolean;
  };
  customPreview?: React.ReactNode;
  layer: Record<string, any>;
}

interface PresetCategory {
  name: string;
  presets: TextPresetItem[];
}

const PRESET_CATEGORIES: PresetCategory[] = [
  {
    name: "Niche Copy (AI)",
    presets: [
      {
        label: "Fitness & Gym",
        preview: { text: "Crush Every Workout", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "Crush Every Workout",
          fontSize: 130, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
      {
        label: "Finance & Wealth",
        preview: { text: "Grow Wealth Automatically", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "Grow Wealth Automatically",
          fontSize: 125, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
      {
        label: "AI Productivity",
        preview: { text: "10x Your Productivity", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "10x Your Productivity",
          fontSize: 130, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
      {
        label: "Sleep & Calm",
        preview: { text: "Fall Asleep Faster", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "Fall Asleep Faster",
          fontSize: 135, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
      {
        label: "Dating & Meet",
        preview: { text: "Meet Someone Real", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "Meet Someone Real",
          fontSize: 130, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
      {
        label: "Travel & Stays",
        preview: { text: "Book Dream Getaways", fontSize: 16, fontWeight: 800 },
        layer: {
          type: "text", content: "Book Dream Getaways",
          fontSize: 125, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.1,
          letterSpacing: -1, width: 1100, height: 280,
        },
      },
    ],
  },
  {
    name: "Headlines",
    presets: [
      {
        label: "Big Title",
        preview: { text: "Big Title", fontSize: 24, fontWeight: 800, letterSpacing: -1 },
        layer: {
          type: "text", content: "Your Big Title",
          fontSize: 140, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "left", lineHeight: 1.1,
          letterSpacing: -2, width: 1000, height: 300,
        },
      },
      {
        label: "Display XL",
        preview: { text: "DISPLAY XL", fontSize: 22, fontWeight: 900, letterSpacing: 2, uppercase: true },
        layer: {
          type: "text", content: "DISPLAY",
          fontSize: 200, fontWeight: 900, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.0,
          letterSpacing: 8, width: 1290, height: 350,
        },
      },
      {
        label: "Hero Split",
        preview: { text: "Hero\nHeadline", fontSize: 20, fontWeight: 800, lineHeight: 1.05 },
        layer: {
          type: "text", content: "Big\nHeadline",
          fontSize: 160, fontWeight: 800, fontFamily: "Inter",
          color: "#ffffff", align: "left", lineHeight: 1.0,
          letterSpacing: -3, width: 1000, height: 480,
        },
      },
    ],
  },
  {
    name: "Subtitles",
    presets: [
      {
        label: "Subtitle",
        preview: { text: "One clear subtitle for your app", fontSize: 13, fontWeight: 500, isMuted: true },
        layer: {
          type: "text", content: "One clear subtitle",
          fontSize: 60, fontWeight: 500, fontFamily: "Inter",
          color: "rgba(255,255,255,0.8)", align: "left", lineHeight: 1.3,
          letterSpacing: 0, width: 1000, height: 120,
        },
      },
      {
        label: "Description",
        preview: { text: "Describe your key features\nin two short clear lines", fontSize: 12, fontWeight: 400, isMuted: true, lineHeight: 1.4 },
        layer: {
          type: "text", content: "Describe your app\nin two short lines",
          fontSize: 52, fontWeight: 400, fontFamily: "Inter",
          color: "rgba(255,255,255,0.75)", align: "left", lineHeight: 1.5,
          letterSpacing: 0, width: 1000, height: 200,
        },
      },
      {
        label: "Eyebrow",
        preview: { text: "NEW FEATURE", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, uppercase: true, isMuted: true },
        layer: {
          type: "text", content: "NEW FEATURE",
          fontSize: 36, fontWeight: 700, fontFamily: "Inter",
          color: "rgba(255,255,255,0.65)", align: "left", lineHeight: 1.2,
          letterSpacing: 6, width: 800, height: 80,
        },
      },
    ],
  },
  {
    name: "Labels",
    presets: [
      {
        label: "Tagline",
        preview: { text: "THE APP FOR EVERYONE", fontSize: 11, fontWeight: 600, letterSpacing: 2, uppercase: true },
        layer: {
          type: "text", content: "THE APP FOR EVERYONE",
          fontSize: 44, fontWeight: 600, fontFamily: "Inter",
          color: "rgba(255,255,255,0.9)", align: "center", lineHeight: 1.3,
          letterSpacing: 6, width: 1100, height: 80,
        },
      },
      {
        label: "Rating / Proof Pill",
        preview: { text: "★ 4.9 · 10M+ Downloads", fontSize: 11, fontWeight: 600 },
        layer: {
          type: "text", content: "★ 4.9  ·  10M+ Downloads",
          fontSize: 46, fontWeight: 600, fontFamily: "Inter",
          color: "rgba(255,255,255,0.85)", align: "center", lineHeight: 1.2,
          letterSpacing: 1, width: 900, height: 80,
        },
      },
      {
        label: "Store Availability",
        preview: { text: "Available on App Store & Google Play", fontSize: 10, fontWeight: 400, isMuted: true },
        layer: {
          type: "text", content: "Available on App Store & Google Play",
          fontSize: 38, fontWeight: 400, fontFamily: "Inter",
          color: "rgba(255,255,255,0.55)", align: "center", lineHeight: 1.5,
          letterSpacing: 0, width: 1100, height: 70,
        },
      },
    ],
  },
  {
    name: "Styles",
    presets: [
      {
        label: "Pill Tag",
        customPreview: (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold tracking-wider uppercase">
            NEW · FEATURE
          </div>
        ),
        layer: {
          type: "text", content: "NEW  ·  FEATURE",
          fontSize: 40, fontWeight: 700, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.2,
          letterSpacing: 4, width: 800, height: 100,
          highlight: { color: "rgba(255,255,255,0.15)", paddingX: 30, paddingY: 15, cornerRadius: 50 },
        },
      },
      {
        label: "Card Container",
        customPreview: (
          <div className="w-full px-3 py-2 rounded-xl bg-card border border-border/80 shadow-xs text-foreground text-xs font-semibold text-center">
            Important Message Card
          </div>
        ),
        layer: {
          type: "text", content: "Important Message",
          fontSize: 70, fontWeight: 600, fontFamily: "Inter",
          color: "#111827", align: "center", lineHeight: 1.3,
          letterSpacing: 0, width: 1000, height: 160,
          highlight: { color: "#ffffff", paddingX: 40, paddingY: 30, cornerRadius: 24 },
        },
      },
      {
        label: "Highlight Badge",
        customPreview: (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-400/25 border border-amber-400/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
            Stand Out!
          </div>
        ),
        layer: {
          type: "text", content: "Stand Out!",
          fontSize: 90, fontWeight: 800, fontFamily: "Inter",
          color: "#1a1a2e", align: "center", lineHeight: 1.2,
          letterSpacing: -1, width: 900, height: 150,
          highlight: { color: "#fbbf24", paddingX: 20, paddingY: 10, cornerRadius: 8 },
        },
      },
      {
        label: "Outline Headline",
        customPreview: (
          <div
            className="text-lg font-black uppercase tracking-wider text-foreground"
            style={{
              WebkitTextStroke: "1px currentColor",
              WebkitTextFillColor: "transparent",
            }}
          >
            OUTLINE
          </div>
        ),
        layer: {
          type: "text", content: "OUTLINE",
          fontSize: 160, fontWeight: 900, fontFamily: "Inter",
          color: "transparent", align: "center", lineHeight: 1.0,
          letterSpacing: 4, width: 1100, height: 250,
          stroke: { color: "#ffffff", width: 4 },
        },
      },
      {
        label: "Neon Glow",
        customPreview: (
          <div className="text-sm font-bold text-violet-600 dark:text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]">
            Glowing Title
          </div>
        ),
        layer: {
          type: "text", content: "Glowing Title",
          fontSize: 120, fontWeight: 700, fontFamily: "Inter",
          color: "#ffffff", align: "center", lineHeight: 1.2,
          letterSpacing: 0, width: 1100, height: 200,
          shadow: { color: "#8b5cf6", blur: 40, offsetX: 0, offsetY: 0 },
        },
      },
    ],
  },
];

// ── Smart Typography Sync Widget ───────────────────────────────────────────
function SmartSyncWidget() {
  const { getActiveSet, getActiveLayer, syncTypographyToAllScreens } = useEditorStore();
  const set = getActiveSet();
  const layer = getActiveLayer();

  if (!set || !layer || layer.type !== "text") return null;

  const handleSync = () => {
    syncTypographyToAllScreens(set.id, layer.id);
    toast.success(`Synced typography to all ${set.screens.length} screens in set!`);
  };

  return (
    <div className="px-3.5 py-2.5 border-b border-border/40 bg-primary/5 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Link2 className="w-3.5 h-3.5 text-primary" />
          <span>Smart Text Link</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          Sync font, style &amp; gradients across all screens without changing copy
        </p>
      </div>
      <button
        type="button"
        onClick={handleSync}
        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
        title="Apply current font, gradient and styling to all screens in active set"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Sync All</span>
      </button>
    </div>
  );
}

// ── Metallic & Glow Text Gradients Widget ────────────────────────────────────
function TextGradientsWidget() {
  const { getActiveSet, getActiveScreen, getActiveLayer, updateLayer } = useEditorStore();
  const layer = getActiveLayer();
  const set = getActiveSet();
  const screen = getActiveScreen();

  if (!layer || layer.type !== "text" || !set || !screen) return null;
  const tl = layer as import("@/lib/types").TextLayer;

  const handleApplyPreset = (preset: TextGradientPreset) => {
    updateLayer(set.id, screen.id, layer.id, {
      gradientPresetId: preset.id,
      color: preset.textColor,
      glow: preset.glow,
      gradientColor: undefined, // Clears ad-hoc gradient if any
    } as Partial<import("@/lib/types").Layer>);
    useEditorStore.getState().recordHistory();
    toast.success(`Applied ${preset.name} style!`);
  };

  return (
    <div className="px-3.5 py-3 border-b border-border/40 bg-card/30 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Metallic &amp; Glow Styles</span>
        </span>
        <span className="text-[9px] font-mono text-muted-foreground">
          {TEXT_GRADIENT_PRESETS.length} presets
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {TEXT_GRADIENT_PRESETS.map((preset) => {
          const isSelected = tl.gradientPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer group relative overflow-hidden",
                isSelected
                  ? "bg-primary/15 border-primary shadow-xs ring-1 ring-primary/40"
                  : "bg-secondary/40 hover:bg-secondary/80 border-border/40 hover:border-border/80"
              )}
            >
              {/* Preview swatch */}
              <div
                className="w-5 h-5 rounded-md border border-white/20 shrink-0 flex items-center justify-center shadow-xs"
                style={{
                  background: preset.previewBg,
                  boxShadow: preset.glow ? `0 0 8px ${preset.glow.color}` : undefined,
                }}
              >
                {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
              </div>

              {/* Preset name */}
              <div className="min-w-0 flex-1">
                <span className={cn(
                  "text-[11px] font-medium block truncate",
                  isSelected ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                )}>
                  {preset.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Font selector row ─────────────────────────────────────────────────────────
function FontRow() {
  const { getActiveSet, getActiveScreen, getActiveLayer, updateLayer } = useEditorStore();
  const layer = getActiveLayer();
  const set = getActiveSet();
  const screen = getActiveScreen();
  const [search, setSearch] = useState("");

  if (!layer || layer.type !== "text" || !set || !screen) return null;

  const tl = layer as import("@/lib/types").TextLayer;
  const filtered = GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(search.toLowerCase()));

  const loadFont = (fontName: string) => {
    if (fontName === "Inter") return;
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;800&display=swap`;
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  };

  return (
    <div className="px-4 pt-3 pb-3 border-b border-border/40 bg-card/40">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Font Family</p>
        <span className="text-[10px] text-primary font-medium">{tl.fontFamily || "Inter"}</span>
      </div>
      <input
        type="text"
        placeholder="Search 20+ Google fonts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border/40 text-xs outline-none text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40"
      />
      <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
        {filtered.map((font) => {
          loadFont(font);
          const isSelected = (tl.fontFamily || "Inter") === font;
          return (
            <button
              key={font}
              type="button"
              onClick={() => {
                loadFont(font);
                updateLayer(set.id, screen.id, layer.id, { fontFamily: font } as Partial<import("@/lib/types").Layer>);
                useEditorStore.getState().recordHistory();
                toast.info(`Font set to ${font}`);
              }}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left",
                isSelected
                  ? "bg-primary/20 text-primary ring-1 ring-primary/40 font-semibold"
                  : "hover:bg-secondary/80 text-foreground"
              )}
            >
              <span style={{ fontFamily: `"${font}", sans-serif` }} className="text-sm">
                {font}
              </span>
              <span className="text-[10px] opacity-60 font-mono" style={{ fontFamily: `"${font}", sans-serif` }}>
                Aa 123
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Copywriter & Tone Assistant ──────────────────────────────────────────
function AICopywriterWidget() {
  const { getActiveSet, getActiveScreen, getActiveLayer, updateLayer } = useEditorStore();
  const { user, consumeAiCredit, setAuthModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);

  const layer = getActiveLayer();
  const set = getActiveSet();
  const screen = getActiveScreen();

  const [tone, setTone] = useState<"high-energy" | "minimalist" | "benefit-driven" | "fomo" | "b2b">("high-energy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);

  if (!layer || layer.type !== "text" || !set || !screen) return null;
  const tl = layer as import("@/lib/types").TextLayer;
  const currentText = tl.content || "";
  const charCount = currentText.length;
  const isOverLimit = charCount > 30;

  if (isGuest) {
    return (
      <div className="px-3.5 py-3 border-b border-border/40 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copywriter &amp; Tone</span>
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Registered only
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          AI caption generation and tone adjustments are available for registered accounts.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAuthModalOpen(true)}
          className="w-full text-xs h-7 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
        >
          Sign In (100% Free) to Unlock AI
        </Button>
      </div>
    );
  }

  const handleRunAI = async (action: "rewrite" | "shorten" | "punchy" | "emojis" | "ideas") => {
    const creditRes = await consumeAiCredit("ai-copywriter");
    if (!creditRes.allowed) return;

    try {
      setIsGenerating(true);
      setVariations([]);

      const res = await fetch("/api/ai/copywriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentText,
          action,
          tone,
          maxLength: action === "shorten" ? 28 : 32,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");

      if (data.result) {
        updateLayer(set.id, screen.id, layer.id, { content: data.result } as Partial<import("@/lib/types").Layer>);
        useEditorStore.getState().recordHistory();
        toast.success("AI updated text!");
      }

      if (data.variations && Array.isArray(data.variations)) {
        setVariations(data.variations);
      } else if (data.options && Array.isArray(data.options)) {
        setVariations(data.options);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "AI copywriter error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="px-3.5 py-3 border-b border-border/40 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent space-y-2.5">
      {/* Title & Live Character Meter */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1 text-foreground">
          <span className="text-indigo-400">✨</span> AI Copywriter &amp; Tone
        </span>
        <span
          className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border",
            isOverLimit
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          )}
          title="App Store recommended title length is <= 30 characters"
        >
          {charCount} / 30 chars
        </span>
      </div>

      {/* Tone Chips */}
      <div className="grid grid-cols-5 gap-1">
        {[
          { id: "high-energy", label: "🚀 Energy" },
          { id: "minimalist", label: "✨ Minimal" },
          { id: "benefit-driven", label: "🎯 Benefit" },
          { id: "fomo", label: "🔥 FOMO" },
          { id: "b2b", label: "💼 B2B" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTone(t.id as any)}
            className={cn(
              "py-1 px-0.5 rounded-md text-[9.5px] font-semibold tracking-tight text-center truncate transition-all border cursor-pointer select-none",
              tone === t.id
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground border-border/40 hover:bg-secondary active:scale-95"
            )}
            title={t.label}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => handleRunAI("rewrite")}
          disabled={isGenerating || !currentText}
          className="h-7 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? <span className="animate-spin text-xs">⏳</span> : <span>✨</span>}
          <span>Rewrite Tone</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAI("shorten")}
          disabled={isGenerating || !currentText}
          className="h-7 px-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>✂️</span>
          <span>Shorten (&lt;30c)</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAI("punchy")}
          disabled={isGenerating || !currentText}
          className="h-7 px-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>💥</span>
          <span>Make Punchier</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAI("ideas")}
          disabled={isGenerating}
          className="h-7 px-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>💡</span>
          <span>5 Alternatives</span>
        </button>
      </div>

      {/* Alternative Variations List */}
      {variations.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/30 animate-in fade-in duration-200">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
            Click to apply variation:
          </span>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {variations.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  updateLayer(set.id, screen.id, layer.id, { content: v } as Partial<import("@/lib/types").Layer>);
                  useEditorStore.getState().recordHistory();
                  toast.success("Applied variation!");
                }}
                className="w-full text-left p-1.5 rounded-md bg-secondary/40 hover:bg-indigo-500/15 border border-border/40 hover:border-indigo-500/40 text-[11px] text-foreground transition-all cursor-pointer truncate flex items-center justify-between"
              >
                <span className="truncate">{v}</span>
                <span className="text-[9px] font-mono opacity-60 ml-1 shrink-0">{v.length}c</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TextPanel ─────────────────────────────────────────────────────────────
export const TextPanel = memo(function TextPanel() {
  const { getActiveSet, getActiveScreen, addLayer, getActiveLayer } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState("Niche Copy (AI)");
  const activeLayer = getActiveLayer();
  const hasTextLayer = activeLayer?.type === "text";

  const handleAdd = (preset: (typeof PRESET_CATEGORIES)[0]["presets"][0]) => {
    const set = getActiveSet();
    const screen = getActiveScreen();
    if (!set || !screen) return;

    // Load Google Font if needed
    const font = (preset.layer as { fontFamily?: string }).fontFamily;
    if (font && font !== "Inter") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800;900&display=swap`;
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    }

    addLayer(set.id, screen.id, {
      ...preset.layer,
      x: Math.round(screen.width / 2 - ((preset.layer as { width: number }).width ?? 1000) / 2),
      y: Math.round(screen.height * 0.22),
      rotation: 0,
      opacity: 1,
    } as Parameters<typeof addLayer>[2]);
  };

  const category = PRESET_CATEGORIES.find((c) => c.name === activeCategory) ?? PRESET_CATEGORIES[0];

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Smart Typography Sync (Text Link) — shown when text layer is active */}
      {hasTextLayer && <SmartSyncWidget />}

      {/* Metallic & Glow Text Gradients Picker — shown when text layer is active */}
      {hasTextLayer && <TextGradientsWidget />}

      {/* AI Copywriter Widget — shown when text layer is active */}
      {hasTextLayer && <AICopywriterWidget />}

      {/* Font selector — shown when text layer is active */}
      {hasTextLayer && <FontRow />}

      {/* Category tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-2 shrink-0 overflow-x-auto">
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveCategory(cat.name)}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
              activeCategory === cat.name
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="px-4 text-[10px] text-muted-foreground mb-1">Click to add to active screen</p>

      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="px-3 pb-16 space-y-2">
          {category.presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleAdd(preset)}
              className="w-full text-left px-4 py-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/90 border border-border/50 hover:border-primary/40 hover:ring-1 hover:ring-primary/30 transition-all group relative overflow-hidden cursor-pointer"
            >
              {/* Custom Preview or theme-adaptive text preview */}
              {preset.customPreview ? (
                <div className="w-full flex items-center justify-start py-0.5">
                  {preset.customPreview}
                </div>
              ) : preset.preview ? (
                <div
                  className={cn(
                    "leading-tight truncate transition-colors",
                    preset.preview.isMuted
                      ? "text-muted-foreground group-hover:text-foreground"
                      : "text-foreground group-hover:text-primary"
                  )}
                  style={{
                    fontSize: preset.preview.fontSize,
                    fontWeight: preset.preview.fontWeight,
                    letterSpacing: preset.preview.letterSpacing ?? 0,
                    lineHeight: preset.preview.lineHeight ?? 1.2,
                    textTransform: preset.preview.uppercase ? "uppercase" : "none",
                    whiteSpace: "pre",
                  }}
                >
                  {preset.preview.text}
                </div>
              ) : null}

              {/* Label */}
              <p className="text-[10px] font-medium text-muted-foreground mt-1.5 group-hover:text-primary transition-colors">
                {preset.label}
              </p>
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
