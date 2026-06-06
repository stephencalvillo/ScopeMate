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
}: {
  category: string;
  itemCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label = formatCategoryLabel(category);
  const CategoryIcon = getScopeCategoryIcon(category);

  return (
    <SectionSurface className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      >
        <div className="flex items-center gap-2">
          <CategoryIcon
            className="h-4 w-4 shrink-0 text-neutral-500"
            aria-hidden
          />
          <h3 className="font-display text-base text-neutral-900">{label}</h3>
          <span className="text-base tabular-nums text-[var(--muted)]">
            {itemCount}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200",
            !expanded && "-rotate-90"
          )}
          aria-hidden
        />
      </button>
      {expanded ? <div className="space-y-2">{children}</div> : null}
    </SectionSurface>
  );
}
