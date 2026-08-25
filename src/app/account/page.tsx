"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Crown,
  CreditCard,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Receipt,
  LogOut,
  RefreshCw,
  XCircle,
  Star,
  MessageSquare,
  Shield,
  Send,
  Rocket,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { Footer } from "@/components/dashboard/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { UpgradeModal } from "@/components/pricing/UpgradeModal";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { getIdTokenSafe } from "@/lib/firebase";
import { anonymizeName } from "@/lib/anonymize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface CreditLog {
  id: string;
  feature: string;
  timestamp: number;
  cost: number;
  remaining: number;
  isPro: boolean;
  status: string;
}

interface BillingDetails {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    isPro: boolean;
    plan: string;
    subscriptionStatus: string;
    subscriptionStartedAt?: number | null;
    subscriptionExpiresAt?: number | null;
    nextBilledAt?: number | null;
    autoRenew?: boolean;
    billingAmount?: number;
    currency?: string;
    paddleCustomerId?: string | null;
    paddleSubscriptionId?: string | null;
    createdAt: number;
    aiCredits: number;
    usedAiCredits: number;
    canceledAt?: number | null;
    cancelReason?: string | null;
  };
  creditLogs: CreditLog[];
  transactions: any[];
  paddlePortalUrl: string;
}

export default function AccountPage() {
  const router = useRouter();
  const mounted = useMounted();
  const [now] = useState(() => Date.now());
  const { user, isInitialized, isPro, aiCredits, usedAiCredits, plan, subscriptionStatus, setAuthModalOpen, setUpgradeModalOpen, signOutUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"subscription" | "credits" | "invoices" | "review">("subscription");
  const [billingData, setBillingData] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("No longer needed");
  const [isCanceling, setIsCanceling] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const PREDEFINED_ROLES = [
    "iOS Indie Developer",
    "Android & Kotlin Lead",
    "Flutter & React Native Creator",
    "Mobile UI/UX Designer",
    "ASO & App Growth Specialist",
    "Indie App Founder",
  ];

  const [reviewBody, setReviewBody] = useState("");
  const [reviewRole, setReviewRole] = useState("iOS Indie Developer");
  const [customRole, setCustomRole] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [myExistingReview, setMyExistingReview] = useState<any | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const isGuest = Boolean(!user || user.isAnonymous);

  const fetchMyReview = async () => {
    if (!user || isGuest) return;
    try {
      setIsLoadingReview(true);
      const token = await getIdTokenSafe(user);
      if (!token) return;
      const res = await fetch("/api/reviews?mine=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          setMyExistingReview(data.review);
          setReviewRating(data.review.rating || 5);
          setReviewTitle(data.review.title || "");
          setReviewBody(data.review.body || "");
          const existingRole = data.review.authorRole || "iOS Indie Developer";
          if (PREDEFINED_ROLES.includes(existingRole)) {
            setReviewRole(existingRole);
            setCustomRole("");
          } else {
            setReviewRole("Other");
            setCustomRole(existingRole);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user review:", e);
    } finally {
      setIsLoadingReview(false);
    }
  };

  useEffect(() => {
    if (activeTab === "review" && user && !isGuest) {
      fetchMyReview();
    }
  }, [activeTab, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest) {
      setAuthModalOpen(true);
      return;
    }

    if (!reviewBody.trim() || reviewBody.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review feedback.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const token = await getIdTokenSafe(user);
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      const effectiveRole =
        reviewRole === "Other"
          ? customRole.trim() || "Verified Creator"
          : reviewRole;

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle.trim() || "Great screenshot design studio",
          reviewText: reviewBody.trim(),
          role: effectiveRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setMyExistingReview(data.review);
      toast.success("Thank you! Your verified review has been published.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchBillingInfo = async () => {
    if (!user || isGuest) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let idToken = await getIdTokenSafe(user);
      if (!idToken) {
        // Wait briefly if auth token is currently initializing
        await new Promise((r) => setTimeout(r, 350));
        idToken = await getIdTokenSafe(user);
      }

      const res = await fetch(`/api/account/billing?uid=${user.uid}`, {
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
      } else if (res.status === 401) {
        // Retry with force-refreshed token
        const freshToken = await getIdTokenSafe(user, true);
        if (freshToken) {
          const retryRes = await fetch(`/api/account/billing?uid=${user.uid}`, {
            headers: { Authorization: `Bearer ${freshToken}` },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setBillingData(data);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load billing details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (!mounted || !isInitialized) return;

    if (!user || isGuest) {
      return;
    }

    async function load() {
      try {
        setIsLoading(true);
        let idToken = await getIdTokenSafe(user);
        if (!idToken && !isCancelled) {
          await new Promise((r) => setTimeout(r, 350));
          idToken = await getIdTokenSafe(user);
        }


        const res = await fetch(`/api/account/billing?uid=${user.uid}`, {
          headers: {
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
        });

        if (res.ok && !isCancelled) {
          const data = await res.json();
          setBillingData(data);
        } else if (res.status === 401 && !isCancelled) {
          const freshToken = await getIdTokenSafe(user, true);
          if (freshToken && !isCancelled) {
            const retryRes = await fetch(`/api/account/billing?uid=${user.uid}`, {
              headers: { Authorization: `Bearer ${freshToken}` },
            });
            if (retryRes.ok && !isCancelled) {
              const data = await retryRes.json();
              setBillingData(data);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load billing details:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [user, isGuest, isInitialized, mounted]);

  useEffect(() => {
    if (mounted && !isLoading && isInitialized && !user) {
      router.push("/");
    }
  }, [user, isLoading, isInitialized, router, mounted]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    setIsCanceling(true);


    try {
      const idToken = await getIdTokenSafe(user);
      const res = await fetch("/api/account/billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          uid: user.uid,
          action: "cancel_subscription",
          reason: cancelReason,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(result.message || "Subscription canceled successfully.");
        setShowCancelModal(false);
        useAuthStore.setState({
          subscriptionStatus: "canceled",
          isPro: true,
        });
        fetchBillingInfo();
      } else {
        toast.error("Could not cancel subscription. Please check your connection or contact support.");
      }
    } catch {
      toast.error("Failed to process cancellation request.");
    } finally {

      setIsCanceling(false);
    }
  };

  const displayName = user?.displayName || (isGuest ? "Guest Creator" : "Creator");
  const email = user?.email || (isGuest ? "Guest Session" : "");
  const photoURL = user?.photoURL;
  const memberSince = billingData?.user?.createdAt
    ? new Date(billingData.user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";

  const formatFriendlyDate = (timestamp?: number | null) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const subStartedAt = billingData?.user?.subscriptionStartedAt;
  const subExpiresAt = billingData?.user?.subscriptionExpiresAt;
  const subNextBilledAt = billingData?.user?.nextBilledAt;
  const subCanceledAt = billingData?.user?.canceledAt;
  const isCanceled = subscriptionStatus === "canceled" || Boolean(subCanceledAt);
  const autoRenew = Boolean(isPro && !isCanceled);
  const planPrice = plan?.includes("annual") ? "$69.00 USD" : "$9.00 USD";
  const planBillingCycle = plan?.includes("annual") ? "Annual billing cycle" : "Monthly billing cycle";

  const remainingDays = subExpiresAt
    ? Math.max(0, Math.ceil((subExpiresAt - now) / (1000 * 60 * 60 * 24)))
    : null;


  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <SnapFrameLogo size={32} withText textClassName="text-lg font-bold" />
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-card rounded-3xl border border-border/60" />
            <div className="h-12 bg-card rounded-2xl w-80 border border-border/60" />
            <div className="h-64 bg-card rounded-2xl border border-border/60" />
          </div>
        </main>
      </div>
    );
  }

  return (

    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <SnapFrameLogo size={32} withText textClassName="text-lg font-bold" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary border border-border/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>

            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 sm:py-12 space-y-8">
        {/* Profile Banner */}
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-secondary/30 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoURL}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {displayName}
                  </h1>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Crown className="w-3 h-3 text-amber-400" />
                      PRO
                    </span>
                  ) : isGuest ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      GUEST
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground border border-border/60">
                      FREE STARTER
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {email || "Guest temporary account"} • Member since {memberSince}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isPro && (
                <button
                  type="button"
                  onClick={() => {
                    if (isGuest) {
                      setAuthModalOpen(true);
                      toast.info("Please create a free account first to link your subscription.");
                      return;
                    }
                    setUpgradeModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade to Pro (from $5.75/mo)</span>
                </button>
              )}

              {isGuest ? (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-semibold text-foreground flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Link Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    router.push("/");
                  }}
                  className="h-9 px-3.5 rounded-xl bg-secondary/80 hover:bg-rose-500/10 hover:text-rose-400 border border-border/60 text-xs font-semibold text-muted-foreground transition-all cursor-pointer"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/40">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
              <p className="text-sm font-bold text-foreground capitalize">
                {isPro ? (plan?.includes("annual") ? "Pro (Annual)" : "Pro (Monthly)") : "Free Starter"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">AI Credits</p>
              <p className="text-sm font-bold text-foreground">
                {isPro ? "Unlimited" : `${aiCredits} / 3 Available`}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">AI Generations</p>
              <p className="text-sm font-bold text-foreground">
                {usedAiCredits} used
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cloud Storage</p>
              <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isPro ? "Multi-Device Sync" : "Local Sync"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/50 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "subscription"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription &amp; Billing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credits")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "credits"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Credits &amp; Activity Log</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              {isPro ? "PRO" : aiCredits}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices &amp; Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "review"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Community Review</span>
            {myExistingReview && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Published</span>
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Subscription & Billing */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Plan Card */}
              <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Current Subscription
                    </span>
                    <h2 className="text-xl font-bold text-foreground">
                      {isPro
                        ? plan?.includes("annual")
                          ? "SnapFrame Pro Annual Plan"
                          : "SnapFrame Pro Monthly Plan"
                        : "Free Starter Plan"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isPro
                        ? "Full commercial license with unlimited studio access & multi-device cloud sync."
                        : "Basic screenshot creation with 3 free AI welcome credits."}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-foreground">
                      {isPro ? (plan?.includes("annual") ? "$69" : "$9") : "$0"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isPro ? (plan?.includes("annual") ? "/year" : "/month") : " forever"}
                    </span>
                  </div>
                </div>

                {/* Plan Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isPro && !isCanceled
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                      : isCanceled
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300"
                      : "bg-secondary/50 border-border/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isPro && !isCanceled
                          ? "bg-emerald-500 animate-pulse"
                          : isCanceled
                          ? "bg-amber-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span className="font-semibold">
                      Status:{" "}
                      <span className="font-bold">
                        {isPro
                          ? isCanceled
                            ? "Canceled (Active until period ends)"
                            : "Active (Auto-Renewing)"
                          : "Free Tier"}
                      </span>
                    </span>
                  </div>

                  <span className="font-mono text-[11px] opacity-80">
                    Processed via <strong>Paddle.com</strong> (Merchant of Record)
                  </span>
                </div>

                {/* Detailed Subscription Lifecycle Metrics */}
                {isPro && (
                  <div className="space-y-3 pt-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Subscription &amp; Renewal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Activation Date */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Activated On</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {formatFriendlyDate(subStartedAt || billingData?.user?.createdAt)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Initial subscription start date
                        </p>
                      </div>

                      {/* 2. Auto-Renewal Status */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <RefreshCw className="w-3.5 h-3.5 text-primary" />
                          <span>Auto-Renewal Status</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {autoRenew ? (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Enabled (Automatic)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                              <XCircle className="w-4 h-4" />
                              Disabled (Will not renew)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {autoRenew
                            ? `Next auto-charge of ${planPrice}`
                            : "No future charges will be billed"}
                        </p>
                      </div>

                      {/* 3. Next Billing / Period End Date */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {autoRenew
                              ? "Next Renewal Date"
                              : "Pro Access Valid Until"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {formatFriendlyDate(subNextBilledAt || subExpiresAt)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {remainingDays !== null
                            ? `${remainingDays} days of Pro access remaining`
                            : "Active billing term"}
                        </p>
                      </div>

                      {/* 4. Renewal Price & Frequency */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <CreditCard className="w-3.5 h-3.5 text-primary" />
                          <span>Renewal Amount</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {autoRenew ? `${planPrice} / ${plan?.includes("annual") ? "year" : "month"}` : "$0.00 (No charge)"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {autoRenew ? planBillingCycle : "Subscription canceled"}
                        </p>
                      </div>
                    </div>

                    {/* Cancellation Alert Banner */}
                    {isCanceled && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Subscription canceled on {formatFriendlyDate(subCanceledAt || now)}
                          </span>

                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Your subscription will not renew at the end of the billing period. You retain 100% full access to all Pro features, unlimited projects, multi-device cloud synchronization, and 4K exports until <strong>{formatFriendlyDate(subExpiresAt)}</strong>.
                        </p>
                        {billingData?.user?.cancelReason && (
                          <p className="text-[11px] text-muted-foreground/80 font-mono">
                            Reason: {billingData.user.cancelReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Plan Perks Included */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Included in your plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isPro ? "1,500 AI Generations / Month (up to 150/day)" : "3 Free AI Credits included"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isPro ? "Lossless 4K PNG & Ultra-HD Export" : "Standard resolution exports"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isPro ? "Multi-Device Cloud Sync (Firestore)" : "Local device storage"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>60fps MP4/WebM Video &amp; Animated GIF Studio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>40+ Languages Instant i18n Translation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>100% Commercial Use Perpetual License</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
                  {isPro ? (
                    <>
                      <a
                        href={billingData?.paddlePortalUrl || "https://paddle.net"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                      >
                        <span>Open Paddle Customer Dashboard</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {!isCanceled ? (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-400 hover:underline transition-colors cursor-pointer"
                        >
                          Cancel Subscription
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUpgradeModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reactivate Pro / Renew</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUpgradeModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-md cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>Upgrade to Pro (from $5.75/mo)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Paddle Buyer Support & Card Management Sidebar */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Paddle Buyer Hub</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our billing and checkout is managed securely by <strong>Paddle.com</strong>.
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">What you can do in the Paddle Portal:</p>
                    <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                      <li>Update credit/debit card or payment method</li>
                      <li>Update billing address and VAT / Tax ID</li>
                      <li>Download official VAT invoices &amp; PDF receipts</li>
                      <li>Check transaction history &amp; dispute charges</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <a
                    href="https://paddle.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold border border-border/60 transition-colors"
                  >
                    <span>Visit paddle.net Support</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Enter your purchase email to retrieve instant receipts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI Credits & Spending History */}
        {activeTab === "credits" && (
          <div className="space-y-6">
            {/* Balance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Available Credits
                </span>
                <p className="text-2xl font-black text-primary">
                  {isPro ? "Unlimited" : `${aiCredits} Credits`}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isPro ? "Fair Usage Policy applies (150/day • 1,500/mo)" : "3 complimentary credits"}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/60 bg-card space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Lifetime Consumed
                </span>
                <p className="text-2xl font-black text-foreground">
                  {usedAiCredits} Generations
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Vision, translation &amp; copy
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/60 bg-card flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Need more credits?
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pro subscribers get unlimited AI generations.
                  </p>
                </div>
                {!isPro && (
                  <button
                    type="button"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="mt-2 w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    Upgrade for Unlimited
                  </button>
                )}
              </div>
            </div>

            {/* Credit Activity Log Table */}
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <span>AI Credit Usage History</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Detailed record of AI Vision, translations, and metadata generations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchBillingInfo}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Refresh activity logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted/60 rounded-md animate-pulse w-1/4" />
                  <div className="h-10 bg-muted/30 rounded-xl animate-pulse w-full" />
                  <div className="h-10 bg-muted/30 rounded-xl animate-pulse w-full" />
                  <div className="h-10 bg-muted/30 rounded-xl animate-pulse w-full" />
                </div>
              ) : billingData?.creditLogs && billingData.creditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead className="bg-secondary/40 border-b border-border/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3">Date &amp; Time</th>
                        <th className="px-5 py-3">Feature Used</th>
                        <th className="px-5 py-3">Cost</th>
                        <th className="px-5 py-3">Balance After</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {billingData.creditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3.5 text-muted-foreground font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              {log.feature}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {log.cost < 0 ? (
                              <span className="font-bold text-emerald-500">+{Math.abs(log.cost)} (Bonus)</span>
                            ) : log.isPro || log.cost === 0 ? (
                              <span className="font-bold text-indigo-400">0 (PRO)</span>
                            ) : (
                              <span className="font-bold text-foreground">-{log.cost} Credit</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-muted-foreground">
                            {log.isPro ? "Unlimited" : `${log.remaining} left`}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Success
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No AI activity recorded yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    When you run AI Auto-Pilot, translate captions, or generate ASO copy, your credit spending logs will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Invoices & Receipts */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    <span>Invoices &amp; Payment Receipts</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View order receipts and VAT tax invoices processed by Paddle.com.
                  </p>
                </div>

                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground border border-border/60 transition-colors"
                >
                  <span>Paddle Invoice Lookup</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>

              {isPro ? (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-foreground">
                        {plan?.includes("annual") ? "SnapFrame Pro Annual" : "SnapFrame Pro Monthly"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Merchant: Paddle.com Market Ltd
                      </p>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {plan?.includes("annual") ? "$69.00 USD" : "$9.00 USD"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Invoice generated automatically upon payment</span>
                    <a
                      href="https://paddle.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Download Receipt (PDF)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No invoices on Free tier</p>
                  <p className="text-xs text-muted-foreground">
                    When you upgrade to SnapFrame Pro, all invoices with complete VAT receipts will be accessible here and via paddle.net.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Community Review */}
        {activeTab === "review" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Star className="w-5 h-5 fill-amber-500" />
                    </span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">Verified Creator Review</h2>
                      <p className="text-xs text-muted-foreground">
                        Share your feedback to help indie developers and mobile creators discover SnapFrame.
                      </p>
                    </div>
                  </div>
                </div>

                {myExistingReview && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Published &amp; Verified in Firestore</span>
                  </div>
                )}
              </div>

              {isGuest ? (
                <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-foreground">Sign In to Leave a Verified Review</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To keep reviews 100% authentic and spam-free, only authenticated creators can submit reviews.
                    </p>
                  </div>
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    className="gap-2 font-semibold text-xs rounded-xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sign In with Google or GitHub</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form */}
                  <form onSubmit={handleSubmitReview} className="lg:col-span-7 space-y-5">
                    {/* Privacy Guarantee Box */}
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>Strict Privacy &amp; Anonymization Guarantee</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Your identity will be displayed publicly as{" "}
                        <strong className="text-foreground font-mono bg-card px-1.5 py-0.5 rounded border border-border/60">
                          {anonymizeName(displayName)}
                        </strong>
                        . Your full surname, email address, and workplace company are strictly hidden.
                      </p>
                    </div>

                    {/* Rating Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Overall Rating</span>
                        <span className="text-xs text-amber-500 font-semibold">
                          {reviewRating} of 5 Stars
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating || reviewRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="p-2 rounded-xl hover:bg-secondary transition-all cursor-pointer group"
                              aria-label={`Rate ${star} star`}
                            >
                              <Star
                                className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                                  isFilled
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground/40"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Role Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Your Creator Profile / Role
                      </label>
                      <select
                        value={reviewRole}
                        onChange={(e) => setReviewRole(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-secondary/80 border border-border/60 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {PREDEFINED_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                        <option value="Other">✍️ Other / Custom Role (Specify below)</option>
                      </select>

                      {reviewRole === "Other" && (
                        <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <input
                            type="text"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="e.g. Unity Game Developer, Solo Founder, Tech Lead..."
                            maxLength={50}
                            className="w-full h-10 px-3 rounded-xl bg-secondary/80 border border-border/60 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Enter your custom role or position title.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Review Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Review Headline
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Cut our screenshot release time from 4h to 5 minutes"
                        maxLength={100}
                        className="w-full h-10 px-3 rounded-xl bg-secondary/80 border border-border/60 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Review Body */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Your Feedback / Review</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {reviewBody.length} / 1000 characters
                        </span>
                      </label>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        rows={4}
                        placeholder="What do you like about SnapFrame? (e.g. Continuous panoramic flows, Fastlane export, 3D device frames, multi-language localization)..."
                        maxLength={1000}
                        className="w-full p-3 rounded-xl bg-secondary/80 border border-border/60 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none leading-relaxed"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmittingReview || reviewBody.trim().length < 10}
                      className="w-full sm:w-auto gap-2 rounded-xl text-xs font-bold px-6 py-2.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isSubmittingReview
                          ? "Submitting to Firestore..."
                          : myExistingReview
                          ? "Update My Verified Review"
                          : "Submit Verified Review"}
                      </span>
                    </Button>
                  </form>

                  {/* Right Column: Live Testimonial Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Live Preview on Homepage
                      </span>
                      <p className="text-xs text-muted-foreground">
                        This is how your review will appear to other mobile creators:
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-card border border-border/70 space-y-4 shadow-md flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5">
                        {myExistingReview?.beta_user && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs">
                            <Rocket className="w-2.5 h-2.5 text-amber-500" />
                            <span>Beta Tester</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Creator</span>
                        </span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(reviewRating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>

                        {reviewTitle ? (
                          <h4 className="text-xs font-bold text-foreground">
                            &ldquo;{reviewTitle}&rdquo;
                          </h4>
                        ) : null}

                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          &ldquo;
                          {reviewBody.trim() ||
                            "SnapFrame makes creating App Store and Google Play screenshots effortless with 3D device frames and 40+ language export."}
                          &rdquo;
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate font-mono">
                            {anonymizeName(displayName)}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {reviewRole === "Other"
                              ? customRole.trim() || "Verified Creator"
                              : reviewRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Subscription Cancellation Modal */}
      {showCancelModal && (
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="sm:max-w-md bg-card border border-border/80 shadow-2xl rounded-2xl">
            <DialogHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold">Cancel Subscription?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                If you cancel, you will continue to have full SnapFrame Pro access until the end of your current billing period. No further charges will be billed.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-foreground">
                Please let us know why you are canceling:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/60 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Finished current app release">Finished current app screenshot release</option>
                <option value="Too expensive">Too expensive for my current budget</option>
                <option value="Missing a specific feature">Missing a specific feature / format</option>
                <option value="Switching to another tool">Switching to another tool</option>
                <option value="Temporary pause">Just pausing temporarily</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
                className="text-xs"
              >
                Keep My Subscription
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="text-xs font-bold"
              >
                {isCanceling ? "Canceling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Global Auth & Upgrade Modals */}
      <AuthModal />
      <UpgradeModal />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
