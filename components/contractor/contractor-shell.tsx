import Link from "next/link";
import { ContractorNavTabs } from "@/components/contractor/contractor-nav-tabs";
import { AccountMenu } from "@/components/layout/account-menu";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";

export function ContractorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-stretch justify-between gap-6 px-[var(--page-padding-x)]">
          <div className="flex min-w-0 flex-1 items-stretch gap-8">
            <Link
              href="/contractor"
              className="flex shrink-0 items-center self-center text-neutral-900 transition-opacity hover:opacity-80"
              aria-label="ScopeBuddy contractor home"
            >
              <ScopeBuddyLogo />
            </Link>
            <ContractorNavTabs />
          </div>
          <div className="flex shrink-0 items-center self-center">
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
