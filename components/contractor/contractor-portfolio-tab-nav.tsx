"use client";

import { cn, horizontalScrollTabsClassName } from "@/lib/utils";

export type ContractorPortfolioTabId = "active" | "in-review" | "history";

const TABS: Array<{
  id: ContractorPortfolioTabId;
  label: string;
  countKey: "active" | "inReview" | "history";
}> = [
  { id: "active", label: "Active projects", countKey: "active" },
  { id: "in-review", label: "In review", countKey: "inReview" },
  { id: "history", label: "History", countKey: "history" },
];

export function ContractorPortfolioTabNav({
  activeTab,
  counts,
  onTabChange,
}: {
  activeTab: ContractorPortfolioTabId;
  counts: { active: number; inReview: number; history: number };
  onTabChange: (tab: ContractorPortfolioTabId) => void;
}) {
  return (
    <div className={horizontalScrollTabsClassName}>
      <nav
        className="flex w-max min-w-full gap-6 border-b border-[var(--border)]"
        aria-label="Contractor projects"
      >
        {TABS.map((tab) => {
          const count = counts[tab.countKey];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-[var(--muted)] hover:text-neutral-800"
              )}
            >
              <span>{tab.label}</span>
              {count > 0 ? (
                <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
