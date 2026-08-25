import type { Metadata } from "next";
import { TemplatesClient } from "./TemplatesClient";

export const metadata: Metadata = {
  title: "App Store & Google Play Screenshot Templates (2026) | SnapFrame",
  description:
    "Explore 50+ professionally designed App Store and Google Play screenshot templates. Ready-to-use layouts for Fintech, AI, Health, Gaming, Productivity, and E-commerce.",
  keywords: [
    "app store screenshot templates",
    "google play screenshot templates",
    "app mockup templates",
    "ios app screenshot designs",
    "android app screenshot templates",
    "fintech screenshot template",
    "health and fitness app screenshots",
    "ai app store templates",
    "free screenshot templates",
    "app store optimization templates",
  ],
  alternates: {
    canonical: "https://snapframe.store/templates",
  },
  openGraph: {
    title: "App Store & Google Play Screenshot Templates (2026) | SnapFrame",
    description:
      "Explore 50+ professionally designed App Store and Google Play screenshot templates with panoramic flows and 3D device mockups.",
    url: "https://snapframe.store/templates",
    siteName: "SnapFrame",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapFrame Screenshot Templates Gallery",
      },
    ],
  },
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
