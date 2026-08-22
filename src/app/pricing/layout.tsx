import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans - SnapFrame Pro",
  description:
    "Transparent and affordable pricing for mobile app developers and design agencies. Get SnapFrame Pro for unlimited projects, real-time cloud sync, 4K exports, and AI superpowers.",
  alternates: {
    canonical: "https://snapframe.store/pricing",
  },
  openGraph: {
    title: "SnapFrame Pro - Pricing & Plans",
    description: "Export high-resolution App Store & Google Play screenshots with AI superpowers and cloud sync.",
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
