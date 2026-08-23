"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { THEMES, THEME_CATEGORIES, getAutoTextColor } from "@/lib/themes";
import { ThemeId, ThemeCategory, GradientDirection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Search, Sparkles, Pipette, ArrowLeftRight, Wand2, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorInput } from "@/components/ui/color-input";
import { toast } from "@/lib/store/toastStore";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

const POPULAR_PALETTES = [
  { name: "iOS Indigo", bg: "#4F46E5", fg: "#FFFFFF" },
  { name: "Spotify Green", bg: "#121212", fg: "#1DB954" },
  { name: "Twitter Dark", bg: "#000000", fg: "#1D9BF0" },
  { name: "Linear Purple", bg: "#0F0F17", fg: "#5E6AD2" },
  { name: "Figma Dark", bg: "#1E1E1E", fg: "#F24E1E" },
  { name: "Airbnb Coral", bg: "#FF385C", fg: "#FFFFFF" },
  { name: "Notion Clean", bg: "#FFFFFF", fg: "#37352F" },
  { name: "Telegram Cyan", bg: "#229ED9", fg: "#FFFFFF" },
  { name: "Stripe Blurple", bg: "#635BFF", fg: "#FFFFFF" },
  { name: "Solar Gold", bg: "#F59E0B", fg: "#1C1917" },
];

const GRADIENT_DIRECTIONS: { id: GradientDirection; label: string; arrow: string }[] = [
  { id: "to-b", label: "Vertical", arrow: "↓" },
  { id: "to-br", label: "Diagonal", arrow: "↘" },
  { id: "to-r", label: "Horizontal", arrow: "→" },
  { id: "to-bl", label: "Diag Left", arrow: "↙" },
];

export function ThemesPanel() {
  const { themeId, applyThemeToProject, applyCustomThemeToProject, getActiveSet, generateDualThemeSet } = useEditorStore();
  const activeSet = getActiveSet();
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("all");

  // Custom Palette State
  const [bgMode, setBgMode] = useState<"solid" | "gradient">("solid");
  const [customBg, setCustomBg] = useState("#0B1020");
  const [customGradStop1, setCustomGradStop1] = useState("#6366F1");
  const [customGradStop2, setCustomGradStop2] = useState("#A855F7");
  const [customGradDir, setCustomGradDir] = useState<GradientDirection>("to-br");
  const [customFg, setCustomFg] = useState("#FFFFFF");

  const themesList = useMemo(() => Object.values(THEMES), []);

  const filteredThemes = useMemo(() => {
    return themesList.filter((theme) => {
      const matchesCategory =
        selectedCategory === "all" || theme.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        theme.name.toLowerCase().includes(q) ||
        theme.id.toLowerCase().includes(q) ||
        theme.bg.toLowerCase().includes(q) ||
        (theme.category && theme.category.toLowerCase().includes(q))
      );
    });
  }, [themesList, selectedCategory, searchQuery]);

  const handleApplyPreset = (id: ThemeId) => {
    applyThemeToProject(id);
  };

  const handleApplyCustom = () => {
    if (bgMode === "solid") {
      applyCustomThemeToProject({
        bg: customBg,
        fg: customFg,
      });
    } else {
      applyCustomThemeToProject({
        bg: customGradStop1,
        fg: customFg,
        gradient: {
          direction: customGradDir,
          stops: [
            { color: customGradStop1, position: 0 },
            { color: customGradStop2, position: 100 },
          ],
        },
      });
    }
  };

  const handleAutoContrast = () => {
    const autoFg = getAutoTextColor(bgMode === "solid" ? customBg : customGradStop1);
    setCustomFg(autoFg);
  };

  const handleSwapColors = () => {
    if (bgMode === "solid") {
      const oldBg = customBg;
      setCustomBg(customFg);
      setCustomFg(oldBg);
    }
  };

  const getThemeBackgroundStyle = (theme: (typeof themesList)[0]) => {
    if (theme.gradient) {
      const dirMap: Record<GradientDirection, string> = {
        "to-b": "to bottom",
        "to-br": "to bottom right",
        "to-r": "to right",
        "to-bl": "to bottom left",
        "to-tr": "to top right",
        "to-tl": "to top left",
      };
      const cssDir = dirMap[theme.gradient.direction] || "to bottom right";
      const stops = theme.gradient.stops
        .map((s) => `${s.color} ${s.position}%`)
        .join(", ");
      return { background: `linear-gradient(${cssDir}, ${stops})` };
    }
    return { backgroundColor: theme.bg };
  };

  const customPreviewBackground = useMemo(() => {
    if (bgMode === "solid") {
      return { backgroundColor: customBg };
    }
    const dirMap: Record<GradientDirection, string> = {
      "to-b": "to bottom",
      "to-br": "to bottom right",
      "to-r": "to right",
      "to-bl": "to bottom left",
      "to-tr": "to top right",
      "to-tl": "to top left",
    };
    return {
      background: `linear-gradient(${dirMap[customGradDir]}, ${customGradStop1}, ${customGradStop2})`,
    };
  }, [bgMode, customBg, customGradDir, customGradStop1, customGradStop2]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header Tabs */}
      <div className="p-3 border-b border-border/40 shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "presets" | "custom")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-secondary/80 rounded-lg">
            <TabsTrigger value="presets" className="text-xs font-medium gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Presets ({themesList.length})
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs font-medium gap-1.5">
              <Pipette className="w-3.5 h-3.5" />
              Custom Picker
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "presets" ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Dual Theme Generator Quick Action */}
          {activeSet && (
            <div className="px-3 py-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-b border-border/40 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Dual Dark / Light Mode</span>
                </span>
                <p className="text-[9.5px] text-muted-foreground truncate">
                  Create matching {(activeSet?.name || "").toLowerCase().includes("dark") ? "Light" : "Dark"} version
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const isDark = (activeSet?.name || "").toLowerCase().includes("dark");
                  const targetMode = isDark ? "light" : "dark";
                  generateDualThemeSet(activeSet.id, targetMode);
                  toast.success(`✨ Created ${targetMode === "dark" ? "Dark" : "Light"} Mode screen set!`);
                }}
                className="px-2 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[10.5px] font-bold border border-primary/30 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                <span>{(activeSet?.name || "").toLowerCase().includes("dark") ? "☀️ Make Light Set" : "🌙 Make Dark Set"}</span>
              </button>
            </div>
          )}

          {/* Search & Category Filter Section */}
          <div className="p-3 border-b border-border/40 space-y-2.5 shrink-0 bg-card/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search color themes..."
                className="pl-8 h-8 text-xs bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category horizontal scroll rail */}
            <HorizontalScrollRail className="pb-0.5">
              {THEME_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={(e) => {
                      setSelectedCategory(cat.id);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors shrink-0 font-medium cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </HorizontalScrollRail>
          </div>

          {/* Presets Grid */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 grid grid-cols-2 gap-2.5">
              {filteredThemes.map((theme) => {
                const isActive = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleApplyPreset(theme.id)}
                    className={cn(
                      "group relative rounded-xl border text-left flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                      isActive
                        ? "border-primary ring-2 ring-primary/40 shadow-sm"
                        : "border-border/60 hover:border-primary/50 bg-card"
                    )}
                  >
                    {/* Visual Color Bar with Aa typography */}
                    <div
                      className="h-16 w-full flex items-center justify-center relative p-2 overflow-hidden"
                      style={getThemeBackgroundStyle(theme)}
                    >
                      <span
                        className="text-lg font-bold tracking-tight select-none drop-shadow-sm"
                        style={{ color: theme.fg }}
                      >
                        Aa
                      </span>

                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Small subtle category pill */}
                      {theme.gradient && (
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/40 backdrop-blur-xs rounded text-[8px] text-white font-mono">
                          Grad
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2 bg-card border-t border-border/50 flex flex-col gap-1">
                      <div className="text-[11px] font-medium truncate text-foreground">
                        {theme.name}
                      </div>
                      {/* Color Palette Dots */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-1 ring-border/50 shrink-0"
                          style={{ backgroundColor: theme.bg }}
                          title={`Bg: ${theme.bg}`}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-1 ring-border/50 shrink-0"
                          style={{ backgroundColor: theme.fg }}
                          title={`Text: ${theme.fg}`}
                        />
                        {theme.accent && (
                          <span
                            className="w-2.5 h-2.5 rounded-full ring-1 ring-border/50 shrink-0"
                            style={{ backgroundColor: theme.accent }}
                            title={`Accent: ${theme.accent}`}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredThemes.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
                <Palette className="w-8 h-8 mx-auto stroke-1 opacity-40 mb-2" />
                <p className="font-medium text-foreground">No matching themes</p>
                <p>Try searching for a different color name or hex.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        /* Custom Color Picker Tab */
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-5 text-xs">
            {/* Live Interactive Preview Box */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Live Preview
              </Label>
              <div
                className="w-full h-24 rounded-xl border border-border/60 flex flex-col items-center justify-center p-3 shadow-inner relative overflow-hidden transition-all"
                style={customPreviewBackground}
              >
                <div
                  className="text-lg font-bold tracking-tight text-center leading-tight"
                  style={{ color: customFg }}
                >
                  Aa Catchy Title
                </div>
                <div
                  className="text-xs opacity-80 text-center font-medium mt-0.5"
                  style={{ color: customFg }}
                >
                  Subtitle preview on this theme
                </div>
              </div>
            </div>

            {/* Background Mode Selector */}
            <div className="space-y-2">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Background Type
              </Label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-secondary rounded-lg">
                <button
                  type="button"
                  onClick={() => setBgMode("solid")}
                  className={cn(
                    "py-1 rounded-md text-xs font-medium transition-all",
                    bgMode === "solid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("gradient")}
                  className={cn(
                    "py-1 rounded-md text-xs font-medium transition-all",
                    bgMode === "gradient"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Linear Gradient
                </button>
              </div>
            </div>

            {/* Background Color Pickers */}
            {bgMode === "solid" ? (
              <div className="space-y-2">
                <Label className="text-[11px] font-medium text-muted-foreground">
                  Background Color
                </Label>
                <div className="flex items-center gap-2">
                  <label className="relative w-9 h-9 rounded-lg border border-border/80 cursor-pointer overflow-hidden shrink-0 shadow-xs">
                    <ColorInput
                      value={customBg.startsWith("#") && customBg.length === 7 ? customBg : "#0B1020"}
                      onColorChange={(color) => setCustomBg(color)}
                      className="opacity-0 w-0 h-0 absolute"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: customBg }} />
                  </label>
                  <Input
                    value={customBg}
                    onChange={(e) => setCustomBg(e.target.value)}
                    placeholder="#0B1020"
                    className="h-9 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Color 1 (Start)</Label>
                    <div className="flex items-center gap-1.5">
                      <label className="relative w-7 h-7 rounded-md border border-border/80 cursor-pointer overflow-hidden shrink-0">
                        <ColorInput
                          value={customGradStop1}
                          onColorChange={(color) => setCustomGradStop1(color)}
                          className="opacity-0 w-0 h-0 absolute"
                        />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: customGradStop1 }}
                        />
                      </label>
                      <Input
                        value={customGradStop1}
                        onChange={(e) => setCustomGradStop1(e.target.value)}
                        className="h-7 text-[10px] font-mono uppercase px-1.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Color 2 (End)</Label>
                    <div className="flex items-center gap-1.5">
                      <label className="relative w-7 h-7 rounded-md border border-border/80 cursor-pointer overflow-hidden shrink-0">
                        <ColorInput
                          value={customGradStop2}
                          onColorChange={(color) => setCustomGradStop2(color)}
                          className="opacity-0 w-0 h-0 absolute"
                        />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: customGradStop2 }}
                        />
                      </label>
                      <Input
                        value={customGradStop2}
                        onChange={(e) => setCustomGradStop2(e.target.value)}
                        className="h-7 text-[10px] font-mono uppercase px-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Direction</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {GRADIENT_DIRECTIONS.map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => setCustomGradDir(dir.id)}
                        className={cn(
                          "py-1 px-1.5 rounded-md text-[10px] flex items-center justify-center gap-1 border transition-all",
                          customGradDir === dir.id
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-secondary/60 hover:bg-secondary border-border/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>{dir.arrow}</span>
                        <span className="truncate">{dir.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text Color Picker & Smart Tools */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-medium text-muted-foreground">
                  Text & Content Color
                </Label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAutoContrast}
                    title="Auto-calculate optimal high-contrast text color"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/80 hover:bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Wand2 className="w-2.5 h-2.5 text-primary" />
                    Auto Contrast
                  </button>
                  {bgMode === "solid" && (
                    <button
                      type="button"
                      onClick={handleSwapColors}
                      title="Swap Background and Text colors"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/80 hover:bg-secondary text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      Swap
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative w-9 h-9 rounded-lg border border-border/80 cursor-pointer overflow-hidden shrink-0 shadow-xs">
                  <ColorInput
                    value={customFg.startsWith("#") && customFg.length === 7 ? customFg : "#FFFFFF"}
                    onColorChange={(color) => setCustomFg(color)}
                    className="opacity-0 w-0 h-0 absolute"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: customFg }} />
                </label>
                <Input
                  value={customFg}
                  onChange={(e) => setCustomFg(e.target.value)}
                  placeholder="#FFFFFF"
                  className="h-9 font-mono text-xs uppercase"
                />
              </div>

              {/* Fast Text Contrast Swatches */}
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: "White", color: "#FFFFFF" },
                  { label: "Dark", color: "#111827" },
                  { label: "Slate", color: "#F8FAFC" },
                  { label: "Gold", color: "#FDE047" },
                  { label: "Cyan", color: "#38BDF8" },
                ].map((s) => (
                  <button
                    key={s.color}
                    type="button"
                    onClick={() => setCustomFg(s.color)}
                    className="flex-1 py-1 rounded border border-border/60 text-[10px] font-medium hover:border-primary/60 transition-colors flex items-center justify-center gap-1 bg-card"
                  >
                    <span
                      className="w-2 h-2 rounded-full ring-1 ring-border/50"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Popular App Palettes */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Popular Brand Combinations
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {POPULAR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      setBgMode("solid");
                      setCustomBg(pal.bg);
                      setCustomFg(pal.fg);
                    }}
                    className="flex items-center justify-between p-1.5 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/80 transition-colors text-left"
                  >
                    <span className="text-[10px] font-medium truncate">{pal.name}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: pal.bg }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: pal.fg }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              onClick={handleApplyCustom}
              className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Custom Palette to All Screens
            </button>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

