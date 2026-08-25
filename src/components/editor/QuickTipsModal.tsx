"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Sparkles,

  Download,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Globe,
  Palette,
  MousePointerClick,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickTipsModalProps {
  open: boolean;
  onClose: () => void;
}

const TIPS_STEPS = [
  {
    id: "step-1",
    badge: "Step 1 of 3",
    title: "Multi-Platform Presets & Panoramic Flow",
    subtitle: "Design for iOS, iPadOS, Android & Tablets simultaneously",
    icon: Smartphone,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-500",
    features: [
      {
        icon: Smartphone,
        title: "Apple & Google Play Presets",
        desc: "Easily switch between iPhone 17 Pro, iPad Pro 13\", Pixel 10 Pro, and Galaxy Tab S10 Ultra in 1 click.",
      },
      {
        icon: Palette,
        title: "Panoramic Continuous Backgrounds",
        desc: "Connect multi-screen gradients, waves, or ultra-wide mesh backgrounds seamlessly across all screens in your set.",
      },
      {
        icon: Globe,
        title: "40+ Language Localizations",
        desc: "Manage localized screenshot sets in German, Spanish, French, Japanese, Romanian, and more from the Languages tab.",
      },
    ],
    highlight: "💡 Pro Tip: Use the Platforms tab on the left sidebar to add tablet or alternate store sets instantly!",
  },
  {
    id: "step-2",
    badge: "Step 2 of 3",
    title: "Mockups, 30+ UI Blocks & Drag-and-Drop",
    subtitle: "Add interactive badges, device frames & screenshot slots",
    icon: Layers,
    color: "from-purple-500/20 to-pink-500/20 text-purple-500",
    features: [
      {
        icon: MousePointerClick,
        title: "1-Click Screenshot Drops",
        desc: "Drag any image directly from your desktop onto the phone slot on canvas to populate it instantly.",
      },
      {
        icon: Zap,
        title: "Luxury 3D & Vector Frames",
        desc: "Customize frames with Titanium finishes, Clay, Glassmorphism, Neumorphism, and Dynamic Island widgets.",
      },
      {
        icon: CheckCircle2,
        title: "30+ Conversion Block Elements",
        desc: "Add iOS notification banners, 5-star ratings, 30-Day Guarantee seals, App Store award laurels, and streak cards.",
      },
    ],
    highlight: "💡 Pro Tip: Double-click any text layer to edit headlines inline, or press Shift+Click to multi-select layers.",
  },
  {
    id: "step-3",
    badge: "Step 3 of 3",
    title: "AI Vision Auto-Pilot & 4K Store Exports",
    subtitle: "Zero to finished App Store presentation in seconds",
    icon: Sparkles,
    color: "from-amber-500/20 to-orange-500/20 text-amber-500",
    features: [
      {
        icon: Sparkles,
        title: "AI Auto-Pilot Vision",
        desc: "Upload your raw app screenshots and let multimodal AI write benefit headlines and match aesthetic palettes automatically.",
      },
      {
        icon: Download,
        title: "Production 4K Lossless ZIP",
        desc: "Export organized folders ready for App Store Connect and Google Play Console with Fastlane text metadata.",
      },
      {
        icon: CheckCircle2,
        title: "1-Click Clipboard Copy",
        desc: "Click 'Copy Screen' in the top bar to instantly copy high-res PNGs to Figma, Slack, or Notion.",
      },
    ],
    highlight: "💡 Pro Tip: Press '?' anytime to open the full list of keyboard shortcuts (Ctrl+Z, Ctrl+D, Ctrl+0)!",
  },
];

export function QuickTipsModal({ open, onClose }: QuickTipsModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const step = TIPS_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        localStorage.setItem("sf_seen_quick_tips", "true");
      } catch {}
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < TIPS_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-3xl">
        {/* ── Top Header with Step Badge ── */}
        <div className="p-6 pr-14 pb-4 border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-2.5 mb-2">
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border/60 bg-background/80">
              {step.badge}
            </Badge>

            {/* Step indicator dots */}
            <div className="flex items-center gap-1.5">
              {TIPS_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentStep === idx
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  title={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 border border-white/10 shadow-sm`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                {step.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {step.subtitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Body: Features list with animation ── */}
        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {step.features.map((feat, i) => {
                const FeatIcon = feat.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/40 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-background border border-border/60 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <FeatIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Highlight callout */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/25 text-[11px] text-primary font-medium flex items-center gap-2">
                <span>{step.highlight}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer Controls ── */}
        <div className="p-4 px-6 border-t border-border/50 bg-secondary/20 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-border/80 text-primary focus:ring-primary/40"
            />
            <span>Don&apos;t show again</span>
          </label>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-8 rounded-xl text-xs gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 rounded-xl text-xs gap-1 font-semibold cursor-pointer shadow-sm"
            >
              {currentStep === TIPS_STEPS.length - 1 ? (
                <>
                  <span>Start Designing</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
