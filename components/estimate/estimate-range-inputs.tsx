"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency, estimateRangeBounds } from "@/lib/estimates/money";

function CurrencyAmountInput({
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  "aria-label": string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-neutral-500"
        aria-hidden
      >
        $
      </span>
      <Input
        type="number"
        min="0"
        step="1"
        disabled={disabled}
        aria-label={ariaLabel}
        className="h-11 pl-7"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={(event) => event.target.select()}
      />
    </div>
  );
}

export function EstimateRangeInputs({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled = false,
  readOnly = false,
  inputMode = "range",
  className,
}: {
  minValue: string;
  maxValue: string;
  onMinChange?: (value: string) => void;
  onMaxChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  inputMode?: "range" | "flat";
  className?: string;
}) {
  if (readOnly) {
    const { low, high } = estimateRangeBounds(
      Number(minValue) || 0,
      Number(maxValue) || 0
    );

    if (low === 0 && high === 0) {
      return (
        <span
          className={cn(
            "flex h-11 items-center justify-end self-start text-sm text-[var(--muted)]",
            className
          )}
        >
          —
        </span>
      );
    }

    if (inputMode === "flat" || low === high) {
      return (
        <div
          className={cn(
            "flex h-11 items-center justify-end self-start text-sm text-neutral-800",
            className
          )}
        >
          <span>{formatCurrency(high)}</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex h-11 items-center justify-end gap-2 self-start text-sm text-neutral-800",
          className
        )}
      >
        <span>{formatCurrency(low)}</span>
        <span className="h-px w-4 shrink-0 bg-neutral-300" aria-hidden />
        <span>{formatCurrency(high)}</span>
      </div>
    );
  }

  if (inputMode === "flat") {
    const flatValue =
      minValue === maxValue
        ? maxValue
        : String(
            estimateRangeBounds(Number(minValue) || 0, Number(maxValue) || 0)
              .high
          );

    return (
      <div className={cn("flex w-full items-center justify-end self-start", className)}>
        <CurrencyAmountInput
          value={flatValue}
          disabled={disabled}
          aria-label="Flat cost"
          className="w-[7.5rem]"
          onChange={(value) => {
            onMinChange?.(value);
            onMaxChange?.(value);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 self-start", className)}>
      <CurrencyAmountInput
        value={minValue}
        disabled={disabled}
        aria-label="Range minimum"
        onChange={onMinChange}
      />
      <span
        className="h-px w-4 shrink-0 self-center bg-neutral-300"
        aria-hidden
      />
      <CurrencyAmountInput
        value={maxValue}
        disabled={disabled}
        aria-label="Range maximum"
        onChange={onMaxChange}
      />
    </div>
  );
}

export function EstimateRangeHeader({
  className,
  inputMode = "range",
}: {
  className?: string;
  inputMode?: "range" | "flat";
}) {
  return (
    <div className={cn("hidden items-center gap-4 md:flex", className)}>
      <span className="min-w-0 flex-1" aria-hidden />
      <span className="shrink-0 text-xs font-medium text-[var(--muted)] md:w-[15rem]">
        {inputMode === "flat" ? "Flat cost" : "Range"}
      </span>
    </div>
  );
}
