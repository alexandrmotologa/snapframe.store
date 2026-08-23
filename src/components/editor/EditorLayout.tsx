"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Sparkles,
  Film,
  Keyboard,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Copy,
  Download,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { StorePreviewModal } from "@/components/editor/StorePreviewModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { toast } from "@/lib/store/toastStore";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/lib/store/editorStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { HorizontalCanvas } from "@/components/editor/HorizontalCanvas";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { ScreenStrip } from "@/components/editor/ScreenStrip";
import { ExportModal } from "@/components/editor/ExportModal";
import { GifExportModal } from "@/components/editor/GifExportModal";
import { AIAutoPilotModal } from "@/components/editor/AIAutoPilotModal";
import { StoreAssetsStudioModal } from "@/components/editor/StoreAssetsStudioModal";
import { CanvasBackgroundSelector } from "@/components/editor/CanvasBackgroundSelector";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
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
  const router = useRouter();
  const project = useProjectStore((s) => s.getProject(projectId));
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);
  const {
    zoom, setZoom, undo, redo, canUndo, canRedo,
    activeSetId, activeScreenId, activeLayerId, getActiveSet,
    getActiveScreen, getActiveLayer, deleteLayer, duplicateLayer,
    updateLayer, setActiveLayer,
  } = useEditorStore();
  const saveProjectThumbnail = useProjectStore((s) => s.saveProjectThumbnail);
  const screenSets = useEditorStore((s) => s.screenSets);
  const [showExport, setShowExport] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showAssetsStudio, setShowAssetsStudio] = useState(false);
  const [showStorePreview, setShowStorePreview] = useState(false);
  const [showAIAutoPilot, setShowAIAutoPilot] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const thumbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const activeScreen = getActiveScreen();

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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoom, activeLayerId, activeSetId, activeScreenId, undo, redo, setZoom, deleteLayer, duplicateLayer, updateLayer, setActiveLayer, getActiveSet, getActiveScreen, getActiveLayer]);

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden select-none">
      {/* ── Top Navigation Bar ── */}
      <header className="h-11 border-b border-border/50 bg-card/90 backdrop-blur-md flex items-center px-3 gap-2 shrink-0 z-40 justify-between">
        <div className="flex items-center gap-2">
          {/* Back & Logo */}
          <Link
            href="/projects"
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-secondary transition-colors group cursor-pointer"
            title="Back to Projects (Esc)"
          >
            <SnapFrameLogo size={24} />
          </Link>

          <Separator orientation="vertical" className="h-4" />

          {/* Project name & Autosave Badge */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={project?.name ?? ""}
              onChange={(e) => {
                if (project) {
                  useProjectStore.getState().updateProject(project.id, { name: e.target.value });
                }
              }}
              className="text-sm font-semibold tracking-tight truncate max-w-44 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 px-1 py-0.5 rounded transition-all hover:bg-secondary/50"
              placeholder="Untitled Project"
              spellCheck={false}
            />
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Saved
            </span>
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

        {/* Right Tools: Zoom, Copy, Shortcuts, Theme, Export */}
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
          
          <HorizontalCanvas />
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
      <AuthModal />
      <UpgradeModal />
    </div>
  );
}
