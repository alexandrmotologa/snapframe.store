"use client";

import { useState, useMemo, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Layers, Clock, Copy, Trash2, ArrowRight, Sparkles,
  Zap, Globe, Search, LayoutGrid, List, ArrowUpDown, Edit3,
  Smartphone, ExternalLink, MoreHorizontal, Calendar, X,
  ShieldAlert, Lock, Folder,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";
import { RenameProjectModal } from "@/components/dashboard/RenameProjectModal";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Project, Screen, ScreenSet, TextLayer, Background } from "@/lib/types";
import { ScreenThumbnailCanvas } from "@/components/editor/ScreenThumbnailCanvas";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConfirmActionModal } from "@/components/dashboard/ConfirmActionModal";
import { Footer } from "@/components/dashboard/Footer";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { BrandHeroIcon } from "@/components/ui/BrandHeroIcon";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { toast } from "@/lib/store/toastStore";

// ── Helper Utilities for Project Covers ───────────────────────────────────────

function getScreenBackgroundStyle(bg?: Background): { style: React.CSSProperties; glowColor: string } {
  if (!bg) return { style: { background: "#0f172a" }, glowColor: "rgba(99, 102, 241, 0.4)" };

  if (bg.type === "solid" && bg.color) {
    return {
      style: { backgroundColor: bg.color },
      glowColor: bg.color,
    };
  }

  if (bg.type === "gradient" && bg.gradient) {
    const dirMap: Record<string, string> = {
      "to-b": "to bottom",
      "to-r": "to right",
      "to-br": "to bottom right",
      "to-bl": "to bottom left",
      "to-tr": "to top right",
      "to-tl": "to top left",
    };
    const direction = dirMap[bg.gradient.direction] || "to bottom";
    const stops = bg.gradient.stops.map((s: { color: string; position: number }) => `${s.color} ${s.position}%`).join(", ");
    const gradientStr = `linear-gradient(${direction}, ${stops})`;
    const glow = bg.gradient.stops[0]?.color || "#6366f1";
    return {
      style: { backgroundImage: gradientStr },
      glowColor: glow,
    };
  }

  if (bg.type === "mesh" && bg.mesh) {
    return {
      style: {
        backgroundImage: `radial-gradient(at 0% 0%, ${bg.mesh.topLeft} 0px, transparent 50%), radial-gradient(at 100% 0%, ${bg.mesh.topRight} 0px, transparent 50%), radial-gradient(at 0% 100%, ${bg.mesh.bottomLeft} 0px, transparent 50%), radial-gradient(at 100% 100%, ${bg.mesh.bottomRight} 0px, transparent 50%)`,
        backgroundColor: bg.mesh.topLeft,
      },
      glowColor: bg.mesh.topLeft,
    };
  }

  if (bg.imageUrl) {
    return {
      style: {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      glowColor: "rgba(99, 102, 241, 0.3)",
    };
  }

  return { style: { background: "#0f172a" }, glowColor: "rgba(99, 102, 241, 0.3)" };
}

function getProjectHeadline(project: Project): string | null {
  for (const ss of project.screenSets) {
    for (const scr of ss.screens) {
      const textLayers = scr.layers.filter((l) => l.type === "text") as TextLayer[];
      for (const tl of textLayers) {
        const text = (tl.content || "").trim();
        if (text && text.length > 1) {
          const firstLine = text.split("\n")[0].trim();
          if (firstLine && firstLine.length > 1) return firstLine;
        }
      }
    }
  }
  return null;
}

function getProjectColorSwatches(project: Project): string[] {
  const colors = new Set<string>();
  for (const ss of project.screenSets) {
    for (const scr of ss.screens) {
      if (scr.background?.type === "solid" && scr.background.color) {
        colors.add(scr.background.color);
      } else if (scr.background?.type === "gradient" && scr.background.gradient) {
        for (const s of scr.background.gradient.stops) {
          colors.add(s.color);
        }
      } else if (scr.background?.type === "mesh" && scr.background.mesh) {
        colors.add(scr.background.mesh.topLeft);
        colors.add(scr.background.mesh.topRight);
      }
      if (colors.size >= 5) break;
    }
    if (colors.size >= 5) break;
  }
  return Array.from(colors).slice(0, 4);
}

function getProjectAppIcon(project: Project): { letter: string; gradient: string } {
  const letter = (project.name.trim().charAt(0) || "S").toUpperCase();
  const gradients = [
    "linear-gradient(135deg, #6366f1, #a855f7)",
    "linear-gradient(135deg, #3b82f6, #06b6d4)",
    "linear-gradient(135deg, #ec4899, #f43f5e)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #f59e0b, #d97706)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)",
    "linear-gradient(135deg, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #14b8a6, #3b82f6)",
  ];
  let hash = 0;
  for (let i = 0; i < project.id.length; i++) {
    hash = (hash << 5) - hash + project.id.charCodeAt(i);
    hash |= 0;
  }
  const gradIndex = Math.abs(hash) % gradients.length;
  return { letter, gradient: gradients[gradIndex] };
}

// ── Live Rendered Multi-Screen 3D Deck Showcase ───────────────────────────────
function ProjectCoverShowcase({
  project,
  previewIndex,
  onSelectPreview,
}: {
  project: Project;
  previewIndex: number;
  onSelectPreview: (idx: number) => void;
}) {
  const firstSet = project.screenSets[0];
  const screens = firstSet?.screens ?? [];
  const screen1 = screens[0];
  const screen2 = screens[1];
  const screen3 = screens[2];

  const activeScreen = screens[previewIndex] ?? screen1;
  const ambient = useMemo(() => getScreenBackgroundStyle(activeScreen?.background), [activeScreen]);
  const appIcon = useMemo(() => getProjectAppIcon(project), [project]);

  if (!screen1) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/40 p-4 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2 border border-white/20"
          style={{ background: appIcon.gradient }}
        >
          {appIcon.letter}
        </div>
        <p className="text-xs font-semibold text-foreground/80">Draft Project</p>
        <p className="text-[10px] text-muted-foreground">Click to start designing</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-hidden flex items-center justify-center select-none">
      {/* ── Dynamic Ambient Glow ── */}
      <div
        className="absolute inset-0 opacity-30 blur-2xl scale-125 transition-all duration-700 pointer-events-none"
        style={ambient.style}
      />
      {/* Subtle radial vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

      {/* ── 3D Screens Display Deck ── */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4">
        {screens.length >= 2 && previewIndex === 0 ? (
          /* Multi-Screen 3D Perspective Fan-out Stack */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Screen 3 (Deep Background, Far Right) */}
            {screen3 && (
              <div className="absolute right-[8%] top-[14%] w-[38%] aspect-[9/19.5] rounded-[13px] bg-slate-900 border border-white/10 shadow-xl overflow-hidden opacity-55 rotate-[11deg] scale-80 transition-transform duration-300 group-hover:rotate-[14deg] group-hover:translate-x-2">
                <ScreenThumbnailCanvas
                  screen={screen3}
                  screenSet={firstSet}
                  width={110}
                  height={238}
                />
              </div>
            )}

            {/* Screen 2 (Mid-ground, Slanted Right) */}
            <div className="absolute right-[16%] top-[10%] w-[42%] aspect-[9/19.5] rounded-[14px] bg-slate-900 border border-white/15 shadow-2xl overflow-hidden opacity-85 rotate-[6deg] scale-90 transition-transform duration-300 group-hover:rotate-[8deg] group-hover:translate-x-1">
              <ScreenThumbnailCanvas
                screen={screen2}
                screenSet={firstSet}
                width={125}
                height={270}
              />
            </div>

            {/* Screen 1 (Foreground Hero) */}
            <div className="relative z-10 w-[47%] aspect-[9/19.5] rounded-[16px] bg-slate-900 border border-white/25 shadow-2xl shadow-black/80 overflow-hidden -rotate-[2deg] transition-all duration-300 group-hover:rotate-0 group-hover:scale-105">
              {/* Dynamic Island Pill */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-1.5 rounded-full bg-black/90 z-20 pointer-events-none" />
              <ScreenThumbnailCanvas
                screen={screen1}
                screenSet={firstSet}
                width={140}
                height={303}
              />
            </div>
          </div>
        ) : (
          /* Single Focused Hero Screen (or user selected specific screen) */
          <div className="relative z-10 w-[48%] sm:w-[50%] aspect-[9/19.5] rounded-[16px] bg-slate-900 border border-white/25 shadow-2xl shadow-black/80 overflow-hidden transition-all duration-300 group-hover:scale-105">
            {/* Dynamic Island Pill */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-1.5 rounded-full bg-black/90 z-20 pointer-events-none" />
            <ScreenThumbnailCanvas
              screen={activeScreen}
              screenSet={firstSet}
              width={150}
              height={325}
            />
          </div>
        )}
      </div>

      {/* ── App Icon Monogram Badge (Bottom Left) ── */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-2">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-lg shadow-black/60 flex items-center justify-center font-bold text-white text-xs border border-white/25 backdrop-blur-md shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: appIcon.gradient }}
          title={project.name}
        >
          {appIcon.letter}
        </div>
      </div>

      {/* ── Hover Micro-Gallery Navigation Dots (Bottom Right) ── */}
      {screens.length > 1 && (
        <div
          className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 opacity-80 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {screens.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectPreview(idx);
              }}
              onMouseEnter={() => onSelectPreview(idx)}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                previewIndex === idx
                  ? "w-3.5 bg-primary shadow-xs shadow-primary/50"
                  : "w-1.5 bg-white/40 hover:bg-white/80"
              }`}
              title={`Preview Screen ${idx + 1}`}
            />
          ))}
          {screens.length > 5 && (
            <span className="text-[9px] text-white/60 font-mono pl-0.5">
              +{screens.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Project Card (Grid View) ──────────────────────────────────────────────────
function ProjectCard({
  project,
  onOpen,
  onDuplicate,
  onRename,
  onDelete,
  deleting,
}: {
  project: Project;
  onOpen: (id: string) => void;
  onDuplicate: (e: React.MouseEvent, id: string, name: string) => void;
  onRename: (e: React.MouseEvent, id: string, name: string) => void;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
  deleting: boolean;
}) {
  const [previewIndex, setPreviewIndex] = useState(0);

  const totalScreens = project.screenSets.reduce((acc, ss) => acc + ss.screens.length, 0);
  const platforms = Array.from(new Set(project.screenSets.map((ss) => ss.store)));
  const primaryPreset = project.screenSets[0]?.preset?.name || "App Store";
  const headline = useMemo(() => getProjectHeadline(project), [project]);
  const swatches = useMemo(() => getProjectColorSwatches(project), [project]);
  const langCount = project.languages?.length || 1;

  return (
    <div
      onClick={() => onOpen(project.id)}
      className={`group relative flex flex-col rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-xs hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden ${
        deleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* ── Visual Showcase Preview Window ── */}
      <div className="relative aspect-[16/11] sm:aspect-[4/3] bg-muted/40 overflow-hidden flex items-center justify-center border-b border-border/50">
        <ProjectCoverShowcase
          project={project}
          previewIndex={previewIndex}
          onSelectPreview={setPreviewIndex}
        />

        {/* Store / Platform Badges (Top Left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20 pointer-events-none">
          {platforms.map((store) => (
            <span
              key={store}
              className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider flex items-center gap-1 border border-white/15 shadow-sm"
            >
              {store === "ios" ? "🍎 iOS" : "▶ Android"}
            </span>
          ))}
        </div>

        {/* Screen Count Badge (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-20 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white/90 text-[10px] font-medium border border-white/15 flex items-center gap-1 shadow-sm">
            <Smartphone className="w-3 h-3 text-primary" />
            {totalScreens} screen{totalScreens !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Hover Quick Action Buttons (Top Right) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30">
          <button
            type="button"
            onClick={(e) => onRename(e, project.id, project.name)}
            className="w-7 h-7 rounded-lg bg-black/75 backdrop-blur-md hover:bg-black/95 flex items-center justify-center text-white/90 hover:text-white transition-colors border border-white/20 cursor-pointer shadow-md"
            title="Rename Project"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDuplicate(e, project.id, project.name)}
            className="w-7 h-7 rounded-lg bg-black/75 backdrop-blur-md hover:bg-black/95 flex items-center justify-center text-white/90 hover:text-white transition-colors border border-white/20 cursor-pointer shadow-md"
            title="Duplicate Project"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onDelete(e, project.id, project.name)}
            className="w-7 h-7 rounded-lg bg-black/75 backdrop-blur-md hover:bg-destructive flex items-center justify-center text-white/90 hover:text-white transition-colors border border-white/20 cursor-pointer shadow-md"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Open Editor Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xl shadow-primary/40 translate-y-2 group-hover:translate-y-0 transition-transform duration-200 pointer-events-auto">
            Open Editor
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ── Information Card Body ── */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Title & Language Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug"
              title={project.name}
            >
              {project.name}
            </h3>
            {langCount > 1 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium gap-0.5 shrink-0 border-border/80">
                <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                {langCount} langs
              </Badge>
            )}
          </div>

          {/* Headline Snippet Teaser */}
          {headline ? (
            <p className="text-xs text-muted-foreground line-clamp-1 italic font-normal mt-0.5" title={headline}>
              &ldquo;{headline}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {primaryPreset} &bull; {project.screenSets.length} set{project.screenSets.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Metadata & Swatches Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          {/* Device & Sets Summary */}
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[120px] font-medium text-foreground/80">{primaryPreset}</span>
            {swatches.length > 0 && (
              <div className="flex items-center -space-x-1" title="Project Palette">
                {swatches.map((color, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-card shadow-xs shrink-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Project List Row (List View) ──────────────────────────────────────────────
function ProjectListRow({
  project,
  onOpen,
  onDuplicate,
  onRename,
  onDelete,
  deleting,
}: {
  project: Project;
  onOpen: (id: string) => void;
  onDuplicate: (e: React.MouseEvent, id: string, name: string) => void;
  onRename: (e: React.MouseEvent, id: string, name: string) => void;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
  deleting: boolean;
}) {
  const totalScreens = project.screenSets.reduce((acc, ss) => acc + ss.screens.length, 0);
  const platforms = Array.from(new Set(project.screenSets.map((ss) => ss.store)));
  const primaryPreset = project.screenSets[0]?.preset?.name || "App Store";
  const headline = useMemo(() => getProjectHeadline(project), [project]);
  const swatches = useMemo(() => getProjectColorSwatches(project), [project]);
  const appIcon = useMemo(() => getProjectAppIcon(project), [project]);
  const firstSet = project.screenSets[0];
  const screen1 = firstSet?.screens[0];

  return (
    <div
      onClick={() => onOpen(project.id)}
      className={`group flex items-center justify-between gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer ${
        deleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Mini Preview Box with Screen Thumbnail or App Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#080c14] border border-border/50 overflow-hidden shrink-0 relative flex items-center justify-center shadow-xs">
          {screen1 ? (
            <div className="w-[85%] h-[90%] rounded-[6px] overflow-hidden border border-white/20 shadow-md">
              <ScreenThumbnailCanvas
                screen={screen1}
                screenSet={firstSet}
                width={64}
                height={138}
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md border border-white/20"
              style={{ background: appIcon.gradient }}
            >
              {appIcon.letter}
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            {project.languages && project.languages.length > 1 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium gap-0.5 shrink-0 hidden sm:inline-flex">
                <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                {project.languages.length}
              </Badge>
            )}
          </div>

          {headline && (
            <p className="text-xs text-muted-foreground/90 italic truncate mt-0.5">
              &ldquo;{headline}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{primaryPreset}</span>
            <span>&bull;</span>
            <span>{totalScreens} screens ({project.screenSets.length} sets)</span>
            {swatches.length > 0 && (
              <>
                <span>&bull;</span>
                <div className="flex items-center -space-x-1" title="Project Palette">
                  {swatches.map((color, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-card shadow-xs shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </>
            )}
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" /> Updated {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Platforms & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5">
          {platforms.map((store) => (
            <Badge key={store} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
              {store === "ios" ? "🍎 iOS" : "▶ Android"}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onRename(e, project.id, project.name)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Rename"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onDuplicate(e, project.id, project.name)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => onDelete(e, project.id, project.name)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onOpen(project.id)}
            className="hidden md:flex gap-1 rounded-xl text-xs h-8 px-3 ml-1 cursor-pointer"
          >
            Open
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export type DashboardSortOption =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc"
  | "screens-desc"
  | "screens-asc"
  | "created-desc"
  | "created-asc";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isInitialized, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { projects, deleteProject, duplicateProject, updateProject } = useProjectStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Protected route check: if unauthenticated, redirect to "/" and prompt login
  useEffect(() => {
    if (mounted && isInitialized && !user) {
      router.replace("/");
      setAuthModalOpen(true);
    }
  }, [mounted, isInitialized, user, router, setAuthModalOpen]);

  const [confirmModal, setConfirmModal] = useState<{
    type: "delete" | "duplicate";
    projectId: string;
    projectName: string;
  } | null>(null);

  const [renameModal, setRenameModal] = useState<{
    projectId: string;
    currentName: string;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<DashboardSortOption>("updated-desc");

  const isGuest = Boolean(user && user.isAnonymous);

  const promptDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ type: "delete", projectId: id, projectName: name });
  };

  const promptDuplicate = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    if (!isPro && projects.length >= 3) {
      setUpgradeModalOpen(true);
      toast.info("Free plan includes up to 3 local projects. Upgrade to SnapFrame Pro for unlimited projects & multi-device cloud sync!");
      return;
    }
    setConfirmModal({ type: "duplicate", projectId: id, projectName: name });
  };

  const handleNewProjectClick = () => {
    if (isGuest && projects.length >= 1) {
      setAuthModalOpen(true);
      return;
    }
    if (!isPro && projects.length >= 3) {
      setUpgradeModalOpen(true);
      toast.info("Free plan includes up to 3 local projects. Upgrade to SnapFrame Pro for unlimited projects & multi-device cloud sync!");
      return;
    }
    setShowNewProject(true);
  };

  const promptRename = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameModal({ projectId: id, currentName: name });
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    if (confirmModal.type === "delete") {
      const id = confirmModal.projectId;
      setDeletingId(id);
      setTimeout(() => {
        deleteProject(id);
        setDeletingId(null);
      }, 300);
    } else if (confirmModal.type === "duplicate") {
      duplicateProject(confirmModal.projectId);
    }
  };

  const handleRename = (newName: string) => {
    if (!renameModal) return;
    updateProject(renameModal.projectId, { name: newName });
    setRenameModal(null);
  };

  // Filter & Bidirectional Sort Logic
  const filtered = useMemo(() => {
    let list = [...projects];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.screenSets.some(
            (ss) =>
              ss.store.toLowerCase().includes(q) ||
              ss.preset?.name?.toLowerCase().includes(q)
          )
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "updated-desc") return b.updatedAt - a.updatedAt;
      if (sortBy === "updated-asc") return a.updatedAt - b.updatedAt;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "screens-desc") {
        const countA = a.screenSets.reduce((sum, ss) => sum + ss.screens.length, 0);
        const countB = b.screenSets.reduce((sum, ss) => sum + ss.screens.length, 0);
        return countB - countA;
      }
      if (sortBy === "screens-asc") {
        const countA = a.screenSets.reduce((sum, ss) => sum + ss.screens.length, 0);
        const countB = b.screenSets.reduce((sum, ss) => sum + ss.screens.length, 0);
        return countA - countB;
      }
      if (sortBy === "created-desc") return b.createdAt - a.createdAt;
      if (sortBy === "created-asc") return a.createdAt - b.createdAt;
      return 0;
    });

    return list;
  }, [projects, search, sortBy]);

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center shadow-lg">
          <SnapFrameLogo size={36} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading Your Projects...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/projects"
            onClick={() => {
              setSearch("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium px-2 py-1">
              Home
            </Link>
            <a
              href="https://github.com/alexandrmotologa/snapframe.store"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-muted-foreground hidden sm:inline-flex items-center gap-1.5",
              })}
            >
              <GithubIcon className="w-3.5 h-3.5 text-muted-foreground/80" />
              <span>GitHub</span>
            </a>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {/* Guest Mode Status Banner */}
        {isGuest ? (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-400">
                  Guest Account ({projects.length}/1 Active Project Used)
                </span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Guest accounts can store 1 local project. Sign in with Google or GitHub (100% Free) for up to 3 projects and 3 free AI credits.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="shrink-0 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign In Free</span>
            </Button>
          </div>
        ) : !isPro ? (
          <div className="mb-6 p-4 rounded-2xl bg-secondary/50 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Free Account ({projects.length}/3 Local Projects Used)
                  </span>
                  <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                    Local Device Storage
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Projects are stored locally in your browser. Upgrade to SnapFrame Pro for unlimited projects &amp; multi-device cloud sync.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setUpgradeModalOpen(true)}
              className="shrink-0 h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Cloud Sync &amp; Pro</span>
            </Button>
          </div>
        ) : (
          <div className="mb-6 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">☁️ SnapFrame Pro Active:</span>
              <span>Multi-device Cloud Sync enabled • Unlimited Projects • 500 AI Generations / mo</span>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          /* ── Empty Projects State ── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center py-24 text-center overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm px-6"
          >
            <div className="mb-6">
              <BrandHeroIcon size="lg" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
              Ready to create your screenshot set?
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Start with a blank canvas or choose from our gallery of App Store & Google Play templates.
            </p>

            <Button
              size="lg"
              onClick={handleNewProjectClick}
              className="gap-2 px-8 py-6 rounded-2xl text-base font-semibold shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create First Screenshot Set
            </Button>
          </motion.div>
        ) : (
          <>
            {/* ── Top Header Controls Row ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              {/* Title & Project Count Badge */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Your Projects</h1>
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border/50">
                  {projects.length}{isGuest ? "/1 (Guest Limit)" : ""}
                </Badge>
              </div>

              {/* Action Controls (Sort, View Mode, New Project) */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
                {/* Bidirectional Sort Toggle Group */}
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/40 text-xs">
                  <span className="text-[11px] font-medium text-muted-foreground px-2 hidden sm:flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" /> Sort:
                  </span>

                  {/* Recent Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === "updated-desc") setSortBy("updated-asc");
                      else setSortBy("updated-desc");
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none ${
                      sortBy === "updated-desc" || sortBy === "updated-asc"
                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={sortBy === "updated-asc" ? "Oldest updated first (click for Newest)" : "Newest updated first (click for Oldest)"}
                  >
                    <Clock className="w-3 h-3" />
                    Recent {sortBy === "updated-asc" ? "↑" : "↓"}
                  </button>

                  {/* Name Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === "name-asc") setSortBy("name-desc");
                      else setSortBy("name-asc");
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none ${
                      sortBy === "name-asc" || sortBy === "name-desc"
                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={sortBy === "name-desc" ? "Z to A (click for A to Z)" : "A to Z (click for Z to A)"}
                  >
                    Name {sortBy === "name-desc" ? "Z-A" : "A-Z"}
                  </button>

                  {/* Screens Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === "screens-desc") setSortBy("screens-asc");
                      else setSortBy("screens-desc");
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none ${
                      sortBy === "screens-desc" || sortBy === "screens-asc"
                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={sortBy === "screens-asc" ? "Fewest screens (click for Most)" : "Most screens (click for Fewest)"}
                  >
                    <Smartphone className="w-3 h-3" />
                    Screens {sortBy === "screens-asc" ? "↑" : "↓"}
                  </button>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center bg-secondary/50 p-1 rounded-xl border border-border/40">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary CTA: New Project */}
                <Button
                  onClick={handleNewProjectClick}
                  className={`gap-2 rounded-xl shadow-md transition-all cursor-pointer h-9 px-4 font-semibold ${
                    isGuest && projects.length >= 1
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-amber-500/30"
                      : "hover:shadow-primary/20"
                  }`}
                  title={isGuest && projects.length >= 1 ? "Guest limit reached (1 active project)" : "Create a new screenshot set"}
                >
                  {isGuest && projects.length >= 1 ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>New Project (1/1 Max)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ── Search Bar ── */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects by name, store, or device preset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-card border border-border/60 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* ── Project Cards Listing ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-card/20 space-y-3">
                <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-semibold text-foreground">No matching projects found</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  No projects matched your search query &quot;{search}&quot;.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="rounded-xl text-xs mt-2 cursor-pointer"
                >
                  Clear search
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={(id) => router.push(`/editor/${id}`)}
                    onDuplicate={promptDuplicate}
                    onRename={promptRename}
                    onDelete={promptDelete}
                    deleting={deletingId === project.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((project) => (
                  <ProjectListRow
                    key={project.id}
                    project={project}
                    onOpen={(id) => router.push(`/editor/${id}`)}
                    onDuplicate={promptDuplicate}
                    onRename={promptRename}
                    onDelete={promptDelete}
                    deleting={deletingId === project.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* ── Modals ── */}
      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={(id) => router.push(`/editor/${id}`)}
      />

      <ConfirmActionModal
        open={!!confirmModal}
        type={confirmModal?.type || "delete"}
        projectName={confirmModal?.projectName || ""}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmAction}
      />

      <RenameProjectModal
        open={!!renameModal}
        currentName={renameModal?.currentName || ""}
        onClose={() => setRenameModal(null)}
        onRename={handleRename}
      />

      <AuthModal />
      <UpgradeModal />
    </div>
  );
}
