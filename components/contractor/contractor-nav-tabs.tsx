"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign, Files } from "lucide-react";
import { cn, horizontalScrollTabsClassName } from "@/lib/utils";

const TABS = [
  {
    href: "/contractor",
    label: "My projects",
    icon: Files,
    isActive: (pathname: string) =>
      pathname === "/contractor" ||
      pathname.startsWith("/contractor/bids/") ||
      pathname.startsWith("/contractor/projects/") ||
      pathname.startsWith("/review/"),
  },
  {
    href: "/contractor/rates",
    label: "Saved rates",
    icon: DollarSign,
    isActive: (pathname: string) => pathname.startsWith("/contractor/rates"),
  },
] as const;

function tabClassName(isActive: boolean) {
  return cn(
    "inline-flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 -mb-px text-sm font-medium transition-colors",
    isActive
      ? "border-neutral-900 text-neutral-900"
      : "border-transparent text-[var(--muted)] hover:text-neutral-800"
  );
}

export function ContractorNavTabs() {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        horizontalScrollTabsClassName,
        "flex h-full min-w-0 flex-1 self-stretch"
      )}
    >
      <nav
        className="flex h-full w-max min-w-full gap-6"
        aria-label="Contractor sections"
      >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.isActive(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={tabClassName(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
      </nav>
    </div>
  );
}
