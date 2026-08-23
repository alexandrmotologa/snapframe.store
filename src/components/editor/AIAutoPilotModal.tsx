"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Loader2, Wand2, Palette, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store/editorStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { TextLayer, ScreenshotLayer, ImageLayer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AIAutoPilotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAutoPilotModal({ open, onOpenChange }: AIAutoPilotModalProps) {
  const { screenSets, activeSetId, updateScreenBackground, addLayer, updateLayer } = useEditorStore();
  const { activeLang } = useLanguageStore();
  const { user, isPro, aiCredits, consumeAiCredit, setAuthModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);

  const activeSet = screenSets.find((s) => s.id === activeSetId) || screenSets[0];
  const screens = activeSet?.screens || [];

  const [niche, setNiche] = useState("");
  const [targetTone, setTargetTone] = useState<"high-energy" | "b2b" | "minimalist" | "fomo" | "benefit-driven">("high-energy");
  const [applyGradients, setApplyGradients] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState("");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open || !activeSet) return null;

  const handleRunAutoPilot = async () => {
    if (isGuest) {
      onOpenChange(false);
      setAuthModalOpen(true);
      return;
    }

    const creditRes = await consumeAiCredit("vision-autopilot");
    if (!creditRes.allowed) {
      return;
    }

    try {
      setIsProcessing(true);
      setProgressStep("Analyzing screenshot layouts and context...");

      // Prepare screenshots payload
      const screenPayload = screens.map((screen, idx) => {
        // Find screenshot layer if any
        const sl = screen.layers.find((l) => l.type === "screenshot" || l.type === "image") as ScreenshotLayer | ImageLayer | undefined;
        return {
          index: idx,
          base64: sl?.src && sl.src.startsWith("data:") ? sl.src : undefined,
          name: screen.name || `Screen ${idx + 1}`,
        };
      });

      const idToken = user ? await user.getIdToken().catch(() => "") : "";
      const res = await fetch("/api/ai/vision-screens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          screens: screenPayload,
          appName: activeSet.name || "Mobile App",
          niche: niche || "Productivity / Lifestyle App",
          language: activeLang || "en",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "AI generation failed");
      }

      const generatedStories = data.screens || [];
      setProgressStep("Applying high-conversion typography & color palettes...");

      // Apply results to active set screens
      screens.forEach((screen, idx) => {
        const story = generatedStories.find((g: any) => g.index === idx) || generatedStories[idx];
        if (!story) return;

        // 1. Update background if requested
        if (applyGradients && story.recommendedGradient) {
          updateScreenBackground(activeSet.id, screen.id, {
            type: "gradient",
            gradient: story.recommendedGradient,
          });
        }

        // 2. Find or create Headline & Subcaption text layers
        const textLayers = screen.layers.filter((l): l is TextLayer => l.type === "text");
        const headlineLayer = textLayers[0];
        const subcaptionLayer = textLayers[1];

        const screenW = screen.width || 1290;
        const screenH = screen.height || 2796;

        if (headlineLayer) {
          updateLayer(activeSet.id, screen.id, headlineLayer.id, {
            content: story.headline,
            fontSize: Math.round(screenW * 0.058),
            fontWeight: 800,
            align: "center",
          });
        } else {
          // Create headline
          addLayer(activeSet.id, screen.id, {
            type: "text",
            x: Math.round(screenW * 0.08),
            y: Math.round(screenH * 0.07),
            width: Math.round(screenW * 0.84),
            height: Math.round(screenH * 0.1),
            rotation: 0,
            opacity: 1,
            content: story.headline,
            fontSize: Math.round(screenW * 0.058),
            fontWeight: 800,
            fontFamily: "Inter",
            color: "#ffffff",
            align: "center",
            lineHeight: 1.15,
            letterSpacing: -0.5,
          } as Omit<TextLayer, "id">);
        }

        if (subcaptionLayer) {
          updateLayer(activeSet.id, screen.id, subcaptionLayer.id, {
            content: story.subcaption,
            fontSize: Math.round(screenW * 0.034),
            fontWeight: 500,
            align: "center",
            opacity: 0.85,
          });
        } else {
          // Create subcaption
          addLayer(activeSet.id, screen.id, {
            type: "text",
            x: Math.round(screenW * 0.1),
            y: Math.round(screenH * 0.16),
            width: Math.round(screenW * 0.8),
            height: Math.round(screenH * 0.06),
            rotation: 0,
            opacity: 0.85,
            content: story.subcaption,
            fontSize: Math.round(screenW * 0.034),
            fontWeight: 500,
            fontFamily: "Inter",
            color: "#ffffff",
            align: "center",
            lineHeight: 1.25,
            letterSpacing: 0,
          } as Omit<TextLayer, "id">);
        }
      });

      useEditorStore.getState().recordHistory();
      toast.success("AI Auto-Pilot successfully generated your App Store presentation!");
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to run AI Auto-Pilot");
    } finally {
      setIsProcessing(false);
      setProgressStep("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-autopilot-title"
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h2 id="ai-autopilot-title" className="font-bold text-sm sm:text-base text-foreground truncate">
                  AI Project Auto-Pilot
                </h2>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  VISION + ASO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                1-Click complete transformation: Headlines, Subtitles &amp; Palettes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isGuest && (
              <span
                className={cn(
                  "text-[10.5px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 flex items-center gap-1 shadow-2xs select-none",
                  isPro
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold"
                    : "bg-secondary/90 text-foreground border-border/70"
                )}
              >
                {isPro ? (
                  <>
                    <span className="text-xs">👑</span>
                    <span>Pro Unlimited</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-500 dark:text-amber-400 text-xs">⚡</span>
                    <span className="font-bold text-foreground font-mono">{aiCredits} / 3</span>
                    <span className="text-muted-foreground font-normal">Credits</span>
                  </>
                )}
              </span>
            )}
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close AI Auto-Pilot dialog"
              className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isGuest ? (
          <div className="p-7 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">Registered Feature Only</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                AI Auto-Pilot analyzes your screenshots using vision AI and automatically crafts high-converting App Store copy, colors, and headlines. Sign in with Google or GitHub (100% Free) to unlock.
              </p>
            </div>
            <div className="flex gap-2.5 pt-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setAuthModalOpen(true);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign In (Free)</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4.5">
            {/* Niche Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🎯</span> App Category / Niche (Optional)
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., AI Photo Editor, Fitness Tracker, Crypto Wallet..."
                className="w-full h-9 px-3 text-xs bg-secondary/60 border border-border/60 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>🪄</span> Marketing Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "high-energy", label: "🚀 High Energy", desc: "Bold & inspiring" },
                  { id: "minimalist", label: "✨ Minimalist", desc: "Short & punchy" },
                  { id: "benefit-driven", label: "🎯 Benefit Driven", desc: "Problem solver" },
                  { id: "fomo", label: "🔥 Social / FOMO", desc: "Community hype" },
                  { id: "b2b", label: "💼 B2B Enterprise", desc: "Professional trust" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetTone(t.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      targetTone === t.id
                        ? "bg-indigo-500/15 border-indigo-500/50 text-foreground ring-1 ring-indigo-500/30"
                        : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs font-bold">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palettes Option */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors text-xs select-none">
              <input
                type="checkbox"
                checked={applyGradients}
                onChange={(e) => setApplyGradients(e.target.checked)}
                className="w-4 h-4 rounded-md accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto-match panoramic color gradients</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Generates harmonious multi-screen gradients matching your screenshot colors
                </p>
              </div>
            </label>

            {/* Target Set Info */}
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Target: <strong className="text-foreground">{activeSet.name}</strong> ({screens.length} screens)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border/50 text-foreground">
                {activeLang.toUpperCase()}
              </span>
            </div>

            {/* Progress Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-indigo-400" />
                <span>{progressStep}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRunAutoPilot}
                disabled={isProcessing || screens.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold gap-2 shadow-md shadow-indigo-500/25 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate All {screens.length} Screens</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
