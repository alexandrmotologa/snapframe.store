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

interface FaqItem {
  category: "Account & Sync" | "AI & Features" | "Pricing & Refunds" | "Store Assets";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Account & Sync",
    question: "What is the difference between Guest, Free Registered, and Pro accounts?",
    answer: "• Guest Mode (Unregistered): 1 session project with 1-click clipboard PNG copying for the active screen (ZIP packages require signing in).\n• Free Registered (Google/GitHub): Stores up to 3 projects locally on your device, 3 complimentary AI credits, free ZIP export of up to 3 screens per set (1 platform), 1-click clipboard copy for screens 1–3, Phone Live Store simulator, standard 2D & Titanium frames, and 100% free unlimited Video/GIF & Store Icon Studio exports.\n• SnapFrame Pro ($9/mo or $69/yr): Unlimited projects with real-time Multi-Device Cloud Sync (Firestore), full 10-screen multi-platform ZIP packages (iOS + iPad + Android + Tablet), Custom Canvas Dimensions (freeform W×H), Social Media Presets (Product Hunt, Twitter, Instagram 1:1, Web Hero), Mockup Frame Scaling (50%–150%), 1-click clipboard copy on all 10 screens, Dual Theme Generator (Light & Dark sets in 1-click), iPad Pro & Tablet Store Simulator, all luxury 3D mockup frames (Clay, Glass, Neon, Wireframe), batch 40+ language localizations, Fastlane metadata suite, 4K lossless exports, and 500 AI generations/month.",
  },
  {
    category: "Account & Sync",
    question: "How does Multi-Device Cloud Sync work and will I lose my local projects?",
    answer: "You will never lose your work. For Free users, projects are stored locally in your browser storage. When you upgrade to SnapFrame Pro, our system automatically migrates and uploads all your existing local projects to your secure Google Cloud Firestore account. From that point forward, every change syncs across all your devices (Mac, Windows, iPad, etc.) in real time.",
  },
  {
    category: "Account & Sync",
    question: "Can I access my projects from another computer or browser on the Free plan?",
    answer: "Free plan projects are saved to the local browser storage of the device where they were created. To seamlessly edit and synchronize projects across multiple laptops, desktops, and mobile devices, upgrade to SnapFrame Pro.",
  },
  {
    category: "AI & Features",
    question: "What is the 500 AI Generations / Month Fair Usage Policy?",
    answer: "SnapFrame Pro includes up to 500 AI calls per month. This covers AI Auto-Pilot Vision analysis, AI copywriting, 3D background element pop-out, and multi-language translations across 40+ languages. 500 monthly calls is more than enough for active indie developers and agencies publishing dozens of app updates each month.",
  },
  {
    category: "AI & Features",
    question: "Are the Video / GIF and App Icon Studio tools free?",
    answer: "Yes! Creating 60fps MP4/WebM animated teaser videos, GIF carousels, official App Store & Google Play 1024x1024 icons, and generating full Xcode AppIcon.appiconset.zip and Android mipmap.zip asset packages runs client-side in your browser and is 100% free and unlimited for all registered accounts.",
  },
  {
    category: "Store Assets",
    question: "Are the exported screenshots and mockups commercially licensed?",
    answer: "Yes! 100% of all mockups, screenshots, video previews, and app icons you create with SnapFrame include a perpetual, royalty-free commercial license. You can upload them directly to App Store Connect, Google Play Console, your marketing websites, and advertising campaigns.",
  },
  {
    category: "Store Assets",
    question: "Can I inspect the source code and what license does SnapFrame use?",
    answer: "SnapFrame is source-available on GitHub under the Business Source License 1.1 (BSL 1.1), maintained by MTLG Labs (Alexandr Motologa). Developers are welcome to review the codebase, submit contributions, and test locally for evaluation. However, operating a competing commercial SaaS or public screenshot generation service using this code is strictly prohibited.",
  },
  {
    category: "Pricing & Refunds",
    question: "What is your Refund Policy for SnapFrame Pro?",
    answer: "We offer a 14-day money-back guarantee for unutilized accounts. If you subscribe to SnapFrame Pro and request a cancellation within 14 calendar days without having consumed AI generation credits and without having synced projects to multi-device Firestore cloud storage, you will receive a 100% full refund through Paddle. Once AI compute or cloud storage infrastructure is actively utilized, third-party server and model costs are permanently incurred on your behalf and the service is considered fulfilled.",
  },
  {
    category: "Pricing & Refunds",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with 1 click from your account dashboard or via the Paddle customer portal. Upon cancellation, you retain full Pro access until the end of your prepaid billing period, and no further renewals will occur.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Account & Sync", "AI & Features", "Pricing & Refunds", "Store Assets"];

  const filteredFaqs = FAQ_ITEMS.filter((item) =>
    activeCategory === "All" ? true : item.category === activeCategory
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
