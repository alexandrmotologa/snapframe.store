import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects - SnapFrame",
  description: "Manage and create App Store and Google Play screenshot sets with instant preview and device staging.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
