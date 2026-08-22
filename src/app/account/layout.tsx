import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account & Billing - SnapFrame",
  description: "Manage your SnapFrame Pro subscription, AI usage credits, and billing receipts.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
