"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  Layers, Type, Square, Flag,
  Cpu, Upload, Grid3X3, X, Palette, Smile, Globe, User,
  Smartphone, LayoutList, LayoutTemplate,
  Sparkles, Eye, Film, Layers2, Lock,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store/authStore";
import { TemplatesPanel } from "@/components/editor/panels/TemplatesPanel";
import { LayersPanel } from "@/components/editor/panels/LayersPanel";
import { TextPanel } from "@/components/editor/panels/TextPanel";
import { BackgroundPanel } from "@/components/editor/panels/BackgroundPanel";
import { FlagsPanel } from "@/components/editor/panels/FlagsPanel";
import { BrandIconsPanel } from "@/components/editor/panels/BrandIconsPanel";
import { AssetsPanel } from "@/components/editor/panels/AssetsPanel";
import { BlocksPanel } from "@/components/editor/panels/BlocksPanel";
import { StickersPanel } from "@/components/editor/panels/StickersPanel";
import { LocalizationPanel } from "@/components/editor/panels/LocalizationPanel";
import { CharactersPanel } from "@/components/editor/panels/CharactersPanel";
import { PlatformsPanel } from "@/components/editor/panels/PlatformsPanel";
import { ThemesPanel } from "@/components/editor/panels/ThemesPanel";
import { StoreListingPanel } from "@/components/editor/panels/StoreListingPanel";
import { cn } from "@/lib/utils";

type PanelId =
  | "templates"
  | "themes"
  | "platforms"
  | "layers"
  | "text"
  | "background"
  | "flags"
  | "brands"
  | "assets"
  | "blocks"
  | "stickers"
  | "languages"
  | "characters"
  | "store_listing"
  | null;

interface SidebarTool {
  id: NonNullable<PanelId>;
  icon: React.ElementType;
  label: string;
  badge?: string;
}

interface SidebarGroup {
  name: string;
  tools: SidebarTool[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    name: "Setup & Store Assets",
    tools: [
      { id: "platforms", icon: Smartphone, label: "Platforms & Presets" },
      { id: "assets", icon: Upload, label: "My Screenshots & Assets" },
      { id: "languages", icon: Globe, label: "Multi-Language (i18n)" },
      { id: "store_listing", icon: LayoutList, label: "Store Listing" },
    ],
  },
  {
    name: "Design & Composition",
    tools: [
      { id: "templates", icon: LayoutTemplate, label: "Templates & Presets" },
      { id: "themes", icon: Palette, label: "Color Themes" },
      { id: "background", icon: Grid3X3, label: "Background & Mesh" },
      { id: "layers", icon: Layers, label: "Layer Order" },
      { id: "text", icon: Type, label: "Typography & Captions" },
    ],
  },
  {
    name: "Elements & Graphics",
    tools: [
      { id: "blocks", icon: Square, label: "Block Elements & Shapes" },
      { id: "stickers", icon: Smile, label: "Stickers & Badges" },
      { id: "characters", icon: User, label: "3D Characters & Mascots" },
      { id: "brands", icon: Cpu, label: "Brand Icons" },
      { id: "flags", icon: Flag, label: "Country Flags" },
    ],
  },
];

const PANEL_TITLES: Record<NonNullable<PanelId>, string> = {
  templates: "Templates & Presets",
  themes: "Color Themes",
  platforms: "Platforms & Devices",
  layers: "Layers",
  text: "Typography & Captions",
  background: "Background & Mesh",
  stickers: "Stickers & Badges",
  flags: "Country Flags",
  brands: "Brand Icons",
  assets: "Screenshots & Media",
  blocks: "Block Elements",
  languages: "Languages & Localization",
  characters: "3D Characters",
  store_listing: "Store Listing",
};

function renderPanel(panel: NonNullable<PanelId>) {
  switch (panel) {
    case "templates": return <TemplatesPanel />;
    case "themes": return <ThemesPanel />;
    case "platforms": return <PlatformsPanel />;
    case "layers": return <LayersPanel />;
    case "text": return <TextPanel />;
    case "background": return <BackgroundPanel />;
    case "stickers": return <StickersPanel />;
    case "flags": return <FlagsPanel />;
    case "brands": return <BrandIconsPanel />;
    case "assets": return <AssetsPanel />;
    case "blocks": return <BlocksPanel />;
    case "languages": return <LocalizationPanel />;
    case "characters": return <CharactersPanel />;
    case "store_listing": return <StoreListingPanel />;
  }
}

interface EditorSidebarProps {
  onOpenStorePreview?: () => void;
  onOpenAIAutoPilot?: () => void;
  onOpenAssetsStudio?: () => void;
  onOpenGif?: () => void;
}

export const EditorSidebar = memo(function EditorSidebar({
  onOpenStorePreview,
  onOpenAIAutoPilot,
  onOpenAssetsStudio,
  onOpenGif,
}: EditorSidebarProps) {
  const { user } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const checkScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 4;
    setCanScrollUp(hasOverflow && el.scrollTop > 8);
    setCanScrollDown(hasOverflow && el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScroll]);

  const togglePanel = useCallback(
    (id: PanelId) => setActivePanel((prev) => (prev === id ? null : id)),
    []
  );

  return (
    <div className="flex shrink-0 h-full z-30">
      {/* Icon Rail with Scroll Indicators & Group Separators */}
      <div className="relative w-12 border-r border-border/50 bg-card/70 backdrop-blur-md flex flex-col h-full select-none">
        
        {/* Top Scroll Indicator Hint (for low-height screens) */}
        {canScrollUp && (
          <div
            onClick={() => railRef.current?.scrollBy({ top: -140, behavior: "smooth" })}
            className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-card via-card/90 to-transparent z-20 flex items-center justify-center cursor-pointer pointer-events-auto transition-opacity"
            title="Scroll up"
          >
            <ChevronUp className="w-3 h-3 text-primary animate-bounce opacity-90" />
          </div>
        )}

        {/* Scrollable Icon Rail */}
        <div
          ref={railRef}
          onScroll={checkScroll}
          className="flex-1 w-full flex flex-col items-center py-2.5 gap-2 overflow-y-auto overflow-x-hidden custom-sidebar-scrollbar scroll-smooth"
        >
          {/* ── Standard Sidebar Panels ── */}
          {SIDEBAR_GROUPS.map((group, gIdx) => (
            <div key={group.name} className="flex flex-col items-center gap-1 w-full">
              {gIdx > 0 && (
                <div className="w-6 h-[1px] bg-border/60 my-1" />
              )}

              {group.tools.map((tool) => {
                const isActive = activePanel === tool.id;
                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger
                      id={`sidebar-${tool.id}`}
                      type="button"
                      onClick={() => togglePanel(tool.id)}
                      className={cn(
                        "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-sm outline-none cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                      )}
                    >
                      <tool.icon className="w-4 h-4" />
                      {isActive && (
                        <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-l-full" />
                      )}
                    </TooltipTrigger>

                    <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                      {tool.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          <div className="w-6 h-[1px] bg-border/60 my-0.5" />

          {/* ── Studio & AI Fast Launch Group (Last in Menu) ── */}
          <div className="flex flex-col items-center gap-1.5 w-full pt-0.5">
            {/* AI Auto-Pilot */}
            {onOpenAIAutoPilot && (
              <Tooltip>
                <TooltipTrigger
                  id="sidebar-ai-pilot"
                  type="button"
                  onClick={onOpenAIAutoPilot}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/40 hover:border-indigo-500/70 shadow-xs hover:scale-105 active:scale-95 outline-none cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                  ✨ AI Vision Auto-Pilot
                </TooltipContent>
              </Tooltip>
            )}

            {/* Live Store Simulator Preview */}
            {onOpenStorePreview && (
              <Tooltip>
                <TooltipTrigger
                  id="sidebar-store-preview"
                  type="button"
                  onClick={onOpenStorePreview}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/90 hover:scale-105 active:scale-95 outline-none cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-primary" />
                  {isGuest && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[8px] text-amber-400">
                      <Lock className="w-2 h-2" />
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                  📱 Live Store Simulator Preview {isGuest ? "(Sign in to unlock)" : ""}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Store Assets Studio */}
            {onOpenAssetsStudio && (
              <Tooltip>
                <TooltipTrigger
                  id="sidebar-assets-studio"
                  type="button"
                  onClick={onOpenAssetsStudio}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/90 hover:scale-105 active:scale-95 outline-none cursor-pointer"
                >
                  <Layers2 className="w-4 h-4 text-purple-400" />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                  🎨 App Icons &amp; Feature Graphic Studio
                </TooltipContent>
              </Tooltip>
            )}

            {/* Video & Animated GIF Studio */}
            {onOpenGif && (
              <Tooltip>
                <TooltipTrigger
                  id="sidebar-gif-studio"
                  type="button"
                  onClick={onOpenGif}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/90 hover:scale-105 active:scale-95 outline-none cursor-pointer"
                >
                  <Film className="w-4 h-4 text-pink-400" />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                  🎬 Video (MP4) &amp; Animated GIF Exporter
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Bottom Scroll Indicator Hint (for low-height screens) */}
        {canScrollDown && (
          <div
            onClick={() => railRef.current?.scrollBy({ top: 140, behavior: "smooth" })}
            className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card via-card/90 to-transparent z-20 flex items-center justify-center cursor-pointer pointer-events-auto transition-opacity"
            title="More tools & studios below (Click to scroll down)"
          >
            <ChevronDown className="w-3.5 h-3.5 text-primary animate-bounce opacity-90" />
          </div>
        )}
      </div>

      {/* Slide-out panel */}
      {activePanel && (
        <div className="w-72 border-r border-border/50 bg-card/95 backdrop-blur-md flex flex-col h-full shadow-2xl">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {PANEL_TITLES[activePanel]}
            </h3>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="w-6 h-6 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Panel content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {renderPanel(activePanel)}
          </div>
        </div>
      )}
    </div>
  );
});
