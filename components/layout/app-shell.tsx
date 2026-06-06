import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DisclaimerBanner />
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
