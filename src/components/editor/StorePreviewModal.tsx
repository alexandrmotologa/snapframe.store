"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/lib/store/editorStore";
import { useLanguageStore, getLang } from "@/lib/store/languageStore";
import { AppleStoreIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import {
  Smartphone, Tablet, Share2, Star, Sparkles,
  ChevronLeft, ChevronRight, Moon, Sun, ArrowLeft, MoreVertical,
  Edit3, Globe, Upload, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScreenThumbnailCanvas } from "@/components/editor/ScreenThumbnailCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";

import { isTabletDevice } from "@/lib/devices";

interface StorePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName?: string;
}

export function StorePreviewModal({ open, onOpenChange, appName: initialAppName = "My Awesome App" }: StorePreviewModalProps) {
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);

  const { screenSets, activeSetId } = useEditorStore();
  const { projectLanguages, activeLang } = useLanguageStore();

  const currentSet = screenSets.find((s) => s.id === activeSetId) || screenSets[0];
  const [platform, setPlatform] = useState<"ios" | "android">(currentSet?.store || "ios");
  const [deviceType, setDeviceType] = useState<"phone" | "tablet">(
    currentSet && isTabletDevice(currentSet.deviceId || currentSet.mockup?.device) && isPro ? "tablet" : "phone"
  );
  const [storeTheme, setStoreTheme] = useState<"dark" | "light">("dark");
  const [selectedLang, setSelectedLang] = useState<string>(activeLang || "en");
  
  // Customizable Store Metadata
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [appName, setAppName] = useState(initialAppName);
  const [appSubtitle, setAppSubtitle] = useState("Productivity & Design Studio");
  const [developerName, setDeveloperName] = useState("NextGen Studio LLC");
  const [ratingScore, setRatingScore] = useState("4.9");
  const [ratingCount, setRatingCount] = useState("128K");
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const isTablet = deviceType === "tablet";

  // Derive active set matching selected platform AND device form factor (phone vs tablet)
  const activeSet =
    screenSets.find(
      (s) => s.store === platform && isTabletDevice(s.deviceId || s.mockup?.device) === isTablet
    ) ||
    screenSets.find((s) => s.store === platform) ||
    screenSets[0];
  const screens = activeSet?.screens || [];

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIconUrl(url);
    }
  };

  const baseCardHeight = isTablet ? 380 : 440;
  const approxCardWidth = isTablet ? 285 : 203;

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (isGuest) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md flex flex-col p-0 overflow-hidden border border-border/70 rounded-2xl bg-card shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-secondary/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-foreground leading-tight">
                  Live Store Listing Simulator
                </DialogTitle>
                <p className="text-[10px] text-muted-foreground">Registered Free Feature</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">Sign In to Use Store Simulator</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Test and preview your screenshots and metadata in interactive Apple App Store and Google Play interfaces in real-time. Create a free account or sign in with Google or GitHub (100% Free) to unlock.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setAuthModalOpen(true);
                }}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Sign In / Register Free
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[94vh] flex flex-col p-0 overflow-hidden border border-border/70 rounded-2xl bg-card shadow-2xl">
        {/* Modal Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pl-5 pr-14 py-3 border-b border-border/50 bg-secondary/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground leading-tight">
                Live Store Listing Simulator
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground">App Store & Google Play Real-Time Preview</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Multi-Language Selector */}
            {projectLanguages.length > 1 && (
              <div className="flex items-center gap-1 bg-background/80 border border-border/60 rounded-xl px-2 py-1 shadow-xs">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground mr-1">Lang:</span>
                <div className="flex gap-1">
                  {projectLanguages.map((code) => {
                    const lang = getLang(code);
                    const isSelected = selectedLang === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedLang(code)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={lang?.name}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Platform Toggle (App Store vs Google Play) */}
            <div className="flex items-center p-0.5 rounded-xl bg-background border border-border/50 shadow-xs">
              <button
                type="button"
                onClick={() => setPlatform("ios")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  platform === "ios"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <AppleStoreIcon className="w-3.5 h-3.5" />
                <span>App Store</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform("android")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  platform === "android"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GooglePlayIcon className="w-3.5 h-3.5" />
                <span>Google Play</span>
              </button>
            </div>

            {/* Device Form Factor (Phone vs Tablet / iPad) */}
            <div className="flex items-center p-0.5 rounded-xl bg-background border border-border/50 shadow-xs">
              <button
                type="button"
                onClick={() => setDeviceType("phone")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  deviceType === "phone"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Phone Screen Layout"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isPro) {
                    toast.info("iPad Pro & Android Tablet store simulation is a SnapFrame Pro feature. Upgrade to unlock tablet layouts!");
                    setUpgradeModalOpen(true);
                    return;
                  }
                  setDeviceType("tablet");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  deviceType === "tablet"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={isPro ? "iPad / Tablet Layout" : "iPad / Tablet Layout (SnapFrame Pro)"}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
                {!isPro && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                )}
              </button>
            </div>

            {/* Edit Metadata Toggle */}
            <button
              type="button"
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs",
                isEditingInfo
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-background hover:bg-secondary border-border/50 text-foreground"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingInfo ? "Close Edit" : "Edit Info"}</span>
            </button>

            {/* Store Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={() => setStoreTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="w-8 h-8 rounded-xl border border-border/50 bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={`Switch to ${storeTheme === "dark" ? "Light" : "Dark"} Store Mode`}
            >
              {storeTheme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Metadata Edit Panel (Collapsible) */}
        {isEditingInfo && (
          <div className="bg-secondary/40 border-b border-border/60 px-5 py-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">App Name</label>
              <Input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="My App"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Tagline / Subtitle</label>
              <Input
                value={appSubtitle}
                onChange={(e) => setAppSubtitle(e.target.value)}
                placeholder="Category & Features"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Developer Studio</label>
              <Input
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Developer Name"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Rating & Count</label>
                <div className="flex gap-1">
                  <Input
                    value={ratingScore}
                    onChange={(e) => setRatingScore(e.target.value)}
                    className="h-8 text-xs bg-background w-14"
                  />
                  <Input
                    value={ratingCount}
                    onChange={(e) => setRatingCount(e.target.value)}
                    className="h-8 text-xs bg-background flex-1"
                  />
                </div>
              </div>
              <div>
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => iconInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 px-2.5 cursor-pointer"
                  title="Upload custom App Icon"
                >
                  <Upload className="w-3 h-3" />
                  <span>Icon</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Store Frame Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex justify-center bg-muted/20">
          <div
            className={cn(
              "w-full rounded-3xl border overflow-hidden shadow-2xl transition-all duration-200 flex flex-col",
              isTablet ? "max-w-4xl" : "max-w-2xl",
              storeTheme === "dark"
                ? "bg-[#000000] text-white border-zinc-800"
                : "bg-[#ffffff] text-zinc-900 border-zinc-200"
            )}
          >
            {/* iOS App Store Layout */}
            {platform === "ios" ? (
              <div className="flex flex-col p-4 sm:p-6 space-y-5">
                {/* Store Top Bar */}
                <div className="flex items-center justify-between text-sky-500 text-xs font-medium pb-2 border-b border-border/20">
                  <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Search</span>
                  </div>
                  <div className="flex items-center gap-3 text-sky-500">
                    <Share2 className="w-4 h-4 cursor-pointer hover:opacity-80" />
                  </div>
                </div>

                {/* App Header Info */}
                <div className="flex gap-4 items-start">
                  {/* App Icon */}
                  <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md overflow-hidden shrink-0 flex items-center justify-center text-white font-black text-2xl tracking-tighter">
                    {iconUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={iconUrl} alt="App Icon" className="w-full h-full object-cover" />
                    ) : (

                      <Sparkles className="w-10 h-10 text-white" />
                    )}
                  </div>

                  {/* App Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="text-xl font-bold tracking-tight truncate leading-tight">
                      {appName}
                    </h2>
                    <p className={cn("text-xs font-medium truncate", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      {appSubtitle}
                    </p>
                    <p className="text-[11px] text-sky-500 font-medium">{developerName}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        className="px-6 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all uppercase tracking-wide cursor-pointer shadow-sm"
                      >
                        GET
                      </button>
                      <span className={cn("text-[9px]", storeTheme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
                        In-App Purchases
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Rating & Stats Badges */}
                <div className={cn("grid grid-cols-3 py-2.5 px-3 rounded-xl border text-center", storeTheme === "dark" ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-100/70 border-zinc-200")}>
                  <div className="flex flex-col items-center justify-center border-r border-border/40">
                    <span className={cn("text-[9.5px] font-semibold uppercase", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      {ratingCount} RATINGS
                    </span>
                    <span className="text-sm font-bold flex items-center gap-1 mt-0.5">
                      {ratingScore} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center border-r border-border/40">
                    <span className={cn("text-[9.5px] font-semibold uppercase", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      AGE
                    </span>
                    <span className="text-sm font-bold mt-0.5">4+</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className={cn("text-[9.5px] font-semibold uppercase", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      CHART
                    </span>
                    <span className="text-sm font-bold flex items-center gap-0.5 mt-0.5 text-sky-500">
                      #1 Top
                    </span>
                  </div>
                </div>

                {/* Screenshot Carousel Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight">Screenshots</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground font-medium uppercase">
                        {isTablet ? "iPad (13\" / 11\")" : "iPhone"}
                      </span>
                    </div>
                    {screens.length > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => scrollBy(-approxCardWidth * 1.2)}
                          className="w-7 h-7 rounded-full border border-border/40 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollBy(approxCardWidth * 1.2)}
                          className="w-7 h-7 rounded-full border border-border/40 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Scrollable Carousel */}
                  {screens.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-border/70 flex flex-col items-center justify-center text-center text-muted-foreground">
                      <Tablet className="w-8 h-8 mb-2 opacity-50 text-sky-400" />
                      <p className="text-xs font-semibold">No {isTablet ? "iPad" : "iPhone"} screens in project</p>
                      <p className="text-[10px] mt-0.5">Add an {isTablet ? "iPad" : "iPhone"} set in the editor to preview it here.</p>
                    </div>
                  ) : (
                    <div
                      ref={scrollRef}
                      className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin"
                    >
                      {screens.map((screen) => {
                        const sW = screen.width || (isTablet ? 2048 : 1290);
                        const sH = screen.height || (isTablet ? 2732 : 2796);
                        const ratio = sH / sW;
                        const cardH = baseCardHeight;
                        const cardW = Math.round(baseCardHeight / ratio);

                        return (
                          <div
                            key={screen.id}
                            className="snap-start shrink-0 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-lg transition-transform hover:scale-[1.01] bg-card/60"
                            style={{ width: `${cardW}px`, height: `${cardH}px` }}
                          >
                            <ScreenThumbnailCanvas
                              screen={screen}
                              screenSet={activeSet}
                              width={cardW}
                              height={cardH}
                              activeLang={selectedLang}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* What's New Section */}
                <div className={cn("p-3.5 rounded-2xl border space-y-1.5", storeTheme === "dark" ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">What&apos;s New</span>
                    <span className="text-[10px] text-sky-500 font-medium">Version 2.5.0</span>
                  </div>
                  <p className={cn("text-[11px] leading-relaxed", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-600")}>
                    • Enhanced titanium frame precision and studio reflections.<br />
                    • Multi-language localized screenshot rendering support.<br />
                    • 100% App Store submission guidelines validation.
                  </p>
                </div>
              </div>
            ) : (
              /* Google Play Store Layout */
              <div className="flex flex-col p-4 sm:p-6 space-y-5">
                {/* Play Store Top Bar */}
                <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-border/20">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-bold text-sm">Google Play</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4 cursor-pointer hover:opacity-80" />
                    <MoreVertical className="w-4 h-4 cursor-pointer hover:opacity-80" />
                  </div>
                </div>

                {/* App Header Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md overflow-hidden shrink-0 flex items-center justify-center text-white">
                    {iconUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={iconUrl} alt="App Icon" className="w-full h-full object-cover" />
                    ) : (

                      <Sparkles className="w-9 h-9" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="text-xl font-bold tracking-tight truncate leading-tight">
                      {appName}
                    </h2>
                    <p className="text-xs font-medium text-emerald-500 truncate">
                      {developerName}
                    </p>
                    <p className={cn("text-[10px]", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      Contains ads • In-app purchases
                    </p>
                  </div>
                </div>

                {/* Google Play Metrics Bar */}
                <div className="flex items-center justify-between px-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold flex items-center gap-1">
                      {ratingScore} <Star className="w-2.5 h-2.5 fill-current text-emerald-500" />
                    </span>
                    <span className={cn("text-[9px]", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      {ratingCount} reviews
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border/40" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">1M+</span>
                    <span className={cn("text-[9px]", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      Downloads
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border/40" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold border border-current px-1 py-0.2 rounded text-[9px]">3+</span>
                    <span className={cn("text-[9px]", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                      Rated for 3+
                    </span>
                  </div>
                </div>

                {/* Google Play Install Button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all uppercase tracking-wide cursor-pointer shadow-md"
                >
                  Install
                </button>

                {/* Screenshots Carousel */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{isTablet ? "Tablet (10-inch)" : "Phone"}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground font-medium uppercase">
                        {isTablet ? "Android Tablet" : "Google Play Phone"}
                      </span>
                    </div>
                    {screens.length > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => scrollBy(-approxCardWidth * 1.2)}
                          className="w-7 h-7 rounded-full border border-border/40 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollBy(approxCardWidth * 1.2)}
                          className="w-7 h-7 rounded-full border border-border/40 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Scrollable Carousel */}
                  {screens.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-border/70 flex flex-col items-center justify-center text-center text-muted-foreground">
                      <Tablet className="w-8 h-8 mb-2 opacity-50 text-emerald-400" />
                      <p className="text-xs font-semibold">No {isTablet ? "Tablet" : "Phone"} screens in project</p>
                      <p className="text-[10px] mt-0.5">Add an {isTablet ? "Android Tablet" : "Android Phone"} set in the editor to preview it here.</p>
                    </div>
                  ) : (
                    <div
                      ref={scrollRef}
                      className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin"
                    >
                      {screens.map((screen) => {
                        const sW = screen.width || (isTablet ? 1848 : 1344);
                        const sH = screen.height || (isTablet ? 2960 : 2992);
                        const ratio = sH / sW;
                        const cardH = baseCardHeight;
                        const cardW = Math.round(baseCardHeight / ratio);

                        return (
                          <div
                            key={screen.id}
                            className="snap-start shrink-0 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-lg transition-transform hover:scale-[1.01] bg-card/60"
                            style={{ width: `${cardW}px`, height: `${cardH}px` }}
                          >
                            <ScreenThumbnailCanvas
                              screen={screen}
                              screenSet={activeSet}
                              width={cardW}
                              height={cardH}
                              activeLang={selectedLang}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* About this app */}
                <div className="space-y-1">
                  <span className="text-xs font-bold">About this app</span>
                  <p className={cn("text-[11px] leading-relaxed", storeTheme === "dark" ? "text-zinc-400" : "text-zinc-600")}>
                    Create stunning screenshots, mockups, and store listing visuals in seconds with native 3D device frames and panoramic flow.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
