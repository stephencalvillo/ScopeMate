"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";
import { GridBackground } from "@/components/marketing/grid-background";
import { cn } from "@/lib/utils";

const footerNavLinks = [
  { label: "Homeowners", href: "/homeowners" },
  { label: "Contractors", href: "/contractors" },
  { label: "About", href: "/" },
  { label: "Contact", href: "mailto:hello@myscopemate.ai" },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setLogoVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLogoVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-white text-neutral-900"
    >
      <GridBackground fade="footer" layers="minimal" />

      <div className="relative z-10 mx-auto max-w-6xl px-[var(--page-padding-x)] pb-5 pt-8 md:pt-12">
        <Link
          href="/"
          aria-label="ScopeMate home"
          className={cn(
            "block w-full transition-[opacity,transform] duration-300 ease-in-out",
            logoVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          )}
        >
          <ScopeMateLogo fullWidth className="text-neutral-900" />
        </Link>

        <div className="mt-3 flex flex-col gap-4 font-display text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0">© {year} ScopeMate. All rights reserved.</p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {footerNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[var(--muted)] underline decoration-solid underline-offset-[3px] transition-colors duration-300 ease-in-out hover:text-neutral-900"
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
