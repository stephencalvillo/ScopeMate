import Link from "next/link";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";

const footerNavLinks = [
  { label: "Homeowners", href: "/homeowners" },
  { label: "Contractors", href: "/contractors" },
  { label: "About", href: "/" },
  { label: "Contact", href: "mailto:hello@myscopemate.ai" },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-neutral-900">
      <div className="mx-auto max-w-6xl px-[var(--page-padding-x)] pb-5 pt-8 md:pt-12">
        <Link
          href="/"
          className="block w-full transition-opacity hover:opacity-80"
          aria-label="ScopeMate home"
        >
          <ScopeMateLogo fullWidth className="text-neutral-900" />
        </Link>

        <div className="mt-3 flex flex-col gap-4 font-display text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0">© {year} ScopeMate. All rights reserved.</p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {footerNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-900 underline decoration-solid underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
