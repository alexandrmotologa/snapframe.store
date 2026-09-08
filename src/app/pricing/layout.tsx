import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - SnapFrame Pro",
  description:
    "Pricing for mobile developers and agencies. Get SnapFrame Pro for unlimited projects, real-time cloud sync, 4K exports, and multi-language localization.",
  alternates: {
    canonical: "https://snapframe.store/pricing",
  },
  openGraph: {
    title: "SnapFrame Pro - Pricing",
    description: "Export high-resolution App Store and Google Play screenshots with cloud sync and Fastlane metadata.",
    url: "https://snapframe.store/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
