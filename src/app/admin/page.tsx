"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Sparkles,
  RefreshCw,
  Crown,
  Layers,
  ArrowLeft,
  Search,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/authStore";
import { isUserAdmin } from "@/lib/adminAuth";
import { toast } from "@/lib/store/toastStore";
import { CustomTemplate } from "@/lib/customTemplates";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/ui/RatingStars";

interface AdminReview {
  id: string;
  userId: string;
  authorAnonymized?: string;
  authorRole?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
  isVerifiedUser?: boolean;
  beta_user?: boolean;
  featured?: boolean;
}

export default function AdminConsolePage() {
  const router = useRouter();
  const { user, isInitialized, isLoading: isAuthLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"reviews" | "templates">("reviews");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected" | "featured">("all");
  const [templateFilter, setTemplateFilter] = useState<"all" | "pending_review" | "approved" | "rejected" | "private">("all");

  const isAdmin = user && isUserAdmin(user.email);

  // ── Fetch Reviews ──
  const fetchReviews = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const res = await fetch(`/api/admin/reviews?adminEmail=${encodeURIComponent(user.email || "")}`, {
        headers: { "x-admin-email": user.email || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to load reviews list.");
    }
  }, [user, isAdmin]);

  // ── Fetch Templates ──
  const fetchTemplates = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const res = await fetch(`/api/admin/templates?adminEmail=${encodeURIComponent(user.email || "")}`, {
        headers: { "x-admin-email": user.email || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
      toast.error("Failed to load custom templates list.");
    }
  }, [user, isAdmin]);

  const refreshAll = useCallback(async () => {
    setIsDataLoading(true);
    await Promise.all([fetchReviews(), fetchTemplates()]);
    setIsDataLoading(false);
  }, [fetchReviews, fetchTemplates]);

  useEffect(() => {
    if (isAdmin) {
      refreshAll();
    }
  }, [isAdmin, refreshAll]);

  // ── Review Moderation Handlers ──
  const updateReview = async (id: string, updates: Partial<AdminReview>) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email || "",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
        toast.success("Review status updated successfully!");
      } else {
        toast.error("Failed to update review.");
      }
    } catch {
      toast.error("Network error while updating review.");
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}&adminEmail=${encodeURIComponent(user?.email || "")}`, {
        method: "DELETE",
        headers: { "x-admin-email": user?.email || "" },
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success("Review deleted permanently.");
      } else {
        toast.error("Failed to delete review.");
      }
    } catch {
      toast.error("Network error while deleting review.");
    }
  };

  // ── Template Moderation Handlers ──
  const updateTemplate = async (id: string, updates: Partial<CustomTemplate>) => {
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email || "",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
        toast.success("Template moderated successfully!");
      } else {
        toast.error("Failed to update template.");
      }
    } catch {
      toast.error("Network error while updating template.");
    }
  };

  const rejectTemplatePrompt = async (id: string) => {
    const reason = window.prompt("Enter rejection feedback for the creator (optional):", "Please adjust screenshot resolutions or layout clarity.");
    if (reason === null) return; // cancelled

    await updateTemplate(id, {
      status: "rejected",
      rejectionReason: reason || "Design did not meet community guidelines.",
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this custom template?")) return;

    try {
      const res = await fetch(`/api/admin/templates?id=${encodeURIComponent(id)}&adminEmail=${encodeURIComponent(user?.email || "")}`, {
        method: "DELETE",
        headers: { "x-admin-email": user?.email || "" },
      });

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Template deleted permanently.");
      } else {
        toast.error("Failed to delete template.");
      }
    } catch {
      toast.error("Network error while deleting template.");
    }
  };

  // ── STRICT SECURITY SCREEN (If non-admin or unauthenticated) ──
  if (!isInitialized || isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Verifying administrator credentials…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto min-h-screen">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">403 · Access Restricted</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          This administration console is strictly restricted to SnapFrame system administrators. You do not have permission to view or execute operations on this portal.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button
            onClick={() => router.push("/projects")}
            className="h-10 px-6 rounded-xl font-semibold shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Studio</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="h-10 px-6 rounded-xl font-semibold cursor-pointer"
          >
            <span>Home</span>
          </Button>
        </div>
      </div>
    );
  }

  // ── FILTERED DATA ──
  const pendingReviewsCount = reviews.filter((r) => r.status === "pending").length;
  const pendingTemplatesCount = templates.filter((t) => t.status === "pending_review").length;

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "pending" && r.status !== "pending") return false;
    if (reviewFilter === "approved" && r.status !== "approved") return false;
    if (reviewFilter === "rejected" && r.status !== "rejected") return false;
    if (reviewFilter === "featured" && !r.featured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = r.title?.toLowerCase().includes(q);
      const bodyMatch = r.body?.toLowerCase().includes(q);
      const authorMatch = r.authorAnonymized?.toLowerCase().includes(q) || r.authorRole?.toLowerCase().includes(q);
      return titleMatch || bodyMatch || authorMatch;
    }
    return true;
  });

  const filteredTemplates = templates.filter((t) => {
    if (templateFilter === "pending_review" && t.status !== "pending_review") return false;
    if (templateFilter === "approved" && t.status !== "approved") return false;
    if (templateFilter === "rejected" && t.status !== "rejected") return false;
    if (templateFilter === "private" && t.status !== "private") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = t.name?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const authorMatch = t.authorName?.toLowerCase().includes(q) || t.authorEmail?.toLowerCase().includes(q);
      return nameMatch || descMatch || authorMatch;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Top Header ── */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SnapFrameLogo size={28} />
            </Link>
            <span className="text-muted-foreground/40 text-sm hidden sm:inline">/</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MASTER ADMIN CONSOLE</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isDataLoading}
              className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isDataLoading && "animate-spin")} />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Main Moderation Dashboard ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{pendingReviewsCount}</h3>
            </div>
            <div className={cn("p-3 rounded-2xl border", pendingReviewsCount > 0 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-secondary text-muted-foreground border-border/40")}>
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Templates</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{pendingTemplatesCount}</h3>
            </div>
            <div className={cn("p-3 rounded-2xl border", pendingTemplatesCount > 0 ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" : "bg-secondary text-muted-foreground border-border/40")}>
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Status</p>
              <h3 className="text-sm font-mono font-bold text-emerald-500 mt-1.5 truncate max-w-[180px]">{user?.email}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50 text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeTab === "reviews"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Reviews Moderation</span>
              {pendingReviewsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={cn(
                "px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer",
                activeTab === "templates"
                  ? "bg-card text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Templates Moderation</span>
              {pendingTemplatesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                  {pendingTemplatesCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}…`}
              className="h-9 pl-9 pr-3 text-xs bg-secondary/40 border-border/50 rounded-xl"
            />
          </div>
        </div>

        {/* ── TAB 1: REVIEWS MODERATION ── */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: `All (${reviews.length})` },
                { id: "pending", label: `⏳ Pending (${pendingReviewsCount})` },
                { id: "approved", label: `✅ Approved (${reviews.filter((r) => r.status === "approved").length})` },
                { id: "rejected", label: `❌ Rejected (${reviews.filter((r) => r.status === "rejected").length})` },
                { id: "featured", label: `⭐ Featured (${reviews.filter((r) => r.featured).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setReviewFilter(f.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap border text-xs",
                    reviewFilter === f.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/50 space-y-2">
                <Star className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No reviews found</h4>
                <p className="text-xs text-muted-foreground">There are no reviews matching the current filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-border transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <RatingStars rating={rev.rating || 5} size="w-4 h-4" />
                          <span className="text-xs font-mono font-bold text-amber-500/90 ml-0.5">
                            {Number(rev.rating || 5).toFixed(1)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{rev.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1",
                            rev.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : rev.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          )}
                        >
                          {rev.status === "approved" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </>
                          ) : rev.status === "rejected" ? (
                            <>
                              <XCircle className="w-3 h-3" /> Rejected
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pending Review
                            </>
                          )}
                        </span>

                        {rev.featured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured Top
                          </span>
                        )}

                        {rev.beta_user && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Beta Tester
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-secondary/30 p-3.5 rounded-xl border border-border/40">
                      &quot;{rev.body}&quot;
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground">{rev.authorAnonymized || "Verified Creator"}</span>
                        <span>•</span>
                        <span>{rev.authorRole || "App Developer"}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rev.status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={() => updateReview(rev.id, { status: "approved" })}
                            className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </Button>
                        )}

                        {rev.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReview(rev.id, { status: "rejected" })}
                            className="h-8 px-3 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateReview(rev.id, { featured: !rev.featured })}
                          className={cn(
                            "h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer",
                            rev.featured ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Featured on Homepage"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{rev.featured ? "Unfeature" : "Feature"}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateReview(rev.id, { beta_user: !rev.beta_user })}
                          className={cn(
                            "h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer",
                            rev.beta_user ? "text-indigo-400 bg-indigo-500/10" : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Toggle Beta Tester badge"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{rev.beta_user ? "Remove Beta" : "Mark Beta"}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReview(rev.id)}
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TEMPLATES MODERATION ── */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: `All (${templates.length})` },
                { id: "pending_review", label: `⏳ Pending (${pendingTemplatesCount})` },
                { id: "approved", label: `✅ Live Gallery (${templates.filter((t) => t.status === "approved").length})` },
                { id: "rejected", label: `❌ Rejected (${templates.filter((t) => t.status === "rejected").length})` },
                { id: "private", label: `🔒 Private (${templates.filter((t) => t.status === "private").length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTemplateFilter(f.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap border text-xs",
                    templateFilter === f.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Templates List */}
            {filteredTemplates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/50 space-y-2">
                <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No custom templates found</h4>
                <p className="text-xs text-muted-foreground">There are no templates submitted under this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4 hover:border-border transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Gradient Header Mini Thumbnail */}
                      <div
                        className="w-full h-24 rounded-xl p-3 flex items-center justify-between text-white shadow-inner relative overflow-hidden"
                        style={{
                          background: tpl.previewGradient?.length
                            ? `linear-gradient(135deg, ${tpl.previewGradient.join(", ")})`
                            : "linear-gradient(135deg, #1e1e24, #0a0a0f)",
                        }}
                      >
                        <div className="space-y-0.5 z-10">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                            {tpl.category || "General"}
                          </span>
                          <h4 className="text-sm font-black drop-shadow-sm">{tpl.name}</h4>
                        </div>

                        <div className="z-10 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/20">
                            {tpl.screens?.length || 5} Screens
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1",
                              tpl.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : tpl.status === "rejected"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                : tpl.status === "pending_review"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-secondary text-muted-foreground border-border/50"
                            )}
                          >
                            {tpl.status === "approved" ? "✅ Live Gallery" : tpl.status === "pending_review" ? "⏳ In Review" : tpl.status === "rejected" ? "❌ Rejected" : "🔒 Private"}
                          </span>

                          {tpl.isPro && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center gap-0.5">
                              <Crown className="w-3 h-3" /> PRO SUITE
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(tpl.updatedAt || tpl.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tpl.description || "No description provided."}
                      </p>

                      {tpl.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Rejection note: {tpl.rejectionReason}</span>
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground">
                        Creator: <strong className="text-foreground">{tpl.authorName || "Pro User"}</strong> {tpl.authorEmail ? `(${tpl.authorEmail})` : ""}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/40 flex-wrap">
                      {tpl.status !== "approved" && (
                        <Button
                          size="sm"
                          onClick={() => updateTemplate(tpl.id, { status: "approved" })}
                          className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve to Gallery</span>
                        </Button>
                      )}

                      {tpl.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectTemplatePrompt(tpl.id)}
                          className="h-8 px-3 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateTemplate(tpl.id, { isPro: !tpl.isPro })}
                        className={cn(
                          "h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer",
                          tpl.isPro ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Toggle PRO exclusivity"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{tpl.isPro ? "Make Free" : "Make Pro"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(tpl.id)}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 ml-auto cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
