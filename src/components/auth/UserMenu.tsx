"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { LogOut, User as UserIcon, Sparkles, ChevronDown, ShieldAlert, ShieldCheck, Crown, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isUserAdmin } from "@/lib/adminAuth";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { user, isLoading, isInitialized, isPro, aiCredits, setAuthModalOpen, setUpgradeModalOpen, signOutUser } = useAuthStore();

  if (!mounted || (isLoading && !isInitialized)) {
    return (
      <div
        className={cn(
          "h-8 w-24 rounded-xl bg-secondary/40 animate-pulse border border-border/40 shrink-0",
          className
        )}
      />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => setAuthModalOpen(true)}
        className="h-8 px-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
      >
        <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
        <span>Sign In</span>
      </button>
    );
  }

  const isAnonymous = user.isAnonymous;
  const displayName = user.displayName || (isAnonymous ? "Guest Creator" : "Creator");
  const email = user.email || (isAnonymous ? "Temporary session" : "");
  const photoURL = user.photoURL;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 flex items-center gap-1.5 min-[1000px]:gap-2 p-1 min-[1000px]:pl-1.5 min-[1000px]:pr-2.5 pr-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/60 transition-all outline-none cursor-pointer group shadow-xs">
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoURL}
            alt={displayName}
            className="w-6 h-6 rounded-lg object-cover ring-1 ring-border shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="show-from-1000-flex flex-col justify-center text-left max-w-28 truncate">
          <div className="flex items-center gap-1 leading-tight">
            <span className="text-xs font-semibold text-foreground truncate">
              {displayName}
            </span>
            {isPro && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                PRO
              </span>
            )}
          </div>
          {isAnonymous ? (
            <span className="text-[9px] text-amber-400 font-medium leading-tight">
              Guest
            </span>
          ) : !isPro ? (
            <span className="text-[9px] text-indigo-400 font-semibold leading-tight">
              {aiCredits} AI credits
            </span>
          ) : (
            <span className="text-[9px] text-emerald-400 font-medium leading-tight">
              Unlimited
            </span>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-2xl border border-border/80 rounded-2xl bg-card">
        <div className="p-2 space-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
            {isPro ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                👑 PRO
              </span>
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                FREE
              </span>
            )}
          </div>
          {email && (
            <p className="text-[11px] text-muted-foreground truncate font-mono">{email}</p>
          )}
        </div>

        {/* Upgrade to Pro CTA inside Menu */}
        {!isPro && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 text-[11px] space-y-2 mb-1">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>SnapFrame Pro</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-extrabold">{aiCredits}/3 Credits</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Get unlimited AI vision, 4K lossless exports, and video/GIF studio.
            </p>
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full h-7 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Crown className="w-3 h-3 text-amber-300" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        )}

        {isAnonymous && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] space-y-2 mb-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Guest Mode (30-day Auto Clean-up)</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Link with Google or GitHub to keep your projects permanently.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="w-full h-7 rounded-lg bg-amber-500 text-black text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-amber-400 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Link Account (Free)</span>
            </button>
          </div>
        )}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => router.push("/account")}
          className="text-xs font-medium text-foreground hover:bg-secondary rounded-xl cursor-pointer p-2 flex items-center gap-2"
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
          <span>Account &amp; Billing</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/projects")}
          className="text-xs font-medium text-foreground hover:bg-secondary rounded-xl cursor-pointer p-2 flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>My Projects</span>
        </DropdownMenuItem>

        {isUserAdmin(user.email) && (
          <DropdownMenuItem
            onClick={() => router.push("/admin")}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer p-2 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Console</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30">
              ADMIN
            </span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={async () => {
            await signOutUser();
            if (typeof window !== "undefined" && window.location.pathname.startsWith("/account")) {
              router.push("/");
            }
          }}
          className="text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer p-2 flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
