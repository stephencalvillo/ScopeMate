import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";

export function ContractorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-[var(--page-padding-x)]">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/contractor"
              className="flex shrink-0 items-center text-neutral-900 transition-opacity hover:opacity-80"
              aria-label="ScopeBuddy contractor home"
            >
              <ScopeBuddyLogo />
            </Link>
            <span className="text-sm font-medium text-neutral-900">
              Contractor Portal
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/contractor/business"
              className="text-sm text-neutral-900 transition-colors hover:text-neutral-700"
            >
              Business info
            </Link>
            <Link
              href="/contractor/rates"
              className="text-sm text-neutral-900 transition-colors hover:text-neutral-700"
            >
              Saved rates
            </Link>
            <AccountMenu variant="contractor" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-[var(--page-padding-x)] pt-6 pb-12">
        {children}
      </main>
    </div>
  );
}
