"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionSurface } from "@/components/layout/page-section";
import { getScopeCategoryIcon } from "@/lib/scope/category-icons";
import { cn, formatCategoryLabel } from "@/lib/utils";

export function ScopeCategoryGroup({
  category,
  itemCount,
  children,
  defaultExpanded = true,
  headerAside,
  chevronAfterAside = false,
}: {
  category: string;
  itemCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  headerAside?: React.ReactNode;
  chevronAfterAside?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label = formatCategoryLabel(category);
  const CategoryIcon = getScopeCategoryIcon(category);

  const chevron = (
    <ChevronDown
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200",
        !expanded && "-rotate-90"
      )}
      aria-hidden
    />
  );

  return (
    <SectionSurface className="space-y-3">
      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={cn(
            "flex min-w-0 items-center gap-2 text-left",
            chevronAfterAside ? "flex-1" : "flex-1 justify-between gap-3"
          )}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <CategoryIcon
              className="h-4 w-4 shrink-0 text-neutral-500"
              aria-hidden
            />
            <h3 className="font-display text-base text-neutral-900">{label}</h3>
            <span className="text-base tabular-nums text-[var(--muted)]">
              {itemCount}
            </span>
          </div>
          {!chevronAfterAside ? chevron : null}
        </button>
        {headerAside ? (
          <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
            {headerAside}
          </div>
        ) : null}
        {chevronAfterAside ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="shrink-0 rounded-[4px] p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
          >
            {chevron}
          </button>
        ) : null}
      </div>
      {expanded ? <div className="space-y-2">{children}</div> : null}
    </SectionSurface>
  );
}
