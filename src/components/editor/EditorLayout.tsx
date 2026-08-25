"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Undo2,
  Redo2,
  Keyboard,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Copy,
  Folder,
  Edit2,
  Loader2,
  Cloud,
  Check,
  Lightbulb,
  Download,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/lib/store/toastStore";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/lib/store/editorStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { HorizontalCanvas } from "@/components/editor/HorizontalCanvas";
import { ScreenStrip } from "@/components/editor/ScreenStrip";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { CanvasBackgroundSelector } from "@/components/editor/CanvasBackgroundSelector";
import { ExportModal } from "@/components/editor/ExportModal";
import { GifExportModal } from "@/components/editor/GifExportModal";
import { StoreAssetsStudioModal } from "@/components/editor/StoreAssetsStudioModal";
import { StorePreviewModal } from "@/components/editor/StorePreviewModal";
import { AIAutoPilotModal } from "@/components/editor/AIAutoPilotModal";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { QuickTipsModal } from "@/components/editor/QuickTipsModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn, drawBackgroundToCanvas } from "@/lib/utils";

interface EditorLayoutProps {
  projectId: string;
}


// Simple icon button — avoids nested <button> hydration warnings
function IconBtn({
  onClick,
  disabled,
  title,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function EditorLayout({ projectId }: EditorLayoutProps) {
  const project = useProjectStore((s) => s.getProject(projectId));
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);
  const {
    zoom, setZoom, undo, redo, canUndo, canRedo,
    activeSetId, activeScreenId, activeLayerId, getActiveSet,
    getActiveScreen, getActiveLayer, deleteLayer, duplicateLayer,
    updateLayer, setActiveLayer, addLayer,

  } = useEditorStore();
  const saveProjectThumbnail = useProjectStore((s) => s.saveProjectThumbnail);
  const screenSets = useEditorStore((s) => s.screenSets);
  const [showExport, setShowExport] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showAssetsStudio, setShowAssetsStudio] = useState(false);
  const [showStorePreview, setShowStorePreview] = useState(false);
  const [showAIAutoPilot, setShowAIAutoPilot] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTips, setShowTips] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return !localStorage.getItem("sf_seen_quick_tips");
      } catch {
        return false;
      }
    }
    return false;
  });
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [localName, setLocalName] = useState(project?.name ?? "");
  const [prevProjectName, setPrevProjectName] = useState(project?.name);
  if (project?.name !== prevProjectName) {
    setPrevProjectName(project?.name);
    setLocalName(project?.name ?? "");
  }

  const [zoomOpen, setZoomOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const thumbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const handleNameChange = (val: string) => {
    setLocalName(val);
    if (project) {
      setSaveStatus("saving");
      if (renameTimerRef.current) clearTimeout(renameTimerRef.current);
      renameTimerRef.current = setTimeout(() => {
        useProjectStore.getState().updateProject(project.id, { name: val });
        setSaveStatus("saved");
      }, 500);
    }
  };

  const handleNameBlur = () => {
    if (renameTimerRef.current) clearTimeout(renameTimerRef.current);
    if (project && localName !== project.name) {
      useProjectStore.getState().updateProject(project.id, { name: localName });
    }
    setSaveStatus("saved");
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (renameTimerRef.current) clearTimeout(renameTimerRef.current);
      if (thumbTimerRef.current) clearTimeout(thumbTimerRef.current);
    };
  }, []);

  // ── Dynamic save status listener (1s debounce) ───────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const startTimer = setTimeout(() => {
      setSaveStatus("saving");
    }, 0);
    const saveTimer = setTimeout(() => {
      setSaveStatus("saved");
    }, 1100);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(saveTimer);
    };
  }, [screenSets]);


  const handleForceSave = () => {
    if (project) {
      useProjectStore.getState().updateProject(project.id, {
        screenSets,
        hiddenScreenSets: useEditorStore.getState().hiddenScreenSets,
        themeId: useEditorStore.getState().themeId,
      });
      setSaveStatus("saved");
      toast.success(isPro ? "☁️ Project saved and synced to Cloud!" : "💾 Project saved to local storage!");
    }
  };

  // ── Unsaved changes prompt on window navigation ──────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // ── Auto-save thumbnail (debounced, 3 s after last change) ────────────────
  const generateThumbnail = useCallback(async () => {
    const firstSet = screenSets[0];
    if (!firstSet || firstSet.screens.length === 0) return;
    const firstScreen = firstSet.screens[0];
    const SCALE = 0.15;
    const W = Math.round(firstScreen.width * SCALE);
    const H = Math.round(firstScreen.height * SCALE);
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(SCALE, SCALE);
    // Draw solid / gradient / mesh background
    const bg = firstScreen.background;
    drawBackgroundToCanvas(ctx, bg, firstScreen.width, firstScreen.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    saveProjectThumbnail(projectId, dataUrl);
  }, [screenSets, projectId, saveProjectThumbnail]);

  useEffect(() => {
    if (thumbTimerRef.current) clearTimeout(thumbTimerRef.current);
    thumbTimerRef.current = setTimeout(generateThumbnail, 3000);
    return () => {
      if (thumbTimerRef.current) clearTimeout(thumbTimerRef.current);
    };
  }, [screenSets, generateThumbnail]);


  const activeSet = getActiveSet();

  // ── Quick copy active screen to clipboard ────────────────────────────────

  const handleCopyScreenToClipboard = async () => {
    try {
      setIsCopying(true);
      const targetSet = activeSet || screenSets[0];
      const targetScreen = targetSet?.screens.find((s) => s.id === activeScreenId) || targetSet?.screens[0];

      if (targetSet && targetScreen) {
        const targetIndex = targetSet.screens.findIndex((s) => s.id === targetScreen.id);
        if (targetIndex >= 3 && !isPro) {
          if (isGuest) {
            setAuthModalOpen(true);
            toast.info("Free tier can copy or export up to 3 screens. Sign in to upgrade to Pro for all 10 screens!");
          } else {
            setUpgradeModalOpen(true);
            toast.info("Copying screens beyond screen 3 requires SnapFrame Pro. Upgrade to unlock all 10 screens & master exports!");
          }
          return;
        }

        const offscreenCanvas = document.createElement("canvas");
        const { renderScreenToCanvas } = await import("@/lib/renderScreenToCanvas");
        const { useLanguageStore } = await import("@/lib/store/languageStore");
        const activeLang = useLanguageStore.getState().activeLang || "en";

        await renderScreenToCanvas(offscreenCanvas, targetScreen, targetSet, {
          scale: isPro ? 2 : 1,
          activeLang,
          isExport: true,
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          offscreenCanvas.toBlob(resolve, "image/png", 1)
        );

        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast.success("Active screen copied to clipboard as PNG!");
          return;
        }
      }

      // Fallback: Find current active screen card's canvas in DOM
      const activeCanvas = document.querySelector(".canvas-active canvas") as HTMLCanvasElement || document.querySelector("canvas") as HTMLCanvasElement;
      if (!activeCanvas) {
        toast.error("No active screen found to copy.");
        return;
      }

      activeCanvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image.");
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          toast.success("Active screen copied to clipboard as PNG!");
        } catch {
          toast.error("Clipboard copy not permitted by browser.");
        }
      }, "image/png");
    } catch {
      toast.error("Failed to copy image to clipboard.");
    } finally {
      setIsCopying(false);
    }
  };

  // ── Global keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && activeLayerId) {
        const set = getActiveSet();
        const screen = getActiveScreen();
        if (set && screen) {
          deleteLayer(set.id, screen.id, activeLayerId);
          setActiveLayer(null);
        }
      }
      if (e.key === "Escape") {
        useEditorStore.getState().clearAllSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && activeLayerId) {
        e.preventDefault();
        const set = getActiveSet();
        const screen = getActiveScreen();
        if (set && screen) {
          duplicateLayer(set.id, screen.id, activeLayerId);
        }
      }
      // Arrow keys nudge selected layer (1px or 10px with Shift)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && activeLayerId) {
        e.preventDefault();
        const set = getActiveSet();
        const screen = getActiveScreen();
        const layer = getActiveLayer();
        if (set && screen && layer && !layer.locked) {
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          updateLayer(set.id, screen.id, activeLayerId, {
            x: Math.round(layer.x + dx),
            y: Math.round(layer.y + dy),
          });
          useEditorStore.getState().recordHistory();
        }
      }
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoom(Math.min(2.0, zoom + 0.1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom(Math.max(0.2, zoom - 0.1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(0.65);
      }
      if (e.key === "?" || ((e.ctrlKey || e.metaKey) && e.key === "/")) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }

      // ── Tool Shortcuts (V, T, S, M) when no modifier is pressed ──
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "v" || e.key === "V") {
          useEditorStore.getState().clearAllSelection();
        } else if (e.key === "t" || e.key === "T") {
          const set = getActiveSet();
          const screen = getActiveScreen();
          if (set && screen) {
            e.preventDefault();
            addLayer(set.id, screen.id, {
              type: "text",
              content: "Your Text Here",
              x: Math.round(screen.width / 2 - 300),
              y: Math.round(screen.height / 4),
              width: 600,
              height: 120,
              fontSize: 80,
              fontFamily: "Inter",
              fontWeight: 700,
              color: "#ffffff",
              align: "center",
              lineHeight: 1.2,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
            } as any);
            useEditorStore.getState().recordHistory();
            toast.success("Added text layer");
          }
        } else if (e.key === "s" || e.key === "S") {
          const set = getActiveSet();
          const screen = getActiveScreen();
          if (set && screen) {
            e.preventDefault();
            addLayer(set.id, screen.id, {
              type: "shape",
              shape: "rounded-rectangle",
              x: Math.round(screen.width / 2 - 150),
              y: Math.round(screen.height / 2 - 80),
              width: 300,
              height: 160,
              fill: "#6366f1",
              cornerRadius: 24,
              rotation: 0,
              opacity: 1,
            } as any);
            useEditorStore.getState().recordHistory();
            toast.success("Added shape layer");
          }
        } else if (e.key === "m" || e.key === "M") {
          const set = getActiveSet();
          const screen = getActiveScreen();
          if (set && screen) {
            e.preventDefault();
            addLayer(set.id, screen.id, {
              type: "screenshot",
              x: Math.round(screen.width / 2 - 500),
              y: Math.round(screen.height / 2 - 900),
              width: 1000,
              height: 1800,
              rotation: 0,
              opacity: 1,
              objectFit: "cover",
              cornerRadius: 55,
              showDeviceFrame: true,
              label: "Drop your screenshot here",
            } as any);
            useEditorStore.getState().recordHistory();
            toast.success("Added device mockup layer");
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoom, activeLayerId, activeSetId, activeScreenId, undo, redo, setZoom, deleteLayer, duplicateLayer, updateLayer, setActiveLayer, addLayer, getActiveSet, getActiveLayer, getActiveScreen]);



  // ── Global Clipboard Paste (Ctrl+V image screenshot) ─────────────────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) return;

            const set = getActiveSet() || screenSets[0];
            if (!set || set.screens.length === 0) return;

            const screen = set.screens.find((s) => s.id === activeScreenId) || set.screens[0];
            if (!screen) return;

            // Find existing screenshot/device frame layer or image layer
            const existingScreenshot = screen.layers.find((l) => l.type === "screenshot");
            if (existingScreenshot) {
              useEditorStore.getState().recordHistory();
              updateLayer(set.id, screen.id, existingScreenshot.id, { src: dataUrl });
              toast.success("📸 Screenshot inserted into device frame!");
            } else {
              const img = new Image();
              img.onload = () => {
                const maxW = Math.round(screen.width * 0.8);
                const maxH = Math.round(screen.height * 0.8);
                let w = img.naturalWidth || 600;
                let h = img.naturalHeight || 800;

                if (w > maxW || h > maxH) {
                  const scale = Math.min(maxW / w, maxH / h);
                  w = Math.round(w * scale);
                  h = Math.round(h * scale);
                }

                useEditorStore.getState().recordHistory();
                addLayer(set.id, screen.id, {
                  type: "image",
                  src: dataUrl,
                  x: Math.round((screen.width - w) / 2),
                  y: Math.round((screen.height - h) / 2),
                  width: w,
                  height: h,
                  rotation: 0,
                  opacity: 1,
                  cornerRadius: 16,
                });
                toast.success("🖼️ Image pasted onto canvas!");
              };
              img.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [screenSets, activeScreenId, getActiveSet, updateLayer, addLayer]);

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden select-none">
      {/* ── Top Navigation Bar ── */}
      <header className="h-11 border-b border-border/50 bg-card/90 backdrop-blur-md flex items-center px-3 gap-2 shrink-0 z-40 justify-between">
        <div className="flex items-center gap-2">
          {/* Back to Dashboard & Logo */}
          <Link
            href="/projects"
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-secondary transition-colors group cursor-pointer"
            title="Back to Projects (Esc)"
          >
            <SnapFrameLogo size={24} />
          </Link>

          <Separator orientation="vertical" className="h-4" />

          {/* Breadcrumb & Project Name Inline Editor */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/projects"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <Folder className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>Projects</span>
            </Link>
            <span className="text-muted-foreground/40 text-xs hidden sm:inline">/</span>

            <div className="relative flex items-center group">
              <input
                type="text"
                value={localName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-32 sm:max-w-52 bg-transparent border border-transparent hover:border-border/60 focus:border-primary/60 outline-none focus:ring-1 focus:ring-primary/40 px-2 py-0.5 rounded-lg transition-all hover:bg-secondary/40 text-foreground"
                placeholder="Untitled Project"
                spellCheck={false}
                title="Click to rename project (Enter to confirm)"
              />
              <Edit2 className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 pointer-events-none" />
            </div>

            {/* Dynamic Real-Time Save State Badge */}
            <button
              type="button"
              onClick={handleForceSave}
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-300 cursor-pointer select-none",
                saveStatus === "saving"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
              )}
              title={saveStatus === "saving" ? (isPro ? "Syncing changes to cloud..." : "Saving changes locally...") : isPro ? "Cloud Synced (Click to force sync)" : "Saved locally on device (Click to force save)"}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>{isPro ? "Syncing..." : "Saving..."}</span>
                </>
              ) : isPro ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span>Cloud Synced</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Saved locally</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center Actions / Undo / Redo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-lg border border-border/40">
            <IconBtn title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo()}>
              <Undo2 className="w-3.5 h-3.5" />
            </IconBtn>
            <IconBtn title="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo()}>
              <Redo2 className="w-3.5 h-3.5" />
            </IconBtn>
          </div>
        </div>

        {/* Right Tools: Zoom, Copy, Tips, Shortcuts, Theme, Export */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Popover */}
          <Popover open={zoomOpen} onOpenChange={setZoomOpen}>
            <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5 border border-border/40">
              <IconBtn title="Zoom Out (Ctrl+-)" onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}>
                <ZoomOut className="w-3.5 h-3.5" />
              </IconBtn>
              
              <PopoverTrigger className="text-xs font-mono font-medium text-foreground hover:bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors outline-none">
                <span>{Math.round(zoom * 100)}%</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground opacity-60" />
              </PopoverTrigger>

              <IconBtn title="Zoom In (Ctrl+=)" onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}>
                <ZoomIn className="w-3.5 h-3.5" />
              </IconBtn>
            </div>

            <PopoverContent align="center" className="w-40 p-1.5 text-xs shadow-xl border border-border/70 rounded-xl">
              <div className="space-y-0.5">
                {[
                  { label: "Fit to View", value: 0.65, shortcut: "Ctrl+0" },
                  { label: "50%", value: 0.5 },
                  { label: "75%", value: 0.75 },
                  { label: "100%", value: 1.0, shortcut: "1:1" },
                  { label: "125%", value: 1.25 },
                  { label: "150%", value: 1.5 },
                  { label: "200%", value: 2.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setZoom(opt.value);
                      setZoomOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors font-medium",
                      Math.abs(zoom - opt.value) < 0.04
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-secondary text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.shortcut && (
                      <span className="text-[10px] opacity-70 font-mono">{opt.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Canvas Background Pattern Selector */}
          <CanvasBackgroundSelector />

          <Separator orientation="vertical" className="h-4" />

          {/* Quick Copy Screen to Clipboard */}
          <button
            type="button"
            onClick={handleCopyScreenToClipboard}
            disabled={isCopying || !activeScreenId}
            className={cn(
              "h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium border border-border/40 transition-colors",
              activeScreenId && !isCopying
                ? "text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                : "opacity-40 cursor-not-allowed text-muted-foreground bg-secondary/20"
            )}
            title={activeScreenId ? "Copy active screen to clipboard (PNG)" : "Select a screen on canvas to copy"}
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span className="show-under-1200">Screen</span>
            <span className="show-from-1200">Copy Screen</span>
          </button>

          {/* Quick Tips / Onboarding button */}
          <button
            type="button"
            onClick={() => setShowTips(true)}
            className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-colors cursor-pointer shadow-2xs"
            title="Quick Tips & Guide"
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span className="show-from-1200">Tips</span>
          </button>

          {/* Keyboard shortcuts */}
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          <Separator orientation="vertical" className="h-4" />

          {/* User Profile / Auth (Positioned directly before Export) */}
          <UserMenu />

          {/* Export Button */}
          <button
            id="export-btn"
            type="button"
            onClick={() => setShowExport(true)}
            className="h-7 flex items-center gap-1.5 px-2.5 min-[1000px]:px-3.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/30 active:scale-95 cursor-pointer"
            title="Export Screenshots (PNG, 4K Lossless, ZIP)"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="show-from-1000">Export</span>
          </button>
        </div>
      </header>

      {/* ── Contextual Toolbar ── */}
      <div className="h-12 w-full shrink-0 bg-card/90 backdrop-blur-md border-b border-border/50 z-30">
        {(activeLayerId || activeScreenId) && <FloatingToolbar />}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar + slide-out panels & studio launchers */}
        <EditorSidebar
          onOpenAIAutoPilot={() => {
            if (isGuest) {
              setAuthModalOpen(true);
              toast.info("AI Auto-Pilot is for registered accounts. Sign in with Google or GitHub (100% Free) to unlock.");
              return;
            }
            setShowAIAutoPilot(true);
          }}
          onOpenStorePreview={() => {
            if (isGuest) {
              setAuthModalOpen(true);
              toast.info("Live Store Listing Simulator requires a free account. Sign in with Google or GitHub (100% Free) to unlock.");
              return;
            }
            setShowStorePreview(true);
          }}
          onOpenAssetsStudio={() => {
            if (isGuest) {
              setAuthModalOpen(true);
              toast.info("Store Assets Studio requires a free account. Sign in with Google or GitHub (100% Free) to unlock.");
              return;
            }
            setShowAssetsStudio(true);
          }}
          onOpenGif={() => {
            if (isGuest) {
              setAuthModalOpen(true);
              toast.info("Video & Animated GIF Studio requires a free account. Sign in with Google or GitHub (100% Free) to unlock.");
              return;
            }
            setShowGif(true);
          }}
        />

        {/* Main canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ErrorBoundary name="EditorCanvas">
            <HorizontalCanvas />
          </ErrorBoundary>
          {/* Bottom strip: quick screen navigation */}
          <ScreenStrip />
        </div>
      </div>

      {/* Store Assets Studio Modal */}
      {showAssetsStudio && (
        <StoreAssetsStudioModal
          open={showAssetsStudio}
          onClose={() => setShowAssetsStudio(false)}
        />
      )}

      {/* AI Auto-Pilot Modal */}
      {showAIAutoPilot && (
        <AIAutoPilotModal
          open={showAIAutoPilot}
          onOpenChange={setShowAIAutoPilot}
        />
      )}
      {/* Store Preview simulator modal */}
      {showStorePreview && (
        <StorePreviewModal
          open={showStorePreview}
          onOpenChange={setShowStorePreview}
          appName={project?.name || "My Awesome App"}
        />
      )}
      {/* Export modal */}
      {showExport && (
        <ExportModal
          projectId={projectId}
          onClose={() => setShowExport(false)}
          onOpenGifStudio={() => setShowGif(true)}
          onOpenAssetsStudio={() => setShowAssetsStudio(true)}
        />
      )}
      {showGif && (
        <GifExportModal projectId={projectId} onClose={() => setShowGif(false)} />
      )}
      {showShortcuts && (
        <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      )}
      {showTips && (
        <QuickTipsModal open={showTips} onClose={() => setShowTips(false)} />
      )}
      <AuthModal />
      <UpgradeModal />
    </div>
  );
}
