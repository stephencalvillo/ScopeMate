import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — ScopeBuddy",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
