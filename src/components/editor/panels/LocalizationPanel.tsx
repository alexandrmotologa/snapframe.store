"use client";

import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { useLanguageStore, getLang, SUPPORTED_LANGUAGES } from "@/lib/store/languageStore";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextLayer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Globe, Sparkles, Copy, Check, Plus, X, ChevronDown, Lock } from "lucide-react";
import { AICaptionsModal } from "@/components/editor/AICaptionsModal";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

export function LocalizationPanel() {
  const { getActiveSet, getActiveScreen, updateLayerLocalization, clearLayerLocalization } =
    useEditorStore();
  const { projectLanguages, activeLang, setActiveLang, addLanguage, removeLanguage } = useLanguageStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const isGuest = Boolean(user && user.isAnonymous);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [showAI, setShowAI] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = getActiveSet();
  const screen = getActiveScreen();

  const textLayers = (screen?.layers ?? []).filter(
    (l): l is TextLayer => l.type === "text"
  );

  const available = SUPPORTED_LANGUAGES.filter(
    (l) => !projectLanguages.includes(l.code) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
       l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
       l.code.toLowerCase().includes(search.toLowerCase()))
  );

  const copyOriginalToAll = (layer: TextLayer) => {
    projectLanguages.filter(l => l !== "en").forEach((lang) => {
      if (!screen?.localizations?.[lang]?.[layer.id]?.content) {
        updateLayerLocalization(set!.id, screen!.id, layer.id, lang, layer.content);
      }
    });
    setCopiedId(layer.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Languages List */}
      <div className="shrink-0 p-3 border-b border-border/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Project Languages
          </div>
          {/* Add language button */}
          <div className="relative shrink-0" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className={cn(
                "flex items-center gap-0.5 h-6 px-2 rounded-md text-[11px] font-medium transition-all",
                showPicker
                  ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
              <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", showPicker && "rotate-180")} />
            </button>

            {showPicker && (
              <div className="absolute top-full right-0 mt-1 w-60 bg-card border border-border/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                {/* Search */}
                <div className="p-2 border-b border-border/40">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search languages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/70 border border-border/30 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {/* Language list */}
                <div className="max-h-52 overflow-y-auto p-1">
                  {available.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      {search ? "No languages found" : "All languages added"}
                    </p>
                  ) : (
                    available.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          addLanguage(lang.code);
                          setActiveLang(lang.code);
                          setShowPicker(false);
                          setSearch("");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-secondary transition-colors text-left"
                      >
                        <span className="text-base shrink-0">{lang.flag}</span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-foreground truncate">{lang.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{lang.nativeName}</span>
                        </div>
                        <span className="text-muted-foreground font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 border border-border/40 shrink-0">{lang.code}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Language Tabs */}
        <HorizontalScrollRail className="pb-1">
          {projectLanguages.map((code) => {
            const lang = getLang(code);
            const isActive = activeLang === code;
            return (
              <div key={code} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveLang(code)}
                  className={cn(
                    "flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-indigo-500 text-white shadow-xs font-semibold"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <span>{lang?.flag}</span>
                  <span className="uppercase">{code}</span>
                </button>
                {code !== "en" && (
                  <button
                    type="button"
                    onClick={() => {
                      removeLanguage(code);
                      if (activeLang === code) setActiveLang("en");
                    }}
                    className="w-4 h-6 -ml-0.5 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title={`Remove ${lang?.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </HorizontalScrollRail>
      </div>

      {(!set || !screen) ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground p-6 text-center">
          <Globe className="w-8 h-8 opacity-30" />
          <p className="text-sm">No screen selected</p>
        </div>
      ) : textLayers.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground p-6 text-center">
          <Globe className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">No text layers found</p>
          <p className="text-xs">Add text layers to this screen first, then translate them here.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            {textLayers.map((layer) => {
              const currentLang = activeLang === "en" ? "en" : activeLang;
              const localized = currentLang !== "en"
                ? (screen.localizations?.[currentLang]?.[layer.id]?.content ?? "")
                : layer.content;

              const hasTranslation = currentLang !== "en" &&
                !!screen.localizations?.[currentLang]?.[layer.id]?.content;

              return (
                <div key={layer.id} className="space-y-1.5">
                  {/* Layer label */}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate max-w-32">
                      {layer.content.split("\n")[0].substring(0, 20) || "Text layer"}
                    </p>
                    {currentLang !== "en" && (
                      <div className="flex items-center gap-1">
                        {!hasTranslation && (
                          <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1">
                            Missing
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => copyOriginalToAll(layer)}
                          title="Copy original to all languages"
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {copiedId === layer.id
                            ? <Check className="w-3 h-3 text-green-400" />
                            : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* EN base (read-only reference) */}
                  {currentLang !== "en" && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/20 text-xs text-muted-foreground font-mono leading-relaxed">
                      🇺🇸 {layer.content || <em>empty</em>}
                    </div>
                  )}

                  {/* Translation field */}
                  <div className="relative">
                    <textarea
                      rows={Math.min(4, (localized.split("\n").length || 1) + 1)}
                      value={localized}
                      placeholder={currentLang === "en" ? "Enter English text..." : `Translate to ${getLang(currentLang)?.nativeName ?? currentLang}...`}
                      onChange={(e) =>
                        updateLayerLocalization(set.id, screen.id, layer.id, currentLang, e.target.value)
                      }
                      onFocus={(e) => {
                        if (currentLang !== "en" && !localized) e.target.value = layer.content;
                      }}
                      className={cn(
                        "w-full px-2.5 py-1.5 rounded-lg text-xs outline-none resize-none leading-relaxed transition-all",
                        "bg-secondary/60 border text-foreground placeholder:text-muted-foreground",
                        hasTranslation || currentLang === "en"
                          ? "border-indigo-500/30 focus:border-indigo-500/50"
                          : "border-border/40 hover:border-border/70 focus:border-indigo-500/50"
                      )}
                    />
                    {hasTranslation && currentLang !== "en" && (
                      <button
                        type="button"
                        onClick={() => clearLayerLocalization(set.id, screen.id, layer.id, currentLang)}
                        className="absolute top-1 right-1 text-[9px] text-muted-foreground hover:text-destructive transition-colors px-1 rounded bg-secondary/80 backdrop-blur"
                      >
                        clear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* AI Generate Action */}
      <div className="shrink-0 p-3 border-t border-border/30">
        <button
          type="button"
          onClick={() => {
            if (isGuest) {
              setAuthModalOpen(true);
              toast.info("AI Captions & Auto-Translate is for registered accounts. Sign in with Google or GitHub (100% Free) to unlock.");
              return;
            }
            setShowAI(true);
          }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isGuest
              ? "bg-secondary/60 text-muted-foreground border-amber-500/30 hover:border-amber-500/60"
              : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/30"
          }`}
          title={isGuest ? "AI Captions & Auto-Translate (Sign in to unlock)" : "AI Captions & Auto-Translate"}
        >
          {isGuest ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-bold">AI Captions &amp; Translate</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">Registered only</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>AI Captions &amp; Auto-Translate</span>
            </>
          )}
        </button>
      </div>

      {showAI && (
        <AICaptionsModal onClose={() => setShowAI(false)} />
      )}
    </div>
  );
}
