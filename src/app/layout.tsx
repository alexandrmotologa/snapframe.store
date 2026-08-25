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
      featureList: [
        "App Store screenshot templates",
        "Google Play screenshot templates",
        "Device mockup frames",
        "Multilingual export (40+ languages)",
        "AI caption generation",
        "Animated GIF export",
        "Custom backgrounds and gradients",
        "Character/mascot library",
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
