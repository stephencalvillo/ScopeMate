import Link from "next/link";
import { ContractorNavMenu } from "@/components/contractor/contractor-nav-menu";
import { AccountMenu } from "@/components/layout/account-menu";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";

export function ContractorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-[var(--page-padding-x)] md:gap-6">
          <div className="flex min-w-0 items-center gap-1 md:gap-4">
            <ContractorNavMenu />
            <Link
              href="/contractor"
              className="flex shrink-0 items-center text-neutral-900 transition-opacity hover:opacity-80"
              aria-label="ScopeBuddy contractor home"
            >
              <ScopeBuddyLogo />
            </Link>
            <span className="hidden text-sm font-medium text-neutral-900 sm:inline">
              Contractor Portal
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/contractor/business"
              className="hidden text-sm text-neutral-900 transition-colors hover:text-neutral-700 md:inline"
            >
              Business info
            </Link>
            <Link
              href="/contractor/rates"
              className="hidden text-sm text-neutral-900 transition-colors hover:text-neutral-700 md:inline"
            >
              Saved rates
            </Link>
            <AccountMenu variant="contractor" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-[var(--page-padding-x)] pt-6 pb-12">
        {children}
      </main>
    </div>
  );
}
