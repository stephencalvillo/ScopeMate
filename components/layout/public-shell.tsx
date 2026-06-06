import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";

export function PublicShell({
  children,
  subtitle = "Shared project scope",
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DisclaimerBanner />
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <div className="flex items-center gap-3">
            <ScopeMateLogo className="text-neutral-900" />
            <p className="text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
    </div>
  );
}
