import Link from "next/link";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { CTAButton } from "@/components/marketing/cta-button";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-[var(--page-padding-x)]">
          <Link
            href="/"
            className="text-neutral-900 transition-opacity hover:opacity-80"
            aria-label="ScopeMate home"
          >
            <ScopeMateLogo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/homeowners"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Homeowners
            </Link>
            <Link
              href="/contractors"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Contractors
            </Link>
            <div className="flex items-center gap-2">
              <CTAButton href="/sign-in" variant="secondary" size="sm">
                Sign In
              </CTAButton>
              <CTAButton href="/homeowners/signup" size="sm">
                Get Started
              </CTAButton>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <CTAButton href="/sign-in" variant="secondary" size="sm">
              Sign In
            </CTAButton>
            <CTAButton href="/homeowners/signup" size="sm">
              Get Started
            </CTAButton>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto max-w-6xl px-[var(--page-padding-x)] py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <ScopeMateLogo className="text-neutral-900" />
              <p className="max-w-xs text-sm text-[var(--muted)]">
                One product for homeowners and contractors — clearer scopes,
                better projects.
              </p>
            </div>
            <div className="flex gap-12">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Product
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/homeowners"
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      Homeowners
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contractors"
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      Contractors
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Get started
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/homeowners/signup"
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      Create a project
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contractors/signup"
                      className="text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      Join as a contractor
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} ScopeMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
