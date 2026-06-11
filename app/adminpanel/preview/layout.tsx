import type { Metadata } from "next";
import { PreviewBanner } from "@/components/admin/preview/preview-banner";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PreviewBanner />
      {children}
    </div>
  );
}
