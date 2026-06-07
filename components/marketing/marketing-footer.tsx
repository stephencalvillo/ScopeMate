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
    <footer className="bg-black text-white">
      <div className="w-full overflow-hidden leading-none">
        <Link
          href="/"
          className="block w-full text-white transition-opacity hover:opacity-90"
          aria-label="ScopeMate home"
        >
          <ScopeMateLogo fullWidth className="block" />
        </Link>
      </div>

      <div className="flex flex-col gap-4 px-[23px] pb-5 pt-3 font-display text-xs sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="shrink-0 text-white">
          © {year} ScopeMate. All rights reserved.
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          {footerNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white underline decoration-solid underline-offset-[3px] transition-opacity hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
