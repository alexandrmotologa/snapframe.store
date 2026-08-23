import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | SnapFrame",
  description:
    "Learn how SnapFrame collects, protects, and handles your data in full compliance with the European General Data Protection Regulation (GDPR) and CCPA.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            GDPR & CCPA Compliant
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            At SnapFrame, we respect your privacy and are committed to protecting your personal data. This Privacy Policy details our practices concerning data collection, processing, storage, and your rights under the General Data Protection Regulation (EU) 2016/679 (GDPR) and California Consumer Privacy Act (CCPA).
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Version: 2.4</span>
            <span>•</span>
            <span>Jurisdiction: European Union & Worldwide</span>
          </div>
        </div>

        {/* Quick Highlights Summary Card */}
        <div className="my-10 p-6 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Key Privacy Commitments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Client-Side First:</span>
                <p className="text-muted-foreground mt-0.5">Your raw screenshots and canvas rendering execute directly in your browser canvas.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">No Model Training on User Images:</span>
                <p className="text-muted-foreground mt-0.5">Optional AI captioning tools never use your screenshots to train public AI models.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Zero Sale of Personal Data:</span>
                <p className="text-muted-foreground mt-0.5">We do not sell, rent, or trade your personal information to any third parties.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Full Right to Erasure:</span>
                <p className="text-muted-foreground mt-0.5">You can delete your projects or request complete account erasure at any time.</p>
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
              Data Controller
            </h2>
            <p>
              <strong>MTLG Labs (Alexandr Motologa)</strong> operates as the Data Controller under Article 4(7) of the GDPR for the personal data collected through the SnapFrame website (
              <a href="https://snapframe.store" className="text-primary hover:underline">https://snapframe.store</a>
              ) and associated services.
            </p>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-xs text-foreground space-y-1">
              <p className="font-semibold">MTLG Labs Data Protection &amp; Legal Office</p>
              <p className="text-muted-foreground">Operator: <strong>MTLG Labs (Alexandr Motologa)</strong></p>
              <p className="text-muted-foreground">Email: <a href="mailto:privacy@snapframe.store" className="text-primary hover:underline">privacy@snapframe.store</a></p>
              <p className="text-muted-foreground">GitHub Security: <a href="https://github.com/alexandrmotologa/snapframe.store/security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Security Advisory Hub</a></p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
              Information We Collect
            </h2>
            <p>We process personal and non-personal data strictly as required to provide our screenshot creation service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Account & Authentication Data:</strong> When registering or logging in via Google OAuth, GitHub OAuth, or Email & Password (managed through Google Firebase Authentication), we receive your unique User ID (UID), email address, display name, and avatar URL. Passwords are never stored directly by us and are securely salted and hashed by Firebase.
              </li>
              <li>
                <strong className="text-foreground">Project &amp; Design Data:</strong> Project metadata (project name, created/updated timestamps, device presets, layer coordinates, headlines, colors, and layout configurations). For Guest and Free users, projects are stored strictly locally in your browser storage (<code className="text-foreground">localStorage</code>). For SnapFrame Pro subscribers, project data is securely synchronized and backed up to encrypted Google Cloud Firestore databases under your authenticated user ID.
              </li>
              <li>
                <strong className="text-foreground">Uploaded Screenshots & Images:</strong> App screenshots and media uploaded to the canvas are rendered client-side in HTML5 Canvas. If cloud sync or asset hosting is active, image assets are stored securely in encrypted object storage.
              </li>
              <li>
                <strong className="text-foreground">Telemetry & Usage Diagnostics:</strong> Anonymized interaction events (e.g. template clicks, export trigger counts) collected via privacy-configured PostHog analytics to diagnose application performance and improve usability.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
              Legal Bases for Processing (GDPR Art. 6)
            </h2>
            <p>We process your data strictly under the following legal bases:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1">
                <h3 className="text-xs font-bold text-foreground">Contractual Necessity (Art. 6(1)(b))</h3>
                <p className="text-[11px] text-muted-foreground">To deliver screenshot generation, project persistence, canvas editing, and 4K asset exporting.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1">
                <h3 className="text-xs font-bold text-foreground">Legitimate Interest (Art. 6(1)(f))</h3>
                <p className="text-[11px] text-muted-foreground">To maintain application stability, prevent malicious abuse, and secure authenticated user sessions.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-1">
                <h3 className="text-xs font-bold text-foreground">Explicit Consent (Art. 6(1)(a))</h3>
                <p className="text-[11px] text-muted-foreground">When you invoke optional AI caption generation or opt-in analytics tracking.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
              AI Superpowers & Machine Learning Processing
            </h2>
            <p>
              SnapFrame provides optional AI features (AI Auto-Pilot, AI Caption Generator, Multi-Language Translation, and ASO Metadata Optimizer) powered by enterprise API endpoints (Google Gemini, OpenAI, Groq, and Mistral):
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Text prompts or image previews submitted to AI features are processed in real-time strictly to return the generated captions, translations, or design layouts.</li>
              <li>Data transmitted to these AI providers is governed by enterprise API terms that <strong>explicitly prohibit using customer data to train foundational models</strong>.</li>
              <li>You can use the entire SnapFrame editor without activating AI features.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">5</span>
              Third-Party Subprocessors
            </h2>
            <p>We work with trusted, GDPR-compliant infrastructure partners under Data Processing Addenda (DPA):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-border/60 rounded-xl overflow-hidden">
                <thead className="bg-secondary/50 text-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3">Subprocessor</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Data Location</th>
                    <th className="p-3">Compliance Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr>
                    <td className="p-3 font-medium text-foreground">Paddle.com (Merchant of Record)</td>
                    <td className="p-3">Payment processing, recurring subscriptions, tax compliance, invoicing</td>
                    <td className="p-3">UK / EU / US</td>
                    <td className="p-3">PCI-DSS Level 1, GDPR DPA, SCCs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Google Cloud / Firebase</td>
                    <td className="p-3">Authentication, Firestore database, hosting</td>
                    <td className="p-3">EU / US</td>
                    <td className="p-3">EU Standard Contractual Clauses (SCCs)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Vercel Inc.</td>
                    <td className="p-3">Edge application delivery and serverless execution</td>
                    <td className="p-3">Global Edge Network</td>
                    <td className="p-3">ISO 27001, SOC 2, SCCs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Google Gemini API</td>
                    <td className="p-3">Optional AI multimodal vision and captioning</td>
                    <td className="p-3">US / Global</td>
                    <td className="p-3">Google Cloud Enterprise Terms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">PostHog</td>
                    <td className="p-3">Product analytics and error reporting</td>
                    <td className="p-3">EU Cloud</td>
                    <td className="p-3">GDPR Compliant Analytics DPA</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Payment Data Security:</strong> SnapFrame does not store or process raw credit card numbers or payment credentials on our servers. All financial transactions and payment data are handled directly and securely by Paddle.com in full compliance with PCI-DSS Level 1 security standards.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">6</span>
              Your Rights under GDPR and CCPA
            </h2>
            <p>Under the GDPR (Articles 15–22) and CCPA/CPRA, you possess comprehensive rights over your personal data:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground">Right of Access (Art. 15)</span>
                <p className="text-[11px] text-muted-foreground">Request a copy of all personal data and project records associated with your account.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground">Right to Erasure (Art. 17)</span>
                <p className="text-[11px] text-muted-foreground">Request complete deletion of your account and all associated cloud project data.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground">Right to Data Portability (Art. 20)</span>
                <p className="text-[11px] text-muted-foreground">Export your projects, screenshots, and metadata in standard formats (ZIP, PNG, JSON).</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground">Right to Rectification (Art. 16)</span>
                <p className="text-[11px] text-muted-foreground">Update or correct any inaccurate personal details or account email addresses.</p>
              </div>
            </div>
            <p className="pt-2 text-xs">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@snapframe.store" className="text-primary font-semibold hover:underline">
                privacy@snapframe.store
              </a>
              . We will respond within 30 days without any fee.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">7</span>
              Data Retention & Security Measures
            </h2>
            <p>
              We implement industry-grade technical and organizational security measures (TOMs) under Article 32 of GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>All web traffic is encrypted with Transport Layer Security (TLS 1.3).</li>
              <li>Database records and authentication tokens are encrypted at rest with AES-256.</li>
              <li>Local projects stored in your browser persist only on your device until manually cleared.</li>
              <li>Cloud-synchronized project data for registered accounts is retained until you delete the project or close your account.</li>
              <li>
                <strong>Anonymous / Guest Accounts Auto Clean-up:</strong> In accordance with data minimization policies and Firebase standards, anonymous accounts older than 30 days are automatically deleted. When auto clean-up is active, anonymous usage will no longer count towards usage or billing quotas. You can link your guest session to Google or GitHub at any time to preserve your projects permanently.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">8</span>
              Cookies & Local Storage
            </h2>
            <p>
              SnapFrame uses essential local storage keys to store your editor preferences (active language, dark/light theme, recent projects). We do not deploy third-party advertising cookies or cross-site tracking beacons.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">9</span>
              Contact & Inquiries
            </h2>
            <p>
              For privacy questions, data requests, or complaints, please reach out to our team:
            </p>
            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="w-4 h-4 text-primary" />
                <span>SnapFrame Legal & Privacy Team</span>
              </div>
              <p className="text-muted-foreground">Email: <a href="mailto:privacy@snapframe.store" className="text-primary hover:underline">privacy@snapframe.store</a></p>
              <p className="text-muted-foreground">EU Supervisory Authority: You have the right to lodge a complaint with your local European Data Protection Authority (DPA) if you believe our processing infringes the GDPR.</p>
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
