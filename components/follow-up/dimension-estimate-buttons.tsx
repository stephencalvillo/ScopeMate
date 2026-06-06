"use client";

import { cn } from "@/lib/utils";
import {
  DIMENSION_OPTIONS,
  getDimensionLabels,
} from "@/lib/follow-up/dimension-labels";
import { DIMENSION_CUSTOM_LABEL } from "@/lib/follow-up/dimension-answer";

export function DimensionEstimateButtons({
  value,
  onChange,
  onCustomDimensions,
  disabled,
  projectType,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  onCustomDimensions?: () => void;
  disabled?: boolean;
  projectType?: string;
}) {
  const labels = getDimensionLabels(projectType);

  return (
    <div className="flex flex-wrap gap-2">
      {DIMENSION_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors",
            value === option
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-[var(--border)] bg-white text-neutral-900 hover:bg-neutral-50",
            disabled && "opacity-50"
          )}
        >
          {labels[option]}
        </button>
      ))}
      {onCustomDimensions ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onCustomDimensions}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors",
            "border-[var(--border)] bg-white text-neutral-900 hover:bg-neutral-50",
            disabled && "opacity-50"
          )}
        >
          {DIMENSION_CUSTOM_LABEL}
        </button>
      ) : null}
    </div>
  );
}
