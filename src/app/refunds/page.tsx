import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Mail,
  CreditCard,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";

export const metadata: Metadata = {
  title: "Refund Policy | SnapFrame",
  description:
    "Learn about SnapFrame's 14-day money-back guarantee, cancellation policy, and how to request a refund through Paddle.",
};

export default function RefundPolicyPage() {
  const lastUpdated = "August 20, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              View Pricing Plans
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        {/* Title Header */}
        <div className="space-y-4 pb-10 border-b border-border/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            14-Day Money-Back Guarantee (Fair Policy)
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            We want you to be 100% satisfied with SnapFrame Pro. We offer a 14-day money-back guarantee on unutilized accounts, risk-free testing with our free tier, and 1-click instant cancellation anytime.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Version: 2.5</span>
            <span>•</span>
            <span>Merchant of Record: Paddle.com</span>
          </div>
        </div>

        {/* Highlight Guarantee Card */}
        <div className="my-10 p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Our Guarantee at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">14-Day Unutilized Full Refund:</span>
                <p className="text-muted-foreground mt-0.5">Request a 100% refund within 14 days if you have not consumed AI generation credits or exported Pro asset packages.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">1-Click Instant Cancellation:</span>
                <p className="text-muted-foreground mt-0.5">Cancel your subscription anytime from your account settings or the Paddle customer portal.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Fast 3–5 Day Processing:</span>
                <p className="text-muted-foreground mt-0.5">Refunds are returned directly to your original payment method (card, PayPal, Apple Pay).</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Keep Exported Assets:</span>
                <p className="text-muted-foreground mt-0.5">You retain full commercial rights to all screenshots you exported before canceling.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
              14-Day Money-Back Guarantee
            </h2>
            <p>
              All first-time purchases of SnapFrame Pro (both Monthly and Annual plans) are backed by our 14-day money-back guarantee for unutilized accounts. If you decide that SnapFrame is not the right tool for your workflow within 14 calendar days from the transaction date and have not actively consumed computational AI resources or downloaded Pro asset packages, you are entitled to a 100% full refund.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Digital Service Consumption &amp; Refund Eligibility
            </h2>
            <p>
              In accordance with international digital service standards and the European Consumer Rights Directive regarding immediate digital content delivery:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Unutilized Accounts (Full 100% Refund):</strong> If you purchase SnapFrame Pro and request a refund within 14 days without having consumed AI compute credits on your Pro subscription, without downloading Pro 10-screen ZIP exports, and without having synced projects to multi-device Firestore cloud storage, you will receive an unconditional 100% refund.
              </li>
              <li>
                <strong>Actively Utilized Accounts (Non-Refundable):</strong> Once a Pro subscriber actively utilizes the paid infrastructure — specifically by <em>performing AI generations (such as AI Vision Auto-Pilot, AI Background Cutout, or AI Translation)</em>, by <em>exporting Pro multi-platform 10-screen ZIP archives / Fastlane metadata</em>, or by <em>synchronizing project data to our dedicated Multi-Device Cloud Storage (Firestore)</em> — non-recoverable third-party server, database, and API expenses are permanently incurred on your behalf. Consequently, once these resources are actively consumed, the subscription is considered fulfilled and is no longer eligible for a retrospective refund.
              </li>
              <li>
                <strong>Cancel Anytime:</strong> If your account has been utilized and you wish to discontinue, you can cancel your subscription with 1 click. You will retain full Pro access until the conclusion of your billing cycle and will never be charged again.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Subscription Cancellation Terms
            </h2>
            <p>
              You may cancel your recurring subscription at any time:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>No Penalty or Lock-in:</strong> When you cancel, automatic renewals are stopped immediately.
              </li>
              <li>
                <strong>Active Period Retention:</strong> You will continue to have full access to SnapFrame Pro features until the end of your current paid billing period (e.g., the remainder of the month or year).
              </li>
              <li>
                <strong>No Surprise Charges:</strong> You will not be billed again after canceling.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
              How to Request a Refund
            </h2>
            <p>
              You can request a refund quickly through either of the following methods:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Option A: Email SnapFrame Support
                </h3>
                <p className="text-xs text-muted-foreground">
                  Send an email to <a href="mailto:support@snapframe.store" className="text-primary font-semibold hover:underline">support@snapframe.store</a> with your account email address and Paddle Order ID. We process all refund requests within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Option B: Paddle Buyer Support
                </h3>
                <p className="text-xs text-muted-foreground">
                  Visit the official Paddle Buyer Portal at <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">paddle.net</a> or click the link in your email purchase receipt to request an immediate refund from our Merchant of Record.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">5</span>
              Refund Processing &amp; Payout Timelines
            </h2>
            <p>
              Once approved, your refund is initiated immediately by Paddle:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Credit / Debit Cards:</strong> 3 to 5 business days (depending on your issuing bank).</li>
              <li><strong>PayPal:</strong> Instant to 24 hours.</li>
              <li><strong>Apple Pay / Google Pay:</strong> Typically 1 to 3 business days back to the underlying linked card.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">6</span>
              Merchant of Record Notice (Paddle.com)
            </h2>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 text-xs space-y-2">
              <p>
                Our order process for SnapFrame (operated by <strong>MTLG Labs / Alexandr Motologa</strong>) is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns and chargebacks in compliance with global consumer protection regulations and European statutory withdrawal rights.
              </p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="pt-12 mt-12 border-t border-border/50 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <Link
            href="/terms"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View Terms of Service →
          </Link>
        </div>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
