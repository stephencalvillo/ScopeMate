import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";

export function ContractorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-[var(--page-padding-x)]">
          <Link
            href="/contractor"
            className="text-neutral-900 transition-opacity hover:opacity-80"
            aria-label="ScopeMate contractor home"
          >
            <ScopeMateLogo />
          </Link>
          <div className="flex items-center">
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-[var(--page-padding-x)] py-12">
        {children}
      </main>
    </div>
  );
}
