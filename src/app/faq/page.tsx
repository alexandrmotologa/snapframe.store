"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { SnapFrameLogo } from "@/components/ui/SnapFrameLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { Footer } from "@/components/dashboard/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { PRO_MONTHLY_AI_CREDITS, DEFAULT_FREE_AI_CREDITS } from "@/lib/constants";

interface FaqItem {
  category: "Account & Sync" | "AI & Features" | "Pricing & Refunds" | "Store Assets";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Account & Sync",
    question: "What is the difference between Guest, Free Registered, and Pro accounts?",
    answer: `• Guest Mode: 1 session project with clipboard PNG copying for the active screen (ZIP packages require signing in).\n• Free Registered (Google or GitHub): Saves up to 3 projects locally in your browser, ${DEFAULT_FREE_AI_CREDITS} trial AI credits, ZIP export of up to 3 screens per set (1 platform), clipboard copy for screens 1 to 3, phone store simulator, flat and titanium frames, and unlimited video, GIF, and icon exports.\n• SnapFrame Pro ($9/mo or $69/yr): Unlimited projects with multi-device cloud sync (Firestore), full 10-screen multi-platform ZIP packages (iOS, iPad, Android, Tablet), custom canvas dimensions, social media presets, mockup frame scaling (50% to 150%), clipboard copy on all 10 screens, dual light and dark set generation, tablet store simulator, 3D mockup frames, batch 40+ language localizations, Fastlane metadata package, 4K lossless exports, and unlimited AI generations under our fair usage policy (~${PRO_MONTHLY_AI_CREDITS.toLocaleString()}/month).`,
  },
  {
    category: "Account & Sync",
    question: "How does Multi-Device Cloud Sync work and will I lose my local projects?",
    answer: "Free plan projects stay in your local browser storage. When you upgrade to SnapFrame Pro, all existing local projects automatically upload to Google Cloud Firestore, keeping your work synchronized in real time across your devices.",
  },
  {
    category: "Account & Sync",
    question: "Can I access my projects from another computer or browser on the Free plan?",
    answer: "Free plan projects remain in the browser where you created them. To access and edit your projects across multiple computers or tablets, upgrade to SnapFrame Pro.",
  },
  {
    category: "AI & Features",
    question: "How does the Unlimited AI Generations Fair Usage Policy work?",
    answer: `To maintain service availability and prevent automated abuse, a monthly fair usage limit of ~${PRO_MONTHLY_AI_CREDITS.toLocaleString()} AI generations applies to Pro accounts. This covers vision layout analysis, copywriting, and multi-language translations in 40+ languages, which is plenty for active publishing across multiple apps.`,
  },
  {
    category: "AI & Features",
    question: "Are the Video / GIF and App Icon Studio tools free?",
    answer: "Yes. Creating 60fps MP4 and WebM videos, animated GIFs, 1024x1024 store icons, and Xcode or Android icon asset packages runs client-side in your browser and is free for all registered accounts.",
  },
  {
    category: "Store Assets",
    question: "Are the exported screenshots and mockups commercially licensed?",
    answer: "Yes. All mockups, screenshots, video previews, and app icons created with SnapFrame include a commercial license. You can publish them directly to App Store Connect, Google Play Console, websites, and marketing campaigns.",
  },
  {
    category: "Store Assets",
    question: "Can I inspect the source code and what license does SnapFrame use?",
    answer: "SnapFrame is source-available on GitHub under the Business Source License 1.1 (BSL 1.1), maintained by MTLG Labs. You can inspect the codebase, submit contributions, and test locally. Operating a competing commercial screenshot service using this code is not permitted.",
  },
  {
    category: "Pricing & Refunds",
    question: "What is your Refund Policy for SnapFrame Pro?",
    answer: "We offer a 14-day money-back guarantee for unutilized accounts. If you subscribe to SnapFrame Pro and request a cancellation within 14 calendar days without using AI generation credits, exporting Pro 10-screen packages, or saving projects to cloud storage, you will receive a full refund through Paddle. Once AI generations, Pro exports, or cloud sync have been used, computing expenses have been incurred and the subscription is considered fulfilled.",
  },
  {
    category: "Pricing & Refunds",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes. You can cancel your subscription at any time from your account dashboard or through the Paddle customer portal. You retain Pro access until the end of your prepaid billing period, with no automatic renewal.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Account & Sync", "AI & Features", "Pricing & Refunds", "Store Assets"];

  const filteredFaqs = FAQ_ITEMS.filter((item) =>
    activeCategory === "All" ? true : item.category === activeCategory
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* FAQPage Structured Data for Google SERP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
              View Pricing
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 sm:py-16 space-y-12">
        {/* Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base &amp; FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about SnapFrame account tiers, project limits, real-time cloud sync, and commercial licensing.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Quick Help Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-purple-950/20 to-card border border-primary/20 text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">Still have questions?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Our support team is always here to help you get your app screenshots ready for the App Store &amp; Google Play.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="mailto:support@snapframe.store"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Contact Support
            </a>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border/60 transition-all cursor-pointer"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
