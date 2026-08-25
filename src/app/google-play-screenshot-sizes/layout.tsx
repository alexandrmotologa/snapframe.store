import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Play Screenshot Sizes & Feature Graphic Guide (2025/2026)",
  description:
    "Official 2025/2026 Google Play Store screenshot dimensions, aspect ratios, tablet guidelines (7\" & 10\"), and 1024x500 feature graphic specs for Android developers.",
  keywords: [
    "google play screenshot sizes",
    "google play feature graphic size",
    "android app screenshot dimensions",
    "google play console screenshot specs",
    "android tablet screenshot size",
    "google play 1024x500",
  ],
  alternates: {
    canonical: "https://snapframe.store/google-play-screenshot-sizes",
  },
  openGraph: {
    title: "Google Play Screenshot Sizes & Feature Graphic Guide",
    description: "Official Android phone, tablet, and 1024x500 feature graphic specifications for Google Play Console.",
    url: "https://snapframe.store/google-play-screenshot-sizes",
  },
};

export default function GooglePlaySizesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
