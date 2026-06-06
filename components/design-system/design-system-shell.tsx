"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  componentCategories,
  componentLibrary,
  type ComponentCategory,
} from "@/lib/component-library";
import { cn } from "@/lib/utils";

const categoryOrder: ComponentCategory[] = [
  "actions",
  "forms",
  "feedback",
  "layout",
];

export function DesignSystemShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="-mx-6 flex min-h-[calc(100vh-12rem)] flex-col gap-8 lg:flex-row lg:gap-0">
      <aside className="shrink-0 border-b border-[var(--border)] px-6 pb-6 lg:w-60 lg:border-b-0 lg:border-r lg:pl-6 lg:pr-0 lg:pb-0">
        <div className="mb-6">
          <p className="font-display text-lg text-neutral-900">Component library</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Browse UI building blocks used across ScopeMate.
          </p>
        </div>

        <nav className="space-y-6">
          {categoryOrder.map((category) => {
            const meta = componentCategories[category];
            const items = componentLibrary.filter(
              (component) => component.category === category
            );

            return (
              <div key={category}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  {meta.label}
                </p>
                <ul className="space-y-1">
                  {items.map((component) => {
                    const href = `/design-system/${component.slug}`;
                    const isActive = pathname === href;

                    return (
                      <li key={component.slug}>
                        <Link
                          href={href}
                          className={cn(
                            "block rounded-[4px] px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-700 hover:bg-neutral-100"
                          )}
                        >
                          {component.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-6 lg:pl-6 lg:pr-0">{children}</div>
    </div>
  );
}
