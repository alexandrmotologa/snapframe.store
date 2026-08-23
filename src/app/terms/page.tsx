import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Scale,
  Lock,
  CreditCard,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | SnapFrame",
  description:
    "Read the Terms of Service governing your use of SnapFrame, including commercial licensing, intellectual property rights, and user account policies.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "August 20, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <SnapFrameLogo size={32} withText textClassName="text-lg" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before using SnapFrame. By accessing or using our website, editor, and screenshot generation tools, you agree to be bound by these terms.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Version: 2.4</span>
            <span>•</span>
            <span>Applicability: Global</span>
          </div>
        </div>

        {/* Quick Highlights Summary Card */}
        <div className="my-10 p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Key Terms Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">100% Ownership of Your Content:</span>
                <p className="text-muted-foreground mt-0.5">You retain all rights, copyright, and commercial ownership of your uploaded app screenshots and exported visual assets.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Commercial Use Permitted:</span>
                <p className="text-muted-foreground mt-0.5">You are fully licensed to publish exported screenshot sets to Apple App Store, Google Play Console, websites, and marketing campaigns.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Fair & Responsible Usage:</span>
                <p className="text-muted-foreground mt-0.5">You agree not to upload abusive, infringing, or malicious content, or abuse automated endpoints.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Store Compliance Verification:</span>
                <p className="text-muted-foreground mt-0.5">You are responsible for ensuring your final screenshot graphics comply with Apple and Google developer guidelines.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Sections */}
        <div className="space-y-12 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
              Agreement to Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (whether individually or on behalf of an entity) and SnapFrame, operated by <strong>MTLG Labs (Alexandr Motologa)</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), concerning your access to and use of the SnapFrame platform located at{" "}
              <a href="https://snapframe.store" className="text-primary hover:underline">https://snapframe.store</a>.
            </p>
            <p>
              If you do not agree with all of these Terms, you are prohibited from using the platform and must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Description of the Service
            </h2>
            <p>
              SnapFrame provides web-based design software for mobile developers, marketers, and designers to create App Store and Google Play screenshot sets. Features include device frames (3D/2D models), panoramic continuous layouts, template galleries, multilingual translation tools, AI caption generation, and multi-format exports (PNG, ZIP, WebP, GIF).
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
              User Accounts, Authentication &amp; Guest Mode
            </h2>
            <p>
              To access saved projects and cloud synchronization, you must authenticate via Google OAuth, GitHub OAuth, or continue in Guest Mode. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Maintain the security of your connected OAuth accounts.</li>
              <li>Remain solely responsible for all activities and designs created under your account.</li>
              <li>
                <strong>Anonymous (Guest) Accounts &amp; 30-Day Auto Clean-up:</strong> Auto clean-up automatically deletes anonymous accounts that are older than 30 days. When this setting is enabled, anonymous usage will no longer count towards usage or billing quotas. SnapFrame does not guarantee recovery of projects created in unlinked guest sessions that are purged. You can link your guest account to a verified Google or GitHub profile at any time to preserve your projects permanently.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
              Intellectual Property &amp; Ownership Rights
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Your Content &amp; Exported Screenshots
                </h3>
                <p className="text-xs text-muted-foreground">
                  You retain 100% full intellectual property ownership, copyright, and commercial usage rights in and to all images, screenshots, logos, trademarks, and text that you upload or compose in SnapFrame. SnapFrame claims zero ownership or licensing rights over your exported screenshots.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/70 space-y-1.5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  SnapFrame Platform &amp; License (BSL 1.1)
                </h3>
                <p className="text-xs text-muted-foreground">
                  The SnapFrame software, user interface design, device frame models, curated layout engines, code, logos, and trademarks are the proprietary intellectual property of <strong>MTLG Labs (Alexandr Motologa)</strong>. The underlying source code is made available under the Business Source License 1.1 (BSL 1.1), permitting evaluation and personal testing while strictly prohibiting the unauthorized hosting of competing commercial screenshot generation services.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">5</span>
              Account Tiers, Subscriptions &amp; Cloud Storage
            </h2>
            <p>
              SnapFrame provides multiple service tiers to accommodate independent developers, studios, and agencies:
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                <span className="font-bold text-foreground">👤 Guest Mode (Unregistered):</span>
                <p className="text-muted-foreground mt-0.5">
                  Includes <strong>one (1) active session project</strong>, 1-click clipboard PNG copying, and full canvas editing playground. Exporting screenshot ZIP packages and AI generation require registering for a free account.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60">
                <span className="font-bold text-foreground">🟢 Free Account Tier ($0 Forever):</span>
                <p className="text-muted-foreground mt-0.5">
                  Includes up to <strong>three (3) active projects</strong> stored locally within your browser storage (<code className="text-foreground">localStorage</code>), free ZIP export for up to <strong>3 screenshots per set</strong> for a single device platform, 1-click clipboard copy for screens 1 to 3, Phone live store simulator, standard 2D &amp; Titanium frames, unlimited client-side Video/GIF and Store Assets exports, and three (3) complimentary AI credits upon registration. Free accounts do not include multi-device cloud synchronization, tablet store simulation, dual theme generators, luxury 3D frames, or Fastlane metadata suites.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-primary/30 shadow-xs">
                <span className="font-bold text-foreground">⭐ SnapFrame Pro Tier ($9/month or $69/year):</span>
                <p className="text-muted-foreground mt-0.5">
                  Includes <strong>unlimited projects</strong>, automatic real-time <strong>Multi-Device Cloud Synchronization</strong> powered by Google Cloud Firestore (allowing instant seamless access across Mac, PC, and mobile), full <strong>10-screen multi-platform ZIP exports</strong> (iOS, iPadOS, Android, and Tablets), 1-click clipboard PNG copying on all 10 screens, batch <strong>40+ language localization exports</strong>, complete Fastlane metadata packages, 4K lossless master resolution, Dual Theme generators (1-click Light &amp; Dark matching sets), iPad Pro 13&quot; &amp; Tablet store simulators, all luxury 3D mockup frames (Clay, Glass, Neon, Wireframe), and up to <strong>500 AI generations per month</strong> governed by our Fair Usage Policy.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2 text-xs mt-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Merchant of Record &amp; Payment Processing (Paddle.com)
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle handles all customer service inquiries, tax calculation (VAT, Sales Tax, GST), invoice issuance, and returns. By purchasing a subscription, you agree to Paddle&apos;s Buyer Terms and Conditions.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground pt-1">
                <li><strong>Recurring Billing:</strong> Pro subscriptions are billed on a recurring basis (Monthly at $9/month or Annually at $69/year) until canceled.</li>
                <li><strong>Cancellation:</strong> You can cancel your subscription at any time via your account settings or the Paddle customer portal. Upon cancellation, you retain access until the end of your prepaid billing period.</li>
                <li><strong>Refunds:</strong> We provide a 14-day money-back guarantee on unutilized accounts. As detailed in our <Link href="/refunds" className="text-primary font-semibold hover:underline">Refund Policy</Link>, once an account actively consumes AI generation credits or utilizes multi-device Firestore cloud storage, non-recoverable third-party server and compute expenses have been incurred, and retrospective refunds are no longer available.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">6</span>
              Commercial License
            </h2>
            <p>
              You are granted a perpetual, royalty-free, worldwide license to use, display, publish, and commercially distribute any screenshot artwork generated and exported via SnapFrame. This includes publishing to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Apple App Store Connect (iOS, iPadOS, macOS, watchOS, visionOS)</li>
              <li>Google Play Console (Phones, Tablets, Wearables, Android TV)</li>
              <li>Marketing landing pages, advertising creatives, press kits, and social media</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">7</span>
              Prohibited Conduct
            </h2>
            <p>You agree not to use SnapFrame to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Upload or generate content that is unlawful, infringing, fraudulent, defamatory, or promotes violence or illegal acts.</li>
              <li>Attempt to reverse-engineer, decompile, or extract the source code of non-open-source server modules.</li>
              <li>Abuse, overload, or bypass rate limits on our API endpoints, AI caption services, or cloud infrastructure.</li>
              <li>Impersonate any person, developer, or company or misrepresent affiliation with third-party app stores.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">7</span>
              AI Features & Content Disclaimer
            </h2>
            <p>
              AI-generated content (such as headlines, translations, and ASO keywords) is produced automatically using third-party large language models. While we strive for accuracy and compelling copywriting, AI outputs are provided &quot;as is&quot;. You are responsible for reviewing and verifying all generated text prior to publishing.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">8</span>
              App Store & Google Play Guidelines Disclaimer
            </h2>
            <p>
              SnapFrame provides standard dimension presets and device frames configured according to official App Store and Google Play specifications. However, Apple and Google update their review guidelines periodically. SnapFrame is an independent tool and is not affiliated with, endorsed by, or sponsored by Apple Inc. or Google LLC. You remain solely responsible for ensuring your app submission complies with applicable store review guidelines.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">9</span>
              Disclaimer of Warranties & Limitation of Liability
            </h2>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-xs space-y-2">
              <p>
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SNAPFRAME SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">10</span>
              Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes become effective immediately upon posting to this page. Continued use of SnapFrame after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">11</span>
              Contact Information
            </h2>
            <p>
              For legal inquiries, copyright notices, or questions regarding these Terms:
            </p>
            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="w-4 h-4 text-primary" />
                <span>MTLG Labs Legal Office</span>
              </div>
              <p className="text-muted-foreground">Operator: <strong>MTLG Labs (Alexandr Motologa)</strong></p>
              <p className="text-muted-foreground">Email: <a href="mailto:terms@snapframe.store" className="text-primary hover:underline">terms@snapframe.store</a></p>
              <p className="text-muted-foreground">Website: <a href="https://snapframe.store" className="text-primary hover:underline">https://snapframe.store</a></p>
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
            href="/privacy"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View Privacy Policy →
          </Link>
        </div>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
