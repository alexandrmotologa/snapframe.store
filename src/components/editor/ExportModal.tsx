"use client";

import { useState, useEffect } from "react";
import { X, Download, Package, Loader2, CheckCircle2, Apple, Smartphone, Globe, Copy, ShieldCheck, FileText, Check, Film, Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEditorStore } from "@/lib/store/editorStore";
import { useProjectStore } from "@/lib/store/projectStore";
import { useLanguageStore, getLang } from "@/lib/store/languageStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import type { TextLayer, ShapeLayer, ImageLayer } from "@/lib/types";
import { renderScreenToCanvas } from "@/lib/renderScreenToCanvas";
import { cn } from "@/lib/utils";
import { AppleStoreIcon, GooglePlayIcon, APP_STORE_LABEL, GOOGLE_PLAY_LABEL } from "@/components/icons/StoreIcons";
import { ALL_DEVICES, isTabletDevice } from "@/lib/devices";

interface ExportModalProps {
  projectId: string;
  onClose: () => void;
  onOpenGifStudio?: () => void;
  onOpenAssetsStudio?: () => void;
}

type ScaleOption = 1 | 2 | 3;
type FormatOption = "png" | "jpg" | "webp";

export function ExportModal({ projectId, onClose, onOpenGifStudio, onOpenAssetsStudio }: ExportModalProps) {
  const { screenSets, activeScreenId } = useEditorStore();
  const { projects } = useProjectStore();
  const { projectLanguages, activeLang } = useLanguageStore();
  const { user, isPro, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore();
  const isGuest = Boolean(!user || user.isAnonymous);

  const project = projects.find((p) => p.id === projectId);
  const appName = project?.name ?? "SnapFrame";

  const [scale, setScale] = useState<ScaleOption>(1);
  const [format, setFormat] = useState<FormatOption>("png");
  const [includeFastlane, setIncludeFastlane] = useState<boolean>(isPro);
  const [selectedSets, setSelectedSets] = useState<Set<string>>(
    new Set(screenSets.map((ss) => ss.id))
  );
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(
    new Set(projectLanguages)
  );
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [done, setDone] = useState(false);
  const [exportedCount, setExportedCount] = useState(0);

  // Free tier can only export 1 platform and up to 3 screens per set in 1 language
  const activeSets = isPro ? screenSets.filter((ss) => selectedSets.has(ss.id)) : [screenSets.find((ss) => selectedSets.has(ss.id)) || screenSets[0]].filter(Boolean);
  const activeLangs = isPro ? Array.from(selectedLangs) : [activeLang || "en"];
  const maxScreensPerSet = isPro ? 10 : 3;
  const screensPerLang = activeSets.reduce((acc, ss) => acc + Math.min(ss.screens.length, maxScreensPerSet), 0);
  const totalScreens = screensPerLang * Math.max(activeLangs.length, 1);

  const toggleSet = (id: string) => {
    if (!isPro && screenSets.length > 1) {
      // Free users can select which single platform to export
      setSelectedSets(new Set([id]));
      return;
    }
    setSelectedSets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleLang = (code: string) => {
    if (!isPro) {
      toast.info("Multi-language batch export requires SnapFrame Pro.");
      return;
    }
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size > 1) next.delete(code); // keep at least 1
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // ── 1-Click Copy Active Screen to Clipboard ────────────────────────────────
  const handleCopyActiveScreen = async () => {
    try {
      setIsCopying(true);
      const targetSet = activeSets[0] || screenSets[0];
      const targetScreen = targetSet?.screens.find((s) => s.id === activeScreenId) || targetSet?.screens[0];
      if (!targetScreen || !targetSet) {
        toast.error("No screen found to copy.");
        return;
      }

      const targetIndex = targetSet.screens.findIndex((s) => s.id === targetScreen.id);
      if (targetIndex >= 3 && !isPro) {
        if (isGuest) {
          setAuthModalOpen(true);
          toast.info("Free accounts can copy or export up to 3 screens. Sign in with Google or GitHub to upgrade to Pro for all 10 screens!");
        } else {
          setUpgradeModalOpen(true);
          toast.info("Copying screens beyond screen 3 requires SnapFrame Pro. Upgrade to unlock all 10 screens & master exports!");
        }
        return;
      }

      const canvas = document.createElement("canvas");
      await renderScreenToCanvas(canvas, targetScreen, targetSet, {
        scale: isPro ? 2 : 1,
        activeLang: activeLang || "en",
        isExport: true,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
      if (!blob) {
        toast.error("Failed to generate image.");
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Active screen PNG copied to clipboard!");
    } catch (err) {
      toast.error("Clipboard permission not granted by browser.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleExport = async () => {
    if (typeof window === "undefined") return;

    if (isGuest) {
      setAuthModalOpen(true);
      toast.info("Sign in with Google or GitHub (100% Free) to download your screenshot ZIP package.");
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setDone(false);
    setExportedCount(0);

    // Dynamically import JSZip
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let JSZipClass: any = null;
    try {
      const mod = await import("jszip");
      JSZipClass = mod.default;
    } catch {
      // JSZip not available
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zip: any = JSZipClass ? new JSZipClass() : null;
    let exported = 0;

    for (const ss of activeSets) {
      const isIOS = ss.store === "ios";
      const isTablet = isTabletDevice(ss.deviceId);

      // Clean, unambiguous folder names distinguishing iPhones, iPads, and Android Tablets:
      const platformFolderLabel = isIOS
        ? isTablet ? "App Store (iPad)" : "App Store (iPhone)"
        : isTablet ? "Google Play (Tablet)" : "Google Play (Phone)";
      
      const filePrefix = isIOS
        ? isTablet ? "iPad" : "iPhone"
        : isTablet ? "Android_Tablet" : "Android_Phone";

      const platformFolder = zip?.folder(platformFolderLabel);
      const screensToExport = isPro ? ss.screens : ss.screens.slice(0, 3);

      for (const langCode of (activeLangs.length > 0 ? activeLangs : ["en"])) {
        const langFolder = activeLangs.length > 1 ? platformFolder?.folder(langCode.toUpperCase()) : platformFolder;

        for (const screen of screensToExport) {
          const canvas = document.createElement("canvas");
          await renderScreenToCanvas(canvas, screen, ss, {
            scale: isPro ? scale : Math.min(scale, 2) as ScaleOption,
            activeLang: langCode,
            isExport: true,
          });

          // ── Generate file ─────────────────────────────────────────────────────
          const mimeType = format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
          const quality = format === "jpg" ? 0.92 : 1;
          const screenNum = String(ss.screens.indexOf(screen) + 1).padStart(2, "0");
          const langSuffix = activeLangs.length > 1 ? `_${langCode.toUpperCase()}` : "";
          const effectiveScale = isPro ? scale : Math.min(scale, 2);
          const filename = `${appName}_${filePrefix}_${screenNum}${langSuffix}@${effectiveScale}x.${format}`;

          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), mimeType, quality)
          );

          if (zip && langFolder) {
            langFolder.file(filename, blob);
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          }

          exported++;
          setExportedCount(exported);
          setProgress(Math.round((exported / totalScreens) * 100));
          await new Promise((r) => setTimeout(r, 30));
        }
      }
    }

    // ── Include Store Listing & Fastlane Metadata Package (Pro Only) ────────
    if (zip && includeFastlane && isPro) {
      const fastlaneFolder = zip.folder("fastlane")?.folder("metadata");
      const storeListingFolder = zip.folder("store_listing");
      const langsToExport = activeLangs.length > 0 ? activeLangs : ["en"];
      const storeListingData = project?.storeListing || {};

      const fullListingExport: Record<string, any> = {};

      langsToExport.forEach((lang) => {
        const langKey = lang.toLowerCase();
        const langUpper = lang.toUpperCase();
        const langListing = (storeListingData[lang] || storeListingData["en"] || {}) as {
          ios?: Record<string, string>;
          android?: Record<string, string>;
        };

        const iosName = langListing?.ios?.name || project?.name || "";
        const iosSubtitle = langListing?.ios?.subtitle || "";
        const iosDescription = langListing?.ios?.description || "";
        const iosPromo = langListing?.ios?.promotionalText || "";
        const iosKeywords = (langListing?.ios as { keywords?: string })?.keywords || "";
        const iosWhatsNew = langListing?.ios?.whatsNew || "";

        const androidTitle = langListing?.android?.title || project?.name || "";
        const androidShort = langListing?.android?.shortDescription || "";
        const androidFull = langListing?.android?.fullDescription || "";
        const androidWhatsNew = langListing?.android?.whatsNew || "";

        fullListingExport[langKey] = {
          ios: {
            name: iosName,
            subtitle: iosSubtitle,
            description: iosDescription,
            promotionalText: iosPromo,
            keywords: iosKeywords,
            whatsNew: iosWhatsNew,
          },
          android: {
            title: androidTitle,
            shortDescription: androidShort,
            fullDescription: androidFull,
            whatsNew: androidWhatsNew,
          },
        };

        // 1. Fastlane App Store structure
        const iosMeta = fastlaneFolder?.folder(langUpper);
        iosMeta?.file("name.txt", iosName);
        iosMeta?.file("subtitle.txt", iosSubtitle);
        iosMeta?.file("description.txt", iosDescription);
        iosMeta?.file("promotional_text.txt", iosPromo);
        iosMeta?.file("keywords.txt", iosKeywords);
        iosMeta?.file("release_notes.txt", iosWhatsNew);

        // 2. Fastlane Google Play structure
        const androidMeta = fastlaneFolder?.folder("android")?.folder(langUpper);
        androidMeta?.file("title.txt", androidTitle);
        androidMeta?.file("short_description.txt", androidShort);
        androidMeta?.file("full_description.txt", androidFull);
        androidMeta?.folder("changelogs")?.file("default.txt", androidWhatsNew);

        // 3. Human-readable text files for easy manual copy-paste
        const appStoreText = [
          `==================================================`,
          `  APP STORE CONNECT METADATA (${langUpper})`,
          `==================================================`,
          ``,
          `[App Name] (Max 30 chars):`,
          iosName,
          ``,
          `[Subtitle] (Max 30 chars):`,
          iosSubtitle,
          ``,
          `[Promotional Text] (Max 170 chars):`,
          iosPromo,
          ``,
          `[Keywords] (Max 100 chars):`,
          iosKeywords,
          ``,
          `[What's New / Release Notes]:`,
          iosWhatsNew,
          ``,
          `[Description] (Max 4000 chars):`,
          iosDescription,
          ``,
        ].join("\n");

        const googlePlayText = [
          `==================================================`,
          `  GOOGLE PLAY CONSOLE METADATA (${langUpper})`,
          `==================================================`,
          ``,
          `[App Title] (Max 30 chars):`,
          androidTitle,
          ``,
          `[Short Description] (Max 80 chars):`,
          androidShort,
          ``,
          `[What's New / Release Notes] (Max 500 chars):`,
          androidWhatsNew,
          ``,
          `[Full Description] (Max 4000 chars):`,
          androidFull,
          ``,
        ].join("\n");

        storeListingFolder?.file(`App_Store_Listing_${langUpper}.txt`, appStoreText);
        storeListingFolder?.file(`Google_Play_Listing_${langUpper}.txt`, googlePlayText);
      });

      // JSON Dump for programmatic automation
      storeListingFolder?.file("store_listing.json", JSON.stringify(fullListingExport, null, 2));

      // metadata.json manifest in zip root
      zip.file("metadata.json", JSON.stringify({
        appName,
        exportedAt: new Date().toISOString(),
        scale,
        format,
        sets: activeSets.map((s) => ({
          name: s.name,
          store: s.store,
          deviceId: s.deviceId,
          isTablet: isTabletDevice(s.deviceId),
          resolution: `${(s.preset?.width ?? 1290) * scale}x${(s.preset?.height ?? 2796) * scale}`,
          screensCount: s.screens.length,
        })),
        languages: langsToExport,
        storeListing: fullListingExport,
        totalScreens: exported,
        guidelinesCompliant: true,
      }, null, 2));
    }

    if (zip) {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${appName}_screenshots_@${scale}x.zip`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setDone(true);
    setIsExporting(false);
    toast.success(`Exported ${exported} screenshots successfully!`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 id="export-modal-title" className="font-semibold text-base">Export Screenshots</h2>
              <p className="text-xs text-muted-foreground">{appName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
          {/* Tier Status Banner */}
          {isGuest ? (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 flex-1">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Guest Mode (Unregistered)</span>
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer transition-colors"
                  >
                    Sign In Free
                  </button>
                </div>
                <p className="text-[11px] text-amber-300/80 leading-tight">
                  Clipboard PNG copy is 100% free. Sign in with Google or GitHub (Free) to download complete ZIP packages.
                </p>
              </div>
            </div>
          ) : !isPro ? (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 flex-1">
                <div className="flex items-center justify-between font-bold text-indigo-300">
                  <span>Free Starter Tier (3 Screens / 1 Platform)</span>
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white font-bold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" /> Upgrade Pro
                  </button>
                </div>
                <p className="text-[11px] text-indigo-300/80 leading-tight">
                  Free plan exports up to 3 screens for 1 device. Upgrade to Pro for all 10 screens, Multi-Platform ZIP (iOS + iPad + Android), 40+ languages &amp; Fastlane package.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <Crown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <span>SnapFrame Pro Studio (Full Access)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">UNLIMITED</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-tight">
                  Full 10-screen multi-platform export, batch 40+ languages, Fastlane suite &amp; 4K lossless master resolution unlocked.
                </p>
              </div>
            </div>
          )}

          {/* Platform selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Target Platforms &amp; Devices</p>
              {!isPro && screenSets.length > 1 && (
                <span className="text-[10px] text-muted-foreground">Select 1 platform (Pro for Multi-Platform ZIP)</span>
              )}
            </div>
            <div className="space-y-2">
              {screenSets.map((ss) => {
                const isSelected = selectedSets.has(ss.id);
                const isIOS = ss.store === "ios";
                const isTablet = isTabletDevice(ss.deviceId);
                const deviceObj = ALL_DEVICES.find((d) => d.id === ss.deviceId);

                const platformTitle = isIOS
                  ? isTablet ? "App Store (iPad Pro)" : "App Store (iPhone)"
                  : isTablet ? "Google Play (Tablet)" : "Google Play (Phone)";

                return (
                  <button
                    key={ss.id}
                    onClick={() => toggleSet(ss.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm transition-all text-left cursor-pointer",
                      isSelected
                        ? isIOS
                          ? isTablet
                            ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                            : "border-blue-500/40 bg-blue-500/10 text-blue-300"
                          : isTablet
                          ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    )}
                  >
                    {isIOS ? (
                      <AppleStoreIcon className="w-4 h-4 shrink-0 text-foreground" />
                    ) : (
                      <GooglePlayIcon className="w-4 h-4 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{platformTitle}</span>
                        {isTablet && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Tablet
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-70 font-mono">
                        {deviceObj?.name || ss.preset?.name} · {ss.preset?.width} × {ss.preset?.height} px ({isPro ? ss.screens.length : Math.min(ss.screens.length, 3)} {isPro ? "screens" : "of " + ss.screens.length + " screens"})
                      </p>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                      isSelected ? (isIOS ? "border-blue-400 bg-blue-400" : "border-emerald-400 bg-emerald-400") : "border-border"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language selection */}
          {projectLanguages.length > 1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground">Export Languages</p>
                </div>
                {!isPro && (
                  <span className="text-[10px] text-muted-foreground">Active language only (Pro for Batch 40+ Languages)</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {projectLanguages.map((code) => {
                  const lang = getLang(code);
                  const isSelected = isPro ? selectedLangs.has(code) : code === activeLang;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleLang(code)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-xs"
                          : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60"
                      )}
                    >
                      <span>{lang?.flag ?? "🌐"}</span>
                      <span className="uppercase font-bold">{code}</span>
                      {!isPro && code !== activeLang && <Crown className="w-2.5 h-2.5 text-amber-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scale + Format row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">Resolution Scale</p>
                {!isPro && <span className="text-[10px] text-muted-foreground">@3x is Pro</span>}
              </div>
              <div className="flex gap-1.5">
                {([1, 2, 3] as ScaleOption[]).map((s) => {
                  const isLocked = !isPro && s === 3;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeModalOpen(true);
                          toast.info("4K Lossless @3x exports require SnapFrame Pro.");
                          return;
                        }
                        setScale(s);
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1",
                        scale === s
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/60 hover:bg-secondary border-border/40 text-muted-foreground"
                      )}
                    >
                      <span>@{s}x</span>
                      {isLocked && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Image Format</p>
              <div className="flex gap-1.5">
                {(["png", "jpg", "webp"] as FormatOption[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer",
                      format === f
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 hover:bg-secondary border-border/40 text-muted-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fastlane Package Option */}
          <div
            onClick={() => {
              if (!isPro) {
                setUpgradeModalOpen(true);
                toast.info("Fastlane & Store Listing metadata export is a SnapFrame Pro feature.");
                return;
              }
              setIncludeFastlane(!includeFastlane);
            }}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors text-xs select-none",
              includeFastlane && isPro ? "border-indigo-500/40 bg-indigo-500/10" : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <input
              type="checkbox"
              checked={includeFastlane && isPro}
              readOnly
              className="w-4 h-4 rounded-md accent-primary pointer-events-none"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Include Store Listing &amp; Fastlane Metadata Package</span>
                </div>
                {!isPro && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Generates ready-to-use Title, Subtitle, Descriptions, and What&apos;s New in both Fastlane &amp; human-readable .txt files</p>
            </div>
          </div>

          {/* Video / Animated GIF Studio Shortcut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onOpenAssetsStudio && (
              <button
                type="button"
                onClick={() => {
                  if (isGuest) {
                    setAuthModalOpen(true);
                    toast.info("App Icon Studio requires a free account.");
                    return;
                  }
                  onClose();
                  onOpenAssetsStudio();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground group-hover:text-purple-500 transition-colors">
                      Icon &amp; Feature Graphic
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      App icons, 1024×500 banner &amp; Xcode
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-500 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 shrink-0">
                  Open →
                </span>
              </button>
            )}

            {onOpenGifStudio && (
              <button
                type="button"
                onClick={() => {
                  if (isGuest) {
                    setAuthModalOpen(true);
                    toast.info("Video Studio requires a free account.");
                    return;
                  }
                  onClose();
                  onOpenGifStudio();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground group-hover:text-pink-500 transition-colors">
                      Video / GIF Studio
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      TikTok &amp; social animated reels
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-pink-500 px-1.5 py-0.5 rounded-md bg-pink-500/10 border border-pink-500/20 shrink-0">
                  Open →
                </span>
              </button>
            )}
          </div>

          {/* Export summary */}
          <div className="px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">
                <span className="font-bold text-primary text-sm mr-1">{totalScreens}</span> screenshots ready to export
              </span>
              <span className="font-mono text-muted-foreground font-semibold px-2 py-0.5 rounded-md bg-background border border-border/50">
                {((activeSets[0]?.preset?.width ?? 1290) * scale)} × {((activeSets[0]?.preset?.height ?? 2796) * scale)} px
              </span>
            </div>
            {isPro && activeLangs.length > 1 && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {screensPerLang} screens × {activeLangs.length} languages → organized in localized ZIP subfolders
              </p>
            )}
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Exporting {exportedCount} / {totalScreens}...</span>
                <span className="font-mono tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Export complete! Check your downloads folder.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              type="button"
              className="gap-1.5 text-xs"
              onClick={handleCopyActiveScreen}
              disabled={isCopying || isExporting}
              title="Copy active screen directly to clipboard as high-resolution PNG"
            >
              {isCopying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy PNG</span>
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isExporting}>
              {done ? "Close" : "Cancel"}
            </Button>
            <Button
              className={cn("flex-1 gap-2", isPro && "bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white")}
              onClick={handleExport}
              disabled={isExporting || totalScreens === 0}
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
              ) : isGuest ? (
                <><Lock className="w-4 h-4" /> Sign In to Export ZIP</>
              ) : isPro ? (
                <><Crown className="w-4 h-4 text-amber-300" /> Export Pro ZIP ({totalScreens})</>
              ) : (
                <><Package className="w-4 h-4" /> Export Free ZIP ({totalScreens})</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
