import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ScopeMateLogo } from "@/components/layout/scopemate-logo";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-[var(--page-padding-x)]">
        <Link
          href="/projects"
          className="text-neutral-900 transition-opacity hover:opacity-80"
          aria-label="ScopeMate home"
        >
          <ScopeMateLogo />
        </Link>
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
