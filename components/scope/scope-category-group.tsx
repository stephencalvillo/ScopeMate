"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { SectionSurface } from "@/components/layout/page-section";
import { ScopeCategoryLabel } from "@/components/scope/scope-category-label";
import { cn, formatCategoryLabel } from "@/lib/utils";

export type ScopeCategoryHeaderAsideContext = {
  expanded: boolean;
  layout: "inline" | "stacked" | "summary";
};

function resolveHeaderAside(
  headerAside:
    | ReactNode
    | ((context: ScopeCategoryHeaderAsideContext) => ReactNode)
    | undefined,
  context: ScopeCategoryHeaderAsideContext
) {
  if (!headerAside) return null;
  return typeof headerAside === "function" ? headerAside(context) : headerAside;
}

export function ScopeCategoryGroup({
  category,
  itemCount,
  children,
  defaultExpanded = true,
  headerAside,
  chevronAfterAside = false,
  onAddItem,
}: {
  category: string;
  itemCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  headerAside?:
    | ReactNode
    | ((context: ScopeCategoryHeaderAsideContext) => ReactNode);
  chevronAfterAside?: boolean;
  onAddItem?: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label = formatCategoryLabel(category);
  const usesStackedAside = chevronAfterAside && Boolean(headerAside);
  const separateChevron = chevronAfterAside || Boolean(onAddItem);

  const chevron = (
    <ChevronDown
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200",
        !expanded && "-rotate-90"
      )}
      aria-hidden
    />
  );

  const toggleExpanded = () => setExpanded((current) => !current);

  const categoryLabel = (
    <div className="flex min-w-0 items-center gap-2">
      <ScopeCategoryLabel
        category={category}
        labelClassName="font-display text-base text-neutral-900"
      />
      <span className="text-base tabular-nums text-[var(--muted)]">
        {itemCount}
      </span>
    </div>
  );

  const headerIconButtonClassName =
    "shrink-0 rounded-[4px] p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900";

  const chevronButton = (
    <button
      type="button"
      onClick={toggleExpanded}
      className={headerIconButtonClassName}
      aria-expanded={expanded}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
    >
      {chevron}
    </button>
  );

  const addButton = onAddItem ? (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setExpanded(true);
        onAddItem();
      }}
      className={headerIconButtonClassName}
      aria-label={`Add item to ${label}`}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
    </button>
  ) : null;

  const headerControls = addButton ? (
    <div className="flex shrink-0 items-center">
      {addButton}
      {chevronButton}
    </div>
  ) : separateChevron ? (
    chevronButton
  ) : null;

  return (
    <SectionSurface className="space-y-3">
      {usesStackedAside ? (
        <>
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              aria-expanded={expanded}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
            >
              {categoryLabel}
            </button>
            {!expanded ? (
              <div
                className="shrink-0 md:hidden"
                onClick={(event) => event.stopPropagation()}
              >
                {resolveHeaderAside(headerAside, {
                  expanded: false,
                  layout: "summary",
                })}
              </div>
            ) : null}
            <div
              className="hidden shrink-0 md:block"
              onClick={(event) => event.stopPropagation()}
            >
              {resolveHeaderAside(headerAside, {
                expanded,
                layout: "inline",
              })}
            </div>
            {headerControls}
          </div>
          {expanded ? (
            <div
              className="md:hidden"
              onClick={(event) => event.stopPropagation()}
            >
              {resolveHeaderAside(headerAside, {
                expanded: true,
                layout: "stacked",
              })}
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            className={cn(
              "flex min-w-0 items-center gap-2 text-left",
              separateChevron ? "flex-1" : "flex-1 justify-between gap-3"
            )}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
          >
            {categoryLabel}
            {!separateChevron ? chevron : null}
          </button>
          {headerAside ? (
            <div
              className="shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              {resolveHeaderAside(headerAside, {
                expanded,
                layout: "inline",
              })}
            </div>
          ) : null}
          {headerControls}
        </div>
      )}
      {expanded ? <div className="space-y-2">{children}</div> : null}
    </SectionSurface>
  );
}
