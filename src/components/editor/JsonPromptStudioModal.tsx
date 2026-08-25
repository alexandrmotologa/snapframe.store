"use client";

import { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  X,
  AlertCircle,
  FileJson,
  Layers,
  Wand2,
  Crown,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEditorStore } from "@/lib/store/editorStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { downloadFileWithPicker } from "@/lib/utils/fileExport";
import { cn } from "@/lib/utils";

interface JsonPromptStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName?: string;
}

export function JsonPromptStudioModal({
  open,
  onOpenChange,
  appName = "SnapFrame App",
}: JsonPromptStudioModalProps) {
  const { screenSets, getActiveSet, updateScreenBackground, updateLayer, addLayer, updateMockup, updateScreen } =
    useEditorStore();
  const { isPro, setUpgradeModalOpen } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"prompt" | "import" | "export">("prompt");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // ── 1. Export Representation of Active ScreenSet ──
  const exportedJson = useMemo(() => {
    const set = getActiveSet() || screenSets[0];
    if (!set) return "{}";

    const exportData = {
      version: "1.2",
      schema: "https://snapframe.store/schemas/project-v1.json",
      appName,
      store: set.store,
      device: set.deviceId || set.mockup?.device || "iphone-17-pro-max",
      mockup: {
        device: set.deviceId || set.mockup?.device || "iphone-17-pro-max",
        color: set.mockup?.color || "black",
        frameType: set.mockup?.frameType || "3d",
        showFrame: set.mockup?.showFrame ?? true,
        showShadow: set.mockup?.showShadow ?? true,
      },
      screens: set.screens.map((screen, idx) => {
        const textLayers = screen.layers.filter((l) => l.type === "text") as import("@/lib/types").TextLayer[];
        const headline = textLayers[0]?.content || screen.name || `Feature ${idx + 1}`;
        const subheadline = textLayers[1]?.content || "";
        const shapeBadges = screen.layers
          .filter((l) => l.type === "shape" && (l as import("@/lib/types").ShapeLayer).text)
          .map((s) => (s as import("@/lib/types").ShapeLayer).text || "");

        return {
          screenIndex: idx + 1,
          caption: screen.caption || "",
          headline,
          subheadline: subheadline || undefined,
          badges: shapeBadges.length > 0 ? shapeBadges : undefined,
          background: screen.background,
        };
      }),
    };

    return JSON.stringify(exportData, null, 2);
  }, [screenSets, getActiveSet, appName]);

  // ── 2. AI Prompt Template (Prompt-to-Deck) ──
  const aiPrompt = useMemo(() => {
    return [
      `You are an expert App Store Marketing Copywriter & Conversion Rate Optimization (CRO) specialist.`,
      `Create a complete 5-screen marketing screenshot deck for my mobile app: "${appName}".`,
      ``,
      `Please output ONLY a valid JSON document conforming to the following SnapFrame schema:`,
      ``,
      `\`\`\`json`,
      `{`,
      `  "version": "1.2",`,
      `  "appName": "${appName}",`,
      `  "theme": {`,
      `    "name": "OLED Midnight & Electric Indigo",`,
      `    "backgroundType": "gradient",`,
      `    "gradient": {`,
      `      "direction": "to-br",`,
      `      "stops": [`,
      `        { "color": "#090a16", "position": 0 },`,
      `        { "color": "#4f46e5", "position": 100 }`,
      `      ]`,
      `    },`,
      `    "textColor": "#ffffff",`,
      `    "accentColor": "#818cf8"`,
      `  },`,
      `  "screens": [`,
      `    {`,
      `      "caption": "INTRODUCING ${appName.toUpperCase()}",`,
      `      "headline": "Punchy 3-5 Word Core Value Headline",`,
      `      "subheadline": "Benefit-driven subtitle that explains the killer feature",`,
      `      "badges": ["100% Offline", "No Subscription", "Instant Setup"]`,
      `    },`,
      `    {`,
      `      "caption": "POWERFUL ANALYTICS",`,
      `      "headline": "Real-Time Insights & Custom Dashboards",`,
      `      "subheadline": "Track your most critical metrics at a glance",`,
      `      "badges": ["Live Sync", "CSV Export", "Dark Mode"]`,
      `    },`,
      `    {`,
      `      "caption": "INTELLIGENT AUTOMATION",`,
      `      "headline": "Save 10+ Hours Every Single Week",`,
      `      "subheadline": "Automate routine actions with 1-click smart workflows",`,
      `      "badges": ["Zero Setup", "Cloud Backup", "Encrypted"]`,
      `    },`,
      `    {`,
      `      "caption": "COLLABORATION & SHARING",`,
      `      "headline": "Seamless Team Sync in Real Time",`,
      `      "subheadline": "Invite your team and share links in seconds",`,
      `      "badges": ["Multi-User", "Granular Roles", "Fastlane Ready"]`,
      `    },`,
      `    {`,
      `      "caption": "LOVED BY USERS",`,
      `      "headline": "Rated 4.9 Stars Across 10,000+ Reviews",`,
      `      "subheadline": "Join thousands of satisfied creators and developers",`,
      `      "badges": ["Top Rated", "App of the Day", "24/7 Support"]`,
      `    }`,
      `  ]`,
      `}`,
      `\`\`\``,
      ``,
      `Rules:`,
      `1. Make captions short and uppercase (2-4 words).`,
      `2. Keep headlines punchy, bold, and benefits-driven (under 40 characters).`,
      `3. Return ONLY valid JSON with no conversational text before or after.`,
    ].join("\n");
  }, [appName]);

  // ── Copy Handlers ──
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopiedPrompt(true);
      toast.success("AI Prompt copied to clipboard! Paste it into ChatGPT or Claude.");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopiedJson(true);
      toast.success("Project JSON copied to clipboard!");
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadJson = async () => {
    const blob = new Blob([exportedJson], { type: "application/json" });
    const filename = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-snapframe.json`;
    await downloadFileWithPicker(blob, filename);
    toast.success("JSON Project File downloaded!");
  };

  // ── 3. Import JSON Handler ──
  const handleApplyJson = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError("Please paste JSON content first.");
      return;
    }

    try {
      // Strip markdown code fences if user copied ```json ... ```
      let cleaned = importJsonText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim();
      }

      const data = JSON.parse(cleaned);
      const set = getActiveSet() || screenSets[0];
      if (!set) {
        setImportError("No active screen set found in project.");
        return;
      }

      // Check for screens or slides array
      const rawScreens: any[] = Array.isArray(data.screens)
        ? data.screens
        : Array.isArray(data.slides)
        ? data.slides
        : null;

      if (!rawScreens || rawScreens.length === 0) {
        setImportError('JSON must contain a "screens" or "slides" array.');
        return;
      }

      if (rawScreens.length > 3 && !isPro) {
        toast.info("Free accounts can import up to 3 screens. Upgrade to Pro for unlimited screens!");
      }

      const limit = isPro ? rawScreens.length : Math.min(rawScreens.length, 3);
      const targetScreens = set.screens.slice(0, limit);

      // Record undo state before applying
      useEditorStore.getState().recordHistory();

      // Apply theme/mockup if present
      if (data.mockup && typeof data.mockup === "object") {
        updateMockup(set.id, {
          ...set.mockup,
          ...data.mockup,
        });
      }

      // Apply global theme background if specified
      if (data.theme?.gradient) {
        targetScreens.forEach((scr) => {
          updateScreenBackground(set.id, scr.id, {
            type: "gradient",
            gradient: data.theme.gradient,
          });
        });
      } else if (data.theme?.background && typeof data.theme.background === "string") {
        const isGrad = data.theme.background.includes("gradient");
        targetScreens.forEach((scr) => {
          updateScreenBackground(set.id, scr.id, {
            type: isGrad ? "gradient" : "solid",
            color: isGrad ? undefined : data.theme.background,
          });
        });
      }

      // Update individual screen contents
      targetScreens.forEach((scr, idx) => {
        const item = rawScreens[idx];
        if (!item) return;

        const captionText = item.caption || item.eyebrow || "";
        const headlineText = item.headline || item.header || item.title || "";
        const subheadlineText = item.subheadline || item.subtitle || item.description || "";

        // Update screen name / caption
        if (captionText) {
          updateScreen(set.id, scr.id, { caption: captionText });
        }

        // Find or update text layers
        const textLayers = scr.layers.filter((l) => l.type === "text") as import("@/lib/types").TextLayer[];

        if (headlineText) {
          if (textLayers[0]) {
            updateLayer(set.id, scr.id, textLayers[0].id, {
              content: headlineText,
            });
          } else {
            addLayer(set.id, scr.id, {
              type: "text",
              content: headlineText,
              x: Math.round(scr.width * 0.1),
              y: Math.round(scr.height * 0.15),
              width: Math.round(scr.width * 0.8),
              height: 140,
              fontSize: 68,
              fontFamily: "Inter",
              fontWeight: 800,
              color: data.theme?.textColor || "#ffffff",
              align: "center",
              lineHeight: 1.15,
              letterSpacing: -0.5,
              rotation: 0,
              opacity: 1,
            } as any);
          }
        }

        if (subheadlineText && textLayers[1]) {
          updateLayer(set.id, scr.id, textLayers[1].id, {
            content: subheadlineText,
          });
        }

        // Update background per screen if specified
        if (item.background) {
          updateScreenBackground(set.id, scr.id, item.background);
        }
      });

      toast.success(`Successfully imported ${limit} screens from JSON!`);
      onOpenChange(false);
    } catch (e: any) {
      setImportError(`Invalid JSON format: ${e.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border/70 shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                JSON &amp; AI Prompt-to-Deck Studio
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Programmatically generate, import, or export multi-slide screenshot decks.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="px-6 pt-3 bg-secondary/20 border-b border-border/40">
            <TabsList className="bg-secondary/60 p-1 rounded-xl">
              <TabsTrigger value="prompt" className="flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Prompt Generator</span>
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-1.5 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-1.5 text-xs font-semibold">
                <FileJson className="w-3.5 h-3.5 text-purple-400" />
                <span>Export Schema</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab 1: AI Prompt Generator ── */}
          <TabsContent value="prompt" className="p-6 space-y-4 m-0">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Wand2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground">How Prompt-to-Deck works:</p>
                <p className="text-muted-foreground leading-relaxed">
                  1. Click <strong>Copy AI Prompt</strong> below.
                  <br />
                  2. Paste it into <strong>ChatGPT, Claude 3.7, or Gemini</strong>.
                  <br />
                  3. Copy the returned JSON code and paste it into the <strong>Import JSON</strong> tab to generate all your slides in seconds!
                </p>
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={aiPrompt}
                rows={12}
                className="w-full font-mono text-xs p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground/90 focus:outline-none resize-none selection:bg-indigo-500/30"
              />
              <Button
                type="button"
                onClick={handleCopyPrompt}
                size="sm"
                className="absolute top-3 right-3 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md font-semibold text-xs cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? "Copied to Clipboard!" : "Copy AI Prompt"}</span>
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab 2: Import JSON ── */}
          <TabsContent value="import" className="p-6 space-y-4 m-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Paste SnapFrame JSON from ChatGPT, Claude, or previous exports:
                </p>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Supports Undo/Redo (Ctrl+Z)
                </span>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  if (importError) setImportError(null);
                }}
                placeholder='{\n  "version": "1.2",\n  "screens": [\n    {\n      "caption": "FAST & SECURE",\n      "headline": "Track Your Progress Daily"\n    }\n  ]\n}'
                rows={12}
                className={cn(
                  "w-full font-mono text-xs p-3.5 rounded-xl bg-secondary/40 border text-foreground focus:outline-none resize-none selection:bg-emerald-500/30",
                  importError ? "border-destructive/80" : "border-border/60 focus:border-emerald-500/60"
                )}
              />

              {importError && (
                <div className="flex items-center gap-2 text-xs text-destructive p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApplyJson}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import &amp; Apply to Canvas</span>
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab 3: Export JSON ── */}
          <TabsContent value="export" className="p-6 space-y-4 m-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Current project screenshot deck serialized to structured JSON:
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyJson}
                  className="gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadJson}
                  className="gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </Button>
              </div>
            </div>

            <textarea
              readOnly
              value={exportedJson}
              rows={12}
              className="w-full font-mono text-xs p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground/90 focus:outline-none resize-none selection:bg-purple-500/30"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
