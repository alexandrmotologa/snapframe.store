import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Moderation Console | SnapFrame",
  description: "Internal moderation portal for SnapFrame Community Reviews & Custom Templates.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {children}
    </div>
  );
}
