"use client";

import { useEffect, use, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store/projectStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { useEditorStore } from "@/lib/store/editorStore";
import { useAuthStore } from "@/lib/store/authStore";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { TextLayer } from "@/lib/types";

interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

/** Generates a small thumbnail for the project from the first screen */
function generateThumbnail(screenSets: ReturnType<typeof useEditorStore.getState>["screenSets"]): string | null {
  if (typeof window === "undefined") return null;
  const firstScreen = screenSets[0]?.screens[0];
  if (!firstScreen) return null;

  const W = 270, H = 480;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = firstScreen.background;
  const scale = W / firstScreen.width;

  // Draw background
  if (bg?.type === "solid" && bg.color) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, W, H);
  } else if (bg?.type === "gradient" && bg.gradient) {
    const dirs: Record<string, [number, number, number, number]> = {
      "to-b":  [0, 0, 0, H], "to-r": [0, 0, W, 0],
      "to-br": [0, 0, W, H], "to-bl": [W, 0, 0, H],
      "to-tr": [0, H, W, 0], "to-tl": [W, H, 0, 0],
    };
    const [x0, y0, x1, y1] = dirs[bg.gradient.direction] ?? [0, 0, 0, H];
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of bg.gradient.stops) {
      grad.addColorStop(stop.position / 100, stop.color);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, W, H);
  }

  // Draw text layers
  for (const layer of firstScreen.layers) {
    if (layer.type !== "text") continue;
    const tl = layer as TextLayer;
    ctx.save();
    ctx.globalAlpha = tl.opacity ?? 1;
    const fs = Math.max(6, tl.fontSize * scale);
    ctx.font = `${tl.fontWeight} ${fs}px "${tl.fontFamily}", sans-serif`;
    ctx.fillStyle = tl.color;
    ctx.textAlign = tl.align as CanvasTextAlign;
    const lines = tl.content.split("\n");
    const lineH = fs * (tl.lineHeight ?? 1.25);
    const xPos = tl.align === "center"
      ? tl.x * scale + (tl.width * scale) / 2
      : tl.align === "right" ? tl.x * scale + tl.width * scale
      : tl.x * scale;
    lines.forEach((line, i) => {
      ctx.fillText(line, xPos, tl.y * scale + fs + i * lineH);
    });
    ctx.restore();
  }

  return canvas.toDataURL("image/webp", 0.7);
}

const emptySubscribe = () => () => {};

export default function EditorPage({ params }: EditorPageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { user, isInitialized, setAuthModalOpen } = useAuthStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const getProject = useProjectStore((s) => s.getProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const saveProjectThumbnail = useProjectStore((s) => s.saveProjectThumbnail);
  const { loadProject, screenSets, hiddenScreenSets, themeId, projectId: editorProjectId } = useEditorStore();
  const { projectLanguages, setProjectLanguages } = useLanguageStore();

  // Redirect unauthenticated users immediately
  useEffect(() => {
    if (mounted && isInitialized && !user) {
      router.replace("/");
      setAuthModalOpen(true);
    }
  }, [mounted, isInitialized, user, router, setAuthModalOpen]);

  useEffect(() => {
    if (!mounted || !isInitialized || !user) return;

    const project = getProject(projectId);
    if (!project) {
      router.replace("/");
      return;
    }
    loadProject(projectId, project.themeId, project.screenSets, project.hiddenScreenSets);
    if (project.languages && project.languages.length > 0) {
      setProjectLanguages(project.languages);
    }
  }, [projectId, mounted, isInitialized, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save projectLanguages back to project store
  useEffect(() => {
    if (editorProjectId === projectId) {
      updateProject(projectId, { languages: projectLanguages });
    }
  }, [projectLanguages, projectId, editorProjectId, updateProject]);

  // Auto-save screenSets back to project store (debounced — fires 1s after last change)
  useEffect(() => {
    if (screenSets.length > 0 && editorProjectId === projectId) {
      const timer = setTimeout(() => {
        updateProject(projectId, { screenSets, hiddenScreenSets, themeId });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screenSets, hiddenScreenSets, themeId, projectId, editorProjectId, updateProject]);


  // Auto-save thumbnail (debounced — fires 2s after last change)
  useEffect(() => {
    if (screenSets.length === 0) return;
    const timer = setTimeout(() => {
      const thumb = generateThumbnail(screenSets);
      if (thumb) saveProjectThumbnail(projectId, thumb);
    }, 2000);
    return () => clearTimeout(timer);
  }, [screenSets, projectId, saveProjectThumbnail]);

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center shadow-lg">
          <SnapFrameLogo size={32} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading SnapFrame Editor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-4 shadow-xl">
          <SnapFrameLogo size={36} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
        <p className="text-xs text-muted-foreground max-w-xs mb-6">
          Please sign in to access the screenshot editor and manage your projects.
        </p>
        <button
          type="button"
          onClick={() => {
            router.replace("/");
            setAuthModalOpen(true);
          }}
          className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/20"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary name="Editor">
      <EditorLayout projectId={projectId} />
    </ErrorBoundary>
  );
}
