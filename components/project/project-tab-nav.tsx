"use client";

import { cn } from "@/lib/utils";

export type ProjectTabId =
  | "overview"
  | "reviewed-scopes"
  | "needs-attention"
  | "activity";

const TABS: Array<{
  id: ProjectTabId;
  label: string;
  countKey?: "reviewedScopes" | "needsAttention";
}> = [
  { id: "overview", label: "Project overview" },
  { id: "reviewed-scopes", label: "Reviewed scopes", countKey: "reviewedScopes" },
  { id: "needs-attention", label: "Needs attention", countKey: "needsAttention" },
  { id: "activity", label: "Activity" },
];

export function ProjectTabNav({
  activeTab,
  counts,
  onTabChange,
}: {
  activeTab: ProjectTabId;
  counts: { reviewedScopes: number; needsAttention: number };
  onTabChange: (tab: ProjectTabId) => void;
}) {
  return (
    <nav
      className="flex gap-6 border-b border-[var(--border)]"
      aria-label="Project sections"
    >
      {TABS.map((tab) => {
        const count =
          tab.countKey === "reviewedScopes"
            ? counts.reviewedScopes
            : tab.countKey === "needsAttention"
              ? counts.needsAttention
              : 0;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              isActive
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-[var(--muted)] hover:text-neutral-800"
            )}
          >
            <span>{tab.label}</span>
            {count > 0 ? (
              <span
                className={cn(
                  "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
                  tab.id === "needs-attention"
                    ? "bg-amber-100 text-amber-900"
                    : "bg-neutral-100 text-neutral-700"
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function parseProjectTab(value: string | null | undefined): ProjectTabId {
  if (
    value === "reviewed-scopes" ||
    value === "needs-attention" ||
    value === "activity" ||
    value === "overview"
  ) {
    return value;
  }

  return "overview";
}
