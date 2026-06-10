import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Lexend } from "next/font/google";
import { Toaster } from "sonner";
import { getClerkAppearance } from "@/lib/clerk/appearance";
import { clerkLocalization } from "@/lib/clerk/localization";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

const appUrl = (() => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return configured || "http://localhost:3000";
})();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "ScopeBuddy — Contractor-ready scopes for every project",
  description:
    "ScopeBuddy turns messy project ideas into contractor-ready scopes. One product for homeowners and contractors to start every project on the same page.",
  openGraph: {
    title: "ScopeBuddy — Contractor-ready scopes for every project",
    description:
      "ScopeBuddy turns messy project ideas into contractor-ready scopes. One product for homeowners and contractors to start every project on the same page.",
    siteName: "ScopeBuddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScopeBuddy — Contractor-ready scopes for every project",
    description:
      "ScopeBuddy turns messy project ideas into contractor-ready scopes. One product for homeowners and contractors to start every project on the same page.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={getClerkAppearance()}
      localization={clerkLocalization}
      afterSignOutUrl="/"
    >
      <html
        lang="en"
        className={`${dmSans.variable} ${lexend.variable}`}
      >
        <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
