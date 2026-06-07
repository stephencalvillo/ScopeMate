import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Lexend } from "next/font/google";
import { Toaster } from "sonner";
import { getClerkAppearance } from "@/lib/clerk/appearance";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "ScopeMate — Contractor-ready scopes for every project",
  description:
    "ScopeMate turns messy project ideas into contractor-ready scopes. One product for homeowners and contractors to start every project on the same page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={getClerkAppearance()}>
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
