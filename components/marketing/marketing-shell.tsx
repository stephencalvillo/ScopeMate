import Link from "next/link";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";
import { CTAButton } from "@/components/marketing/cta-button";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-[var(--page-padding-x)]">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-neutral-900 transition-opacity hover:opacity-80"
              aria-label="ScopeBuddy home"
            >
              <ScopeBuddyLogo />
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
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <CTAButton href="/sign-in" variant="secondary" size="sm">
              Sign In
            </CTAButton>
            <CTAButton href="/homeowners/signup" size="sm">
              Get Started
            </CTAButton>
          </div>

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

      <MarketingFooter />
    </div>
  );
}
