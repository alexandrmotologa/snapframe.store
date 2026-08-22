import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - SnapFrame",
  description:
    "Learn about SnapFrame screenshot generator features, Multi-Device Cloud Sync, Fair Usage AI policies, Store Asset studios, and licensing.",
  alternates: {
    canonical: "https://snapframe.store/faq",
  },
  openGraph: {
    title: "FAQ - SnapFrame Screenshot Generator",
    description: "Got questions about SnapFrame? Find answers about AI vision, cloud sync, export formats, and pricing.",
    url: "https://snapframe.store/faq",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
