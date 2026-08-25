import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://snapframe.store";
const APP_NAME = "SnapFrame";
const TITLE = "SnapFrame - Free App Store & Google Play Screenshot Generator";
const DESCRIPTION =
  "Create stunning App Store and Google Play screenshots in minutes. Free online screenshot generator with device mockups, multilingual export, AI captions, animated GIFs, and custom designs.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "app store screenshots",
    "google play screenshots",
    "screenshot generator",
    "app mockup creator",
    "device frame generator",
    "ios screenshots",
    "android screenshots",
    "app marketing screenshots",
    "free screenshot tool",
    "multilingual app screenshots",
    "animated gif screenshots",
    "ai caption generator",
    "app store templates",
    "gaming app screenshot templates",
    "fintech crypto templates",
    "ai copilot screenshot templates",
  ],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapFrame — App Store Screenshot Generator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@snapframe",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "fhFL9DoysKUiSC-cQgZzMzGN2SnTZyOlc4mFi-aZbjg",
  },
};

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
      { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    ],
  };
}

// ── JSON-LD Structured Data ──────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#app`,
      name: APP_NAME,
      url: APP_URL,
      description: DESCRIPTION,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "8",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Marcus Lindqvist",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5.0",
          },
          reviewBody: "Used to spend half my Sunday exporting 6.9\" and 6.5\" frames in Figma. With SnapFrame, I dropped my raw screenshots in and had all localized ZIP bundles ready in 5 minutes.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Sarah Kim",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "4.5",
          },
          reviewBody: "My clients love split-device layouts across two slides. SnapFrame aligns the canvas offset automatically with zero clipping issues. The 3D device renders look super crisp.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Alexandre Rodriguez",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5.0",
          },
          reviewBody: "I love that you can test everything with Ctrl+V before paying anything. The organized Fastlane folder structure made our release pipeline so much easier.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Elena Vance",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "4.5",
          },
          reviewBody: "We translated all 5 screenshot slides to German and Spanish in one click with matching typography. Saved us from delaying our EU launch.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Daisuke Tanaka",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5.0",
          },
          reviewBody: "The titanium bezels and soft shadows make raw simulator captures look incredible. Several indie devs on X asked what tool I used.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Mateo Silva",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "4.0",
          },
          reviewBody: "Most tools only care about iPhone. SnapFrame gave me clean, uncompressed sets for both phones and tablets without stretched borders.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Liam O'Connor",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5.0",
          },
          reviewBody: "We duplicate projects, tweak headlines or gradients, and download ready-to-upload PNGs in 30 seconds. Great utility for growth experiments.",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Amira El-Sayed",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
          },
          reviewBody: "Our marketing intern created our full App Store set on her first morning. Preset store sizes ensure Connect never rejects the uploads.",
        },
      ],
      featureList: [
        "55+ App Store & Google Play screenshot templates",
        "12+ Industry niche showcase kits (Gaming, AI, Fintech, Luxury, Health, Cinema)",
        "Device mockup frames & 3D tilted perspectives",
        "Multilingual export (40+ languages)",
        "AI caption generation & ASO metadata generator",
        "Animated GIF & 4K master export",
        "Custom backgrounds and continuous panoramic flows",
        "Character/mascot library & drag-and-drop block elements",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#org`,
      name: APP_NAME,
      url: APP_URL,
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#site`,
      url: APP_URL,
      name: APP_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#org` },
    },
  ],
};


import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { ToastContainer } from "@/components/ui/toast";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <TooltipProvider>
              {children}
              <ToastContainer />
              <CookieConsentBanner />
            </TooltipProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
