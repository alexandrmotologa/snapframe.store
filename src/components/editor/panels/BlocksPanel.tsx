"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/lib/store/editorStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Star,
  Award,
  Users,
  ShieldCheck,
  Bell,
  Search,
  Layers,
  TrendingUp,
  Flame,
  Smartphone,
  PenTool,
  Tag,
  MessageSquare,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/lib/store/toastStore";
import { nanoid } from "@/lib/utils";
import { Layer } from "@/lib/types";
import { HorizontalScrollRail } from "@/components/ui/horizontal-scroll-rail";

interface BlockPreset {
  id: string;
  name: string;
  category: string;
  keywords?: string[];
  preview: React.ReactNode;
  getLayers: (screenW: number, screenH: number) => Array<Omit<Layer, "id">>;
}

// ── 1. SOCIAL PROOF & RATINGS ────────────────────────────────────────────────
const SOCIAL_PROOF_PRESETS: BlockPreset[] = [
  {
    id: "rating-gold",
    name: "4.9★ Rating Pill",
    category: "social-proof",
    keywords: ["rating", "stars", "gold", "reviews", "social proof", "app score"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-white shadow-xs">
        <span className="text-amber-400 font-bold text-xs">★★★★★</span>
        <span className="text-[11px] font-semibold text-slate-100">4.9 (100k+)</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.78);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "rating-badge",
        text: "4.9 (100k+)",
        subtext: "★★★★★",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(245,158,11,0.5)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "award-pill",
    name: "#1 App of the Day",
    category: "social-proof",
    keywords: ["award", "number 1", "app of the day", "trophy", "top"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/90 border border-amber-400/40 text-amber-300 shadow-xs">
        <Award className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-bold">#1 App of the Day</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.76);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "award-badge",
        text: "#1 App of the Day",
        subtext: "🏆",
        fill: "#1e1b4b",
        stroke: "rgba(251,191,36,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "users-pill",
    name: "1M+ Active Users",
    category: "social-proof",
    keywords: ["users", "community", "audience", "active users", "growth"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-xs">
        <Users className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold">1,000,000+ Users</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.78);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "users-badge",
        text: "1,000,000+ Users",
        subtext: "👥",
        fill: "rgba(6,78,59,0.85)",
        stroke: "rgba(16,185,129,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "security-pill",
    name: "100% Private & Secure",
    category: "social-proof",
    keywords: ["security", "privacy", "encrypted", "safe", "lock", "shield"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 shadow-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold">End-to-End Encrypted</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.80);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "security-badge",
        text: "100% Private & Secure",
        subtext: "🔒",
        fill: "rgba(30,58,138,0.85)",
        stroke: "rgba(59,130,246,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 2. IOS WIDGETS & DYNAMIC ISLAND ──────────────────────────────────────────
const UI_WIDGET_PRESETS: BlockPreset[] = [
  {
    id: "dynamic-island-music",
    name: "iOS Dynamic Island (Music)",
    category: "ios-widgets",
    keywords: ["dynamic island", "apple", "ios 16", "ios 17", "music", "now playing", "capsule"],
    preview: (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black border border-white/20 text-white shadow-xs">
        <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center text-[10px]">🎵</div>
        <span className="text-[11px] font-semibold text-slate-100 truncate max-w-[150px]">Now Playing · Starboy</span>
        <div className="flex items-end gap-0.5 h-3 ml-auto pr-1">
          <div className="w-0.5 h-2 bg-emerald-400 rounded-full" />
          <div className="w-0.5 h-3 bg-emerald-400 rounded-full" />
          <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full" />
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.84);
      const h = Math.round(sw * 0.15);
      return [{
        type: "shape",
        shape: "dynamic-island",
        text: "Now Playing · Starboy",
        fill: "#000000",
        stroke: "rgba(255,255,255,0.15)",
        strokeWidth: 2,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "live-activity-workout",
    name: "iOS Live Activity (Workout)",
    category: "ios-widgets",
    keywords: ["live activity", "workout", "lockscreen", "widget", "fitness", "ios 16", "ios 17"],
    preview: (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/15 text-white shadow-xs">
        <div className="w-5 h-5 rounded-md bg-orange-600 flex items-center justify-center text-xs">🏃</div>
        <div className="flex flex-col text-left">
          <div className="text-[11px] font-bold text-white leading-tight">Workout in progress</div>
          <div className="text-[9.5px] text-sky-400 font-medium">32:15 min · 420 kcal 🔥</div>
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.88);
      const h = Math.round(sw * 0.25);
      return [{
        type: "shape",
        shape: "live-activity",
        text: "Workout in progress",
        subtext: "32:15 min · 420 kcal 🔥",
        fill: "rgba(15,23,42,0.95)",
        stroke: "rgba(255,255,255,0.15)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.04),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "magnifier-loupe-zoom",
    name: "🔍 2.5x Zoom Magnifier Lens",
    category: "ios-widgets",
    keywords: ["magnifier", "loupe", "zoom", "lens", "focus", "callout", "inspect", "detail"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/50 text-white shadow-xs">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-400 bg-indigo-500/20 flex items-center justify-center text-[10px]">🔍</div>
        <span className="text-[11px] font-bold text-indigo-300">2.5x Zoom Lens</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const size = Math.round(sw * 0.44);
      return [{
        type: "shape",
        shape: "magnifier-loupe",
        text: "2.5x Zoom",
        fill: "rgba(255,255,255,0.12)",
        stroke: "#818cf8",
        strokeWidth: 8,
        cornerRadius: Math.round(size / 2),
        x: Math.round((sw - size) / 2),
        y: Math.round(sh * 0.42),
        width: size,
        height: size,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "notification-banner",
    name: "iOS Notification Banner",
    category: "ios-widgets",
    keywords: ["notification", "banner", "push", "message", "ios alert", "snapframe"],
    preview: (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-white shadow-xs">
        <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
          <Bell className="w-3 h-3 text-blue-400" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
            <span className="font-semibold text-slate-200">SnapFrame</span>
            <span>·</span>
            <span>now</span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-100">
            Workout complete! +250 XP 🎉
          </span>
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.88);
      const h = Math.round(sw * 0.20);
      return [{
        type: "shape",
        shape: "notification-badge",
        text: "Workout complete! +250 XP earned 🎉",
        subtext: "SnapFrame · now",
        fill: "rgba(255,255,255,0.96)",
        stroke: "rgba(255,255,255,0.4)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.035),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "ios-toggle-card",
    name: "iOS Smart Toggle Switch",
    category: "ios-widgets",
    keywords: ["toggle", "switch", "settings", "control center", "ai", "smart"],
    preview: (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-white leading-tight">AI Smart Assistant</span>
            <span className="text-[9px] text-slate-400 leading-tight">Active & Listening</span>
          </div>
        </div>
        <div className="w-8 h-4 rounded-full bg-emerald-500 flex items-center justify-end px-0.5">
          <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.86);
      const h = Math.round(sw * 0.20);
      return [{
        type: "shape",
        shape: "ios-toggle",
        text: "AI Smart Assistant",
        subtext: "Active & Listening",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(255,255,255,0.12)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.035),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "search-widget",
    name: "iOS Spotlight Search Bar",
    category: "ios-widgets",
    keywords: ["search", "spotlight", "bar", "input", "query", "find"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-300 shadow-xs">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-medium text-slate-200">Search songs, artists...</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.86);
      const h = Math.round(sw * 0.13);
      return [{
        type: "shape",
        shape: "search-badge",
        text: "Search songs, artists, albums...",
        subtext: "🔍",
        fill: "rgba(255,255,255,0.18)",
        stroke: "rgba(255,255,255,0.35)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "glow-orb-purple",
    name: "Ambient Purple Glow Orb",
    category: "ios-widgets",
    keywords: ["glow", "orb", "purple", "light", "ambient", "backdrop"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 shadow-xs">
        <div className="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
        <span className="text-[11px] font-bold">Ambient Purple Glow</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.95);
      const h = Math.round(sw * 0.95);
      return [{
        type: "shape",
        shape: "glow-orb",
        fill: "#8B5CF6",
        stroke: "transparent",
        strokeWidth: 0,
        cornerRadius: 0,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 0.6,
      } as any];
    },
  },
  {
    id: "glow-orb-cyan",
    name: "Ambient Cyan Glow Orb",
    category: "ios-widgets",
    keywords: ["glow", "orb", "cyan", "light", "ambient", "neon"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-xs">
        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        <span className="text-[11px] font-bold">Ambient Cyan Glow</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.95);
      const h = Math.round(sw * 0.95);
      return [{
        type: "shape",
        shape: "glow-orb",
        fill: "#06B6D4",
        stroke: "transparent",
        strokeWidth: 0,
        cornerRadius: 0,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 0.6,
      } as any];
    },
  },
];

// ── 3. AWARDS & TRUST SEALS ──────────────────────────────────────────────────
const AWARD_PRESETS: BlockPreset[] = [
  {
    id: "editors-choice",
    name: "App Store Editors' Choice",
    category: "awards-trust",
    keywords: ["editors choice", "apple award", "laurel", "gold", "best of 2026", "featured"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/90 border border-amber-400/50 text-amber-300 shadow-xs">
        <span className="text-xs">🌿</span>
        <span className="text-[11px] font-bold text-amber-300">App Store Editors&apos; Choice</span>
        <span className="text-xs">🌿</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.82);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "editors-choice-badge",
        text: "App Store Editors' Choice",
        fill: "#0B132B",
        stroke: "rgba(251,191,36,0.65)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "design-award",
    name: "Apple Design Award Winner",
    category: "awards-trust",
    keywords: ["apple design award", "ada", "design", "winner", "diamond", "trophy"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/30 text-white shadow-xs">
        <span className="text-xs">💎</span>
        <span className="text-[11px] font-bold text-slate-100">Apple Design Award Winner</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.82);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "design-award-badge",
        text: "Apple Design Award Winner",
        fill: "#18181B",
        stroke: "rgba(255,255,255,0.35)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "streak-gamification",
    name: "30-Day Streak (Gamification)",
    category: "awards-trust",
    keywords: ["streak", "fire", "habit", "gamification", "flame", "daily streak", "duolingo style"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600 text-white shadow-xs">
        <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        <span className="text-[11px] font-bold">30-Day Streak · On Fire!</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.78);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "streak-badge",
        text: "30-Day Streak · On Fire!",
        fill: "#EA580C",
        stroke: "rgba(254,215,170,0.5)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "money-back-guarantee",
    name: "30-Day Money Back Guarantee",
    category: "awards-trust",
    keywords: ["guarantee", "refund", "money back", "trust", "shield", "risk free"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 shadow-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold">30-Day Money Back Guarantee</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.84);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "guarantee-badge",
        text: "30-Day Money Back Guarantee",
        fill: "rgba(6,78,59,0.92)",
        stroke: "rgba(52,211,153,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 4. CARDS & CONTAINERS ────────────────────────────────────────────────────
const CONTAINER_PRESETS: BlockPreset[] = [
  {
    id: "glass-card",
    name: "Frosted Glass Feature Card",
    category: "cards-glass",
    keywords: ["glass", "frosted", "container", "blur", "card", "feature"],
    preview: (
      <div
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div className="w-5 h-5 rounded-md bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-cyan-300" />
        </div>
        <div className="flex flex-col text-left">
          <div className="text-[11px] font-bold text-white leading-tight">Ultra Fast & Intuitive</div>
          <div className="text-[9px] text-slate-300/80 leading-tight">Frosted Glass Card</div>
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.88);
      const h = Math.round(sw * 0.38);
      return [{
        type: "shape",
        shape: "glass-card",
        text: "Ultra Fast & Intuitive",
        subtext: "Designed for speed, simplicity, and ease of use.",
        fill: "rgba(255,255,255,0.14)",
        stroke: "rgba(255,255,255,0.25)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.04),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "dark-card",
    name: "Dark OLED Feature Card",
    category: "cards-glass",
    keywords: ["dark", "oled", "card", "container", "black", "feature"],
    preview: (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white shadow-xs">
        <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
          <Layers className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="flex flex-col text-left">
          <div className="text-[11px] font-bold text-white leading-tight">Pro Performance</div>
          <div className="text-[9px] text-slate-400 leading-tight">Dark OLED Card</div>
        </div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.88);
      const h = Math.round(sw * 0.38);
      return [{
        type: "shape",
        shape: "dark-card",
        text: "Pro Performance",
        subtext: "Engineered for power users who demand lightning speed.",
        fill: "rgba(10,14,23,0.90)",
        stroke: "rgba(255,255,255,0.15)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.04),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "pill-pro",
    name: "PRO Feature Tag",
    category: "cards-glass",
    keywords: ["pro", "feature", "tag", "badge", "premium", "indigo"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 border border-indigo-400/50 text-white shadow-xs">
        <span className="text-xs">⚡</span>
        <span className="text-[11px] font-bold">PRO FEATURE</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.52);
      const h = Math.round(sw * 0.14);
      return [{
        type: "shape",
        shape: "pro-tag",
        text: "⚡ PRO FEATURE",
        fill: "#6366F1",
        stroke: "rgba(255,255,255,0.3)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "pill-new",
    name: "NEW Feature Tag",
    category: "cards-glass",
    keywords: ["new", "feature", "tag", "badge", "green", "emerald"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 border border-emerald-400/50 text-white shadow-xs">
        <span className="text-xs">✨</span>
        <span className="text-[11px] font-bold">NEW FEATURE</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.42);
      const h = Math.round(sw * 0.14);
      return [{
        type: "shape",
        shape: "new-tag",
        text: "✨ NEW",
        fill: "#10B981",
        stroke: "rgba(255,255,255,0.3)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "accent-bar",
    name: "Accent Line",
    category: "cards-glass",
    keywords: ["accent", "line", "divider", "separator", "bar"],
    preview: (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xs">
        <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <span className="text-[11px] font-medium text-slate-300">Accent Line</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.40);
      const h = Math.round(sw * 0.035);
      return [{
        type: "shape",
        shape: "rectangle",
        fill: "#6366F1",
        stroke: "transparent",
        strokeWidth: 0,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 5. GROWTH & METRICS ──────────────────────────────────────────────────────
const GROWTH_PRESETS: BlockPreset[] = [
  {
    id: "growth-boost-card",
    name: "+142% Productivity Boost",
    category: "growth-stats",
    keywords: ["growth", "stats", "metric", "productivity", "increase", "chart", "kpi"],
    preview: (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-emerald-400">+142% Boost</span>
            <span className="text-[9px] text-slate-400">Productivity & Speed</span>
          </div>
        </div>
        <div className="text-[10px] text-emerald-400/80 font-mono font-bold">📈 HIGH</div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.86);
      const h = Math.round(sw * 0.22);
      return [{
        type: "shape",
        shape: "growth-stat-card",
        text: "Productivity & Speed Boost",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(16,185,129,0.4)",
        strokeWidth: 3,
        cornerRadius: Math.round(sw * 0.035),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "comparison-tag",
    name: "Before vs After Comparison",
    category: "growth-stats",
    keywords: ["before vs after", "comparison", "contrast", "old vs new", "dual"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-white shadow-xs">
        <span className="text-[10.5px] font-semibold text-rose-400">❌ Without App</span>
        <span className="text-slate-500 text-xs">|</span>
        <span className="text-[10.5px] font-bold text-emerald-400">✨ With Our App</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.88);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "comparison-card",
        text: "With Our App",
        subtext: "Without App",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(255,255,255,0.2)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 6. DOODLES & CALLOUTS ────────────────────────────────────────────────────
const DOODLE_PRESETS: BlockPreset[] = [
  {
    id: "curved-arrow-callout",
    name: "Curved Hand-Drawn Arrow",
    category: "doodles",
    keywords: ["arrow", "doodle", "hand drawn", "curved", "pointer", "look here", "callout"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-xs">
        <span className="text-sm">↗️</span>
        <span className="text-[11px] font-bold">Curved Callout Arrow</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.35);
      const h = Math.round(sw * 0.35);
      return [{
        type: "shape",
        shape: "curved-arrow",
        fill: "#F59E0B",
        stroke: "#F59E0B",
        strokeWidth: 4,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "handwritten-sticky",
    name: "Handwritten Sticky Callout",
    category: "doodles",
    keywords: ["handwritten", "sticky", "note", "callout", "swipe to explore", "marker"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-200 border border-yellow-400 text-yellow-900 shadow-xs">
        <span className="text-xs">✍️</span>
        <span className="text-[11px] font-bold">Swipe to explore ✨</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.65);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "handwritten-callout",
        text: "✨ Swipe to explore",
        fill: "#FEF08A",
        stroke: "#FACC15",
        strokeWidth: 3,
        cornerRadius: Math.round(h * 0.28),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: -4,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "marker-highlight-bar",
    name: "Neon Marker Highlight",
    category: "doodles",
    keywords: ["marker", "highlight", "neon", "yellow", "brush", "underline"],
    preview: (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-xs">
        <div className="w-12 h-2.5 rounded-xs bg-yellow-300/70 skew-x-[-12deg]" />
        <span className="text-[11px] font-medium text-slate-300">Marker Highlight Bar</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.70);
      const h = Math.round(sw * 0.08);
      return [{
        type: "shape",
        shape: "marker-highlight",
        fill: "rgba(250, 204, 21, 0.45)",
        stroke: "transparent",
        strokeWidth: 0,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 0.8,
      } as any];
    },
  },
];

// ── 7. OFFERS, SALES & CTAS ──────────────────────────────────────────────────
const OFFER_PRESETS: BlockPreset[] = [
  {
    id: "sale-50",
    name: "50% OFF Launch Sale",
    category: "offers-ctas",
    keywords: ["sale", "discount", "50% off", "early bird", "price", "promo"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 text-white border border-rose-400/40 shadow-xs">
        <span className="text-xs">🏷️</span>
        <span className="text-[11px] font-bold">50% OFF · Early Bird</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.78);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "sale-badge",
        text: "🏷️ 50% OFF · Early Bird Special",
        fill: "#E11D48",
        stroke: "rgba(255,255,255,0.4)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "trial-cta",
    name: "Free Trial CTA",
    category: "offers-ctas",
    keywords: ["free trial", "try free", "cta", "button", "7 days", "no card"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-indigo-400/40 shadow-xs">
        <span className="text-xs">🚀</span>
        <span className="text-[11px] font-bold">Try Free for 7 Days</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.80);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "trial-badge",
        text: "🚀 Try Free for 7 Days · No Card",
        fill: "#6366F1",
        stroke: "rgba(255,255,255,0.4)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "features-checklist",
    name: "Feature Checklist Pill",
    category: "offers-ctas",
    keywords: ["checklist", "features", "ad free", "offline", "4k", "features pill"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 shadow-xs">
        <span className="text-[10px] font-semibold">✓ Ad-Free · ✓ Offline · ✓ 4K</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.90);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "checklist-badge",
        text: "✓ Ad-Free  ·  ✓ Offline Mode  ·  ✓ 4K Export",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(255,255,255,0.25)",
        strokeWidth: 3,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 8. PRESS & TESTIMONIALS ──────────────────────────────────────────────────
const PRESS_PRESETS: BlockPreset[] = [
  {
    id: "press-quote",
    name: "TechCrunch Press Quote",
    category: "testimonials",
    keywords: ["techcrunch", "press", "media", "quote", "review"],
    preview: (
      <div className="w-full p-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-white">
        <div className="text-[9.5px] font-medium italic text-slate-200 truncate">&quot;The fastest screenshot editor on mobile.&quot;</div>
        <div className="text-[9px] font-bold text-emerald-400 mt-0.5">— TechCrunch</div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.92);
      const h = Math.round(sw * 0.30);
      return [{
        type: "shape",
        shape: "press-badge",
        text: '"The cleanest and fastest screenshot generator on mobile."',
        subtext: "— TechCrunch",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(16,185,129,0.5)",
        strokeWidth: 4,
        cornerRadius: Math.round(sw * 0.035),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "user-review-card",
    name: "5-Star User Testimonial",
    category: "testimonials",
    keywords: ["testimonial", "user review", "5 star", "feedback", "rating"],
    preview: (
      <div className="w-full p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-white">
        <div className="text-amber-400 text-xs font-bold mb-0.5">★★★★★</div>
        <div className="text-[9.5px] font-medium text-slate-200 truncate">&quot;Boosted our App Store conversion by +40%!&quot;</div>
        <div className="text-[8.5px] text-muted-foreground mt-0.5">@alex_dev</div>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.92);
      const h = Math.round(sw * 0.34);
      return [{
        type: "shape",
        shape: "testimonial-badge",
        text: '"Boosted our App Store conversion rate by +40% in just 1 week!"',
        subtext: "Alex Morgan · Lead iOS Developer",
        fill: "rgba(15,23,42,0.92)",
        stroke: "rgba(245,158,11,0.5)",
        strokeWidth: 4,
        cornerRadius: Math.round(sw * 0.035),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "live-counter-pill",
    name: "Live Daily Download Counter",
    category: "testimonials",
    keywords: ["downloads", "counter", "live", "today", "popular", "fire"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 shadow-xs">
        <span className="text-xs">🔥</span>
        <span className="text-[11px] font-bold">2,500+ Today</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.76);
      const h = Math.round(sw * 0.16);
      return [{
        type: "shape",
        shape: "live-counter-badge",
        text: "🔥 2,500+ Downloads Today",
        fill: "rgba(67,20,7,0.92)",
        stroke: "rgba(249,115,22,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(h / 2),
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 9. APP STORE & PLAY STORE BADGES ─────────────────────────────────────────
const BADGE_PRESETS: BlockPreset[] = [
  {
    id: "appstore-dark",
    name: "App Store Badge (Dark)",
    category: "store-badges",
    keywords: ["apple", "app store", "ios badge", "download", "dark"],
    preview: (
      <div className="h-9 flex items-center justify-center p-1 bg-slate-900 rounded-lg border border-border/40">
        <img src="/badges/appstore-dark.svg" alt="App Store Dark" className="h-7 object-contain" />
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.72);
      const h = Math.round(w / (205 / 59));
      return [{
        type: "shape",
        shape: "appstore-dark",
        text: "App Store",
        subtext: "Download on the",
        fill: "#000000",
        width: w,
        height: h,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "appstore-light",
    name: "App Store Badge (Light)",
    category: "store-badges",
    keywords: ["apple", "app store", "ios badge", "download", "light", "white"],
    preview: (
      <div className="h-9 flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border/40">
        <img src="/badges/appstore-light.svg" alt="App Store Light" className="h-7 object-contain" />
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.72);
      const h = Math.round(w / (201 / 59));
      return [{
        type: "shape",
        shape: "appstore-light",
        text: "App Store",
        subtext: "Download on the",
        fill: "#FFFFFF",
        width: w,
        height: h,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "googleplay-dark",
    name: "Google Play Badge (Dark)",
    category: "store-badges",
    keywords: ["google", "play store", "android badge", "download", "dark"],
    preview: (
      <div className="h-9 flex items-center justify-center p-1 bg-slate-900 rounded-lg border border-border/40">
        <img src="/badges/googleplay-dark.svg" alt="Google Play Dark" className="h-7 object-contain" />
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.72);
      const h = Math.round(w / (204 / 59));
      return [{
        type: "shape",
        shape: "googleplay-dark",
        text: "Google Play",
        subtext: "GET IT ON",
        fill: "#000000",
        width: w,
        height: h,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "googleplay-light",
    name: "Google Play Badge (Light)",
    category: "store-badges",
    keywords: ["google", "play store", "android badge", "download", "light", "white"],
    preview: (
      <div className="h-9 flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border/40">
        <img src="/badges/googleplay-light.svg" alt="Google Play Light" className="h-7 object-contain" />
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.72);
      const h = Math.round(w / (201 / 59));
      return [{
        type: "shape",
        shape: "googleplay-light",
        text: "Google Play",
        subtext: "GET IT ON",
        fill: "#FFFFFF",
        width: w,
        height: h,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
  {
    id: "rank-productivity",
    name: "#1 Top Free App Tag",
    category: "store-badges",
    keywords: ["ranked", "top free", "medal", "award", "rank 1"],
    preview: (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-semibold bg-blue-950/80 border border-blue-400/40 shadow-xs">
        <span className="text-xs">🏅</span>
        <span className="text-[11px] font-bold text-white">#1 Top Free App</span>
      </div>
    ),
    getLayers: (sw, sh) => {
      const w = Math.round(sw * 0.76);
      const h = Math.round(sw * 0.18);
      return [{
        type: "shape",
        shape: "ranking-badge",
        text: "🏅 #1 Top Free App",
        fill: "#172554",
        stroke: "rgba(96,165,250,0.6)",
        strokeWidth: 4,
        cornerRadius: Math.round(sw * 0.035),
        width: w,
        height: h,
        x: Math.round((sw - w) / 2),
        y: Math.round((sh - h) / 2),
        rotation: 0,
        opacity: 1,
      } as any];
    },
  },
];

// ── 10. GEOMETRIC SHAPES ─────────────────────────────────────────────────────
const SHAPE_PRESETS: BlockPreset[] = [
  {
    id: "star",
    name: "Star",
    category: "shapes",
    keywords: ["star", "geometric", "shape", "gold", "yellow"],
    preview: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <polygon
          points="24,4 29,18 44,18 32,27 36,42 24,33 12,42 16,27 4,18 19,18"
          fill="#FBBF24"
        />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const size = Math.round(sw * 0.38);
      return [{
        type: "shape", shape: "star", fill: "#FBBF24", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: size, height: size, x: Math.round((sw - size) / 2), y: Math.round((sh - size) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
  {
    id: "triangle",
    name: "Triangle",
    category: "shapes",
    keywords: ["triangle", "geometric", "shape", "indigo"],
    preview: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <polygon points="24,4 44,44 4,44" fill="#6366F1" />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const size = Math.round(sw * 0.38);
      return [{
        type: "shape", shape: "triangle", fill: "#6366F1", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: size, height: size, x: Math.round((sw - size) / 2), y: Math.round((sh - size) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
  {
    id: "hexagon",
    name: "Hexagon",
    category: "shapes",
    keywords: ["hexagon", "polygon", "geometric", "shape", "teal"],
    preview: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <polygon
          points="24,4 40,14 40,34 24,44 8,34 8,14"
          fill="#14B8A6"
        />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const size = Math.round(sw * 0.38);
      return [{
        type: "shape", shape: "hexagon", fill: "#14B8A6", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: size, height: size, x: Math.round((sw - size) / 2), y: Math.round((sh - size) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
  {
    id: "diamond",
    name: "Diamond",
    category: "shapes",
    keywords: ["diamond", "rhombus", "geometric", "pink"],
    preview: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <polygon points="24,4 44,24 24,44 4,24" fill="#EC4899" />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const sizeW = Math.round(sw * 0.34);
      const sizeH = Math.round(sw * 0.40);
      return [{
        type: "shape", shape: "diamond", fill: "#EC4899", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: sizeW, height: sizeH, x: Math.round((sw - sizeW) / 2), y: Math.round((sh - sizeH) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
  {
    id: "crescent",
    name: "Crescent",
    category: "shapes",
    keywords: ["crescent", "moon", "geometric", "amber"],
    preview: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <path d="M 24 4 A 20 20 0 1 1 24 44 A 14 14 0 1 0 24 4 Z" fill="#F59E0B" />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const size = Math.round(sw * 0.38);
      return [{
        type: "shape", shape: "crescent", fill: "#F59E0B", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: size, height: size, x: Math.round((sw - size) / 2), y: Math.round((sh - size) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
  {
    id: "arrowRight",
    name: "Arrow Callout",
    category: "shapes",
    keywords: ["arrow", "pointer", "callout", "indigo"],
    preview: (
      <svg viewBox="0 0 48 20" className="w-12 h-5">
        <polygon points="0,6 29,6 29,0 48,10 29,20 29,14 0,14" fill="#6366F1" />
      </svg>
    ),
    getLayers: (sw, sh) => {
      const sizeW = Math.round(sw * 0.55);
      const sizeH = Math.round(sw * 0.24);
      return [{
        type: "shape", shape: "arrowRight", fill: "#6366F1", stroke: "transparent", strokeWidth: 0, cornerRadius: 0,
        width: sizeW, height: sizeH, x: Math.round((sw - sizeW) / 2), y: Math.round((sh - sizeH) / 2), rotation: 0, opacity: 1,
      } as any];
    },
  },
];

// ── CATEGORY DEFINITIONS ────────────────────────────────────────────────────
interface CategorySection {
  id: string;
  label: string;
  icon: React.ReactNode;
  presets: BlockPreset[];
  isGrid3?: boolean;
}

const CATEGORIES: CategorySection[] = [
  {
    id: "social-proof",
    label: "Social Proof & Ratings",
    icon: <Star className="w-3 h-3 text-amber-500 fill-amber-500" />,
    presets: SOCIAL_PROOF_PRESETS,
  },
  {
    id: "ios-widgets",
    label: "iOS Widgets & Dynamic Island",
    icon: <Smartphone className="w-3 h-3 text-primary" />,
    presets: UI_WIDGET_PRESETS,
  },
  {
    id: "awards-trust",
    label: "Awards, Trust & Streaks",
    icon: <Award className="w-3 h-3 text-amber-400" />,
    presets: AWARD_PRESETS,
  },
  {
    id: "growth-stats",
    label: "Growth Metrics & Comparisons",
    icon: <TrendingUp className="w-3 h-3 text-emerald-400" />,
    presets: GROWTH_PRESETS,
  },
  {
    id: "cards-glass",
    label: "Cards & Glass Containers",
    icon: <Layers className="w-3 h-3 text-cyan-400" />,
    presets: CONTAINER_PRESETS,
  },
  {
    id: "doodles",
    label: "Doodles & Organic Callouts",
    icon: <PenTool className="w-3 h-3 text-yellow-400" />,
    presets: DOODLE_PRESETS,
  },
  {
    id: "offers-ctas",
    label: "Offers, Sales & CTAs",
    icon: <Tag className="w-3 h-3 text-rose-400" />,
    presets: OFFER_PRESETS,
  },
  {
    id: "testimonials",
    label: "Press & User Testimonials",
    icon: <MessageSquare className="w-3 h-3 text-violet-400" />,
    presets: PRESS_PRESETS,
  },
  {
    id: "store-badges",
    label: "Store Badges",
    icon: <CheckCircle2 className="w-3 h-3 text-blue-400" />,
    presets: BADGE_PRESETS,
  },
  {
    id: "shapes",
    label: "Geometric Shapes",
    icon: <Sparkles className="w-3 h-3 text-pink-400" />,
    presets: SHAPE_PRESETS,
    isGrid3: true,
  },
];

const FILTER_CHIPS = [
  { id: "all", label: "All Blocks" },
  { id: "social-proof", label: "Social Proof" },
  { id: "ios-widgets", label: "iOS Widgets" },
  { id: "awards-trust", label: "Awards & Trust" },
  { id: "growth-stats", label: "Growth & Stats" },
  { id: "cards-glass", label: "Cards & Glass" },
  { id: "doodles", label: "Doodles" },
  { id: "offers-ctas", label: "Offers & CTAs" },
  { id: "testimonials", label: "Press" },
  { id: "store-badges", label: "Badges" },
  { id: "shapes", label: "Shapes" },
];

export function BlocksPanel() {
  const { getActiveSet, getActiveScreen, addLayers } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleAdd = (preset: BlockPreset) => {
    const set = getActiveSet();
    const screen = getActiveScreen();
    if (!set || !screen) {
      toast.error("Select a screen first on canvas");
      return;
    }

    const rawLayers = preset.getLayers(screen.width, screen.height);
    const groupId = `group-${nanoid(8)}`;
    const layersToAdd = rawLayers.length > 1
      ? rawLayers.map((l) => ({ ...l, groupId }))
      : rawLayers;

    addLayers(set.id, screen.id, layersToAdd);
    toast.success(`Added ${preset.name} to canvas!`);
  };

  // Filtered categories and presets
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CATEGORIES.map((cat) => {
      // Category filter match
      if (selectedCategory !== "all" && cat.id !== selectedCategory) {
        return null;
      }

      // Keyword query match
      if (!query) {
        return cat;
      }

      const matchingPresets = cat.presets.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const keywordMatch = p.keywords?.some((k) => k.toLowerCase().includes(query));
        return nameMatch || keywordMatch;
      });

      if (matchingPresets.length === 0) return null;

      return {
        ...cat,
        presets: matchingPresets,
      };
    }).filter(Boolean) as CategorySection[];
  }, [searchQuery, selectedCategory]);

  const totalResults = filteredSections.reduce((acc, cat) => acc + cat.presets.length, 0);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Top Search & Filter Controls */}
      <div className="p-3 border-b border-border/40 space-y-2.5 shrink-0 bg-background/50 backdrop-blur-xs">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blocks, widgets, badges..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-lg bg-secondary/60 border border-border/40 focus:border-primary focus:outline-none placeholder:text-muted-foreground/70 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <HorizontalScrollRail className="py-0.5">
          {FILTER_CHIPS.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={(e) => {
                  setSelectedCategory(chip.id);
                  e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }}
                className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-100"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/30 active:scale-95"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </HorizontalScrollRail>
      </div>

      {/* Main Presets Scrollable Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-4">
          {totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Search className="w-8 h-8 opacity-30 mb-2" />
              <p className="text-xs font-semibold">No blocks found</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                Try searching for &quot;{searchQuery}&quot; or clear the filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id} className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                  {section.icon}
                  <span>{section.label}</span>
                  <span className="text-[9px] font-normal text-muted-foreground/60 ml-auto">
                    {section.presets.length}
                  </span>
                </p>

                {section.isGrid3 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {section.presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleAdd(preset)}
                        className="flex flex-col gap-1 p-2 rounded-xl bg-card/70 dark:bg-secondary/40 hover:bg-secondary/80 border border-border/50 hover:border-primary/50 transition-all group cursor-pointer items-center text-center shadow-xs"
                      >
                        <div className="flex items-center justify-center h-10">
                          {preset.preview}
                        </div>
                        <p className="text-[9.5px] font-medium text-muted-foreground group-hover:text-foreground">
                          {preset.name}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {section.presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleAdd(preset)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-card/70 dark:bg-secondary/40 hover:bg-secondary/80 border border-border/50 hover:border-primary/50 transition-all group cursor-pointer shadow-xs"
                      >
                        <div className="shrink-0">{preset.preview}</div>
                        <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-primary shrink-0 ml-2 px-2 py-0.5 rounded-md bg-secondary/60 dark:bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                          + Add
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
