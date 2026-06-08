"use client";

import { EstimateRangeInputs } from "@/components/estimate/estimate-range-inputs";
import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SegmentedToggle<T extends string>({
  value,
  options,
  disabled,
  onChange,
  className,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-[4px] border border-[var(--border)] bg-white p-0.5",
        className
      )}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "secondary" : "ghost"}
          className="h-8 px-2.5 text-xs"
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function ScopePricingModeControl({ className }: { className?: string }) {
  const {
    showEstimate,
    canEdit,
    saving,
    generating,
    pricingMode,
    setPricingMode,
  } = useContractorEstimate();

  if (!showEstimate || !canEdit) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-[var(--muted)]">Price as:</span>
      <SegmentedToggle
        value={pricingMode}
        disabled={saving || generating}
        options={[
          { value: "item", label: "Per item" },
          { value: "section", label: "Section" },
        ]}
        onChange={setPricingMode}
      />
    </div>
  );
}

export function EstimatePriceInputModeControl({
  className,
}: {
  className?: string;
}) {
  const {
    showEstimate,
    canEdit,
    saving,
    generating,
    priceInputMode,
    setPriceInputMode,
  } = useContractorEstimate();

  if (!showEstimate || !canEdit) return null;

  return (
    <SegmentedToggle
      className={className}
      value={priceInputMode}
      disabled={saving || generating}
      options={[
        { value: "range", label: "Range" },
        { value: "flat", label: "Flat cost" },
      ]}
      onChange={setPriceInputMode}
    />
  );
}

export function CategorySectionEstimateInputs({
  category,
  className,
  displayOnly = false,
}: {
  category: string;
  className?: string;
  displayOnly?: boolean;
}) {
  const {
    showEstimate,
    canEdit,
    submitted,
    reviewSubmitted,
    saving,
    generating,
    pricingMode,
    priceInputMode,
    getSectionEntry,
    updateSectionEstimate,
  } = useContractorEstimate();

  if (!showEstimate || pricingMode !== "section") return null;

  const sectionEntry = getSectionEntry(category);
  const disabled = !canEdit || saving || generating;

  return (
    <EstimateRangeInputs
      className={cn("w-[15rem]", className)}
      minValue={sectionEntry?.labor_cost ?? "0"}
      maxValue={sectionEntry?.material_cost ?? "0"}
      disabled={disabled}
      readOnly={displayOnly || submitted || reviewSubmitted}
      inputMode={priceInputMode}
      onMinChange={(value) =>
        updateSectionEstimate(category, { labor_cost: value })
      }
      onMaxChange={(value) =>
        updateSectionEstimate(category, { material_cost: value })
      }
    />
  );
}

export function DraftAddSuggestionEstimateInputs({
  suggestionId,
  className,
}: {
  suggestionId: string;
  className?: string;
}) {
  const {
    showEstimate,
    canEdit,
    submitted,
    reviewSubmitted,
    saving,
    generating,
    pricingMode,
    priceInputMode,
    getEntryForAddSuggestion,
    updateAddSuggestionEstimate,
  } = useContractorEstimate();

  const entry = getEntryForAddSuggestion(suggestionId);
  if (!showEstimate || !entry || pricingMode !== "item") return null;

  const disabled = !canEdit || saving || generating;

  return (
    <EstimateRangeInputs
      className={cn("w-full md:w-[15rem]", className)}
      minValue={entry.labor_cost}
      maxValue={entry.material_cost}
      disabled={disabled}
      readOnly={submitted || reviewSubmitted}
      inputMode={priceInputMode}
      onMinChange={(value) =>
        updateAddSuggestionEstimate(suggestionId, { labor_cost: value })
      }
      onMaxChange={(value) =>
        updateAddSuggestionEstimate(suggestionId, { material_cost: value })
      }
    />
  );
}

export function ScopeItemEstimateInputs({
  scopeItemId,
  className,
}: {
  scopeItemId: string;
  className?: string;
}) {
  const {
    showEstimate,
    canEdit,
    submitted,
    reviewSubmitted,
    saving,
    generating,
    pricingMode,
    priceInputMode,
    getEntryForScopeItem,
    updateScopeItemEstimate,
  } = useContractorEstimate();

  const entry = getEntryForScopeItem(scopeItemId);
  if (!showEstimate || !entry || pricingMode !== "item") return null;

  const disabled = !canEdit || saving || generating;

  return (
    <EstimateRangeInputs
      className={cn("w-full md:w-[15rem]", className)}
      minValue={entry.labor_cost}
      maxValue={entry.material_cost}
      disabled={disabled}
      readOnly={submitted || reviewSubmitted}
      inputMode={priceInputMode}
      onMinChange={(value) =>
        updateScopeItemEstimate(scopeItemId, { labor_cost: value })
      }
      onMaxChange={(value) =>
        updateScopeItemEstimate(scopeItemId, { material_cost: value })
      }
    />
  );
}
