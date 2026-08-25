import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Store Screenshot Sizes Guide (2025/2026 iOS & iPadOS)",
  description:
    "Complete 2025/2026 Apple App Store screenshot dimensions guide for iPhone 16 Pro Max, iPhone 15, iPad Pro 13\", and Apple Watch. Verified App Store Connect specifications.",
  keywords: [
    "app store screenshot sizes",
    "ios screenshot dimensions",
    "iphone 16 pro max screenshot size",
    "ipad pro 13 screenshot size",
    "app store connect screenshot specs",
    "apple screenshot requirements",
  ],
  alternates: {
    canonical: "https://snapframe.store/app-store-screenshot-sizes",
  },
  openGraph: {
    title: "App Store Screenshot Sizes Guide (2025/2026)",
    description: "Verified Apple App Store screenshot dimensions for iPhone 16/15 Pro Max, iPad Pro 13\", and Apple Watch.",
    url: "https://snapframe.store/app-store-screenshot-sizes",
  },
};

export default function AppStoreSizesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
