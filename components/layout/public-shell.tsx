import Link from "next/link";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { Button } from "@/components/ui/button";

export function PublicShell({
  children,
  subtitle = "Shared project scope",
  logoHref,
  learnMoreHref,
}: {
  children: React.ReactNode;
  subtitle?: string;
  logoHref?: string;
  learnMoreHref?: string;
}) {
  const logo = (
    <ScopeMateLogo className="text-neutral-900 transition-opacity hover:opacity-80" />
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DisclaimerBanner />
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-[var(--page-padding-x)]">
          <div className="flex min-w-0 items-center gap-3">
            {logoHref ? (
              <Link href={logoHref} aria-label="ScopeMate for contractors">
                {logo}
              </Link>
            ) : (
              logo
            )}
            <p className="truncate text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
          {learnMoreHref ? (
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href={learnMoreHref}>Learn more</Link>
            </Button>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-[var(--page-padding-x)] py-12">{children}</main>
    </div>
  );
}
