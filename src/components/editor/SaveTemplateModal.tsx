"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Sparkles, Layers, Check, Globe2, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { saveCustomTemplate, CustomTemplate } from "@/lib/customTemplates";
import { toast } from "@/lib/store/toastStore";
import { TemplateScreen } from "@/lib/types";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  screens: TemplateScreen[];
}

const CATEGORIES = [
  "Finance",
  "Health & Fitness",
  "Productivity",
  "Games",
  "Food & Drink",
  "Education",
  "Social & Lifestyle",
  "Travel",
  "SaaS & Tech",
];

export function SaveTemplateModal({ isOpen, onClose, screens }: SaveTemplateModalProps) {
  const { user, isPro, setUpgradeModalOpen } = useAuthStore();

  const [name, setName] = useState("My Custom Template");
  const [description, setDescription] = useState("Custom screenshot layout with customized typography, gradients, and 3D device frames.");
  const [category, setCategory] = useState("Productivity");
  const [tagsInput, setTagsInput] = useState("pro, clean, showcase");
  const [submitToCommunity, setSubmitToCommunity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    if (!isPro) {
      onClose();
      setUpgradeModalOpen(true);
      toast.info("Custom Template Presets require SnapFrame Pro. Upgrade to unlock!");
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Extract colors from first screen if available
      const firstScreen = screens[0];
      const bg = firstScreen?.background;
      let previewGradient: string[] = ["#1e1e24", "#0a0a0f"];
      let previewColor: string = "#6366f1";

      if (bg?.type === "gradient" && bg.gradient?.stops) {
        previewGradient = bg.gradient.stops.map((s) => s.color);
        previewColor = previewGradient[0] || "#6366f1";
      } else if (bg?.type === "solid" && bg.color) {
        previewColor = bg.color;
        previewGradient = [bg.color, "#0a0a0f"];
      }

      await saveCustomTemplate({
        userId: user?.uid || "guest",
        authorName: user?.displayName || (user?.email ? user.email.split("@")[0] : "Creator"),
        authorEmail: user?.email || undefined,
        name: name.trim(),
        description: description.trim(),
        category,
        tags,
        screens,
        previewGradient,
        previewColor,
        isPro: true,
        status: submitToCommunity ? "pending_review" : "private",
      });

      if (submitToCommunity) {
        toast.success("Preset saved & submitted to Community Gallery! It will appear publicly after review.");
      } else {
        toast.success("Custom Template Preset saved to your private library!");
      }
      onClose();
    } catch (err) {
      console.error("Error saving custom template:", err);
      toast.error("Failed to save template preset.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader className="p-5 sm:p-6 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-background border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>PRO EXCLUSIVE</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{screens.length} Screens</span>
          </div>

          <DialogTitle className="text-xl font-bold mt-2 text-foreground">Save as Custom Template</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Save your current project layout, device frames, 3D rotations, and color styling into a reusable preset.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Template Name */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Template Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fintech Obsidian Suite"
              className="h-9 text-xs bg-secondary/30 border-border/60"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Industry / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-secondary/30 border border-border/60 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-card text-foreground">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this template layout…"
              rows={2}
              className="text-xs bg-secondary/30 border-border/60 resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Tags (comma separated)
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="pro, clean, 3d-frames, dark-mode"
              className="h-9 text-xs bg-secondary/30 border-border/60"
            />
          </div>

          {/* Submit to Community Toggle */}
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Submit to Public Community Gallery</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Allow other creators worldwide to discover your preset on <span className="font-mono">/templates</span>. Your preset will be reviewed by our moderation team before going live.
              </p>
            </div>
            <input
              type="checkbox"
              checked={submitToCommunity}
              onChange={(e) => setSubmitToCommunity(e.target.checked)}
              className="w-4 h-4 mt-1 accent-indigo-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-card border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-semibold cursor-pointer">
            Cancel
          </Button>

          {!isPro ? (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                setUpgradeModalOpen(true);
              }}
              className="h-9 px-5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md cursor-pointer gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Unlock Custom Presets (Pro)</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="h-9 px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 cursor-pointer gap-1.5"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Template Preset</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
