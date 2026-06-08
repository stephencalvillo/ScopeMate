"use client";

import { cn } from "@/lib/utils";

export type GetStartedRole = "homeowner" | "contractor";

export function GetStartedRoleToggle({
  value,
  onChange,
}: {
  value: GetStartedRole;
  onChange: (role: GetStartedRole) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-stone-50 p-1"
      role="tablist"
      aria-label="Choose your path"
    >
      {(
        [
          { id: "homeowner", label: "Homeowner" },
          { id: "contractor", label: "Contractor" },
        ] as const
      ).map((option) => {
        const selected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              selected
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-[var(--muted)] hover:text-neutral-900"
            )}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
