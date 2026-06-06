"use client";

import { EstimateRangeInputs } from "@/components/estimate/estimate-range-inputs";
import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryPricingMode } from "@/lib/estimates/inline-estimate";

function PricingModeToggle({
  mode,
  disabled,
  onChange,
}: {
  mode: CategoryPricingMode;
  disabled?: boolean;
  onChange: (mode: CategoryPricingMode) => void;
}) {
  return (
    <div className="inline-flex rounded-[4px] border border-[var(--border)] bg-white p-0.5">
      <Button
        type="button"
        size="sm"
        variant={mode === "item" ? "secondary" : "ghost"}
        className="h-8 px-2.5 text-xs"
        disabled={disabled}
        onClick={() => onChange("item")}
      >
        Per item
      </Button>
      <Button
        type="button"
        size="sm"
        variant={mode === "section" ? "secondary" : "ghost"}
        className="h-8 px-2.5 text-xs"
        disabled={disabled}
        onClick={() => onChange("section")}
      >
        Section
      </Button>
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
      <PricingModeToggle
        mode={pricingMode}
        disabled={saving || generating}
        onChange={setPricingMode}
      />
    </div>
  );
}

export function CategorySectionEstimateInputs({
  category,
  className,
}: {
  category: string;
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
      readOnly={submitted || reviewSubmitted}
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
      onMinChange={(value) =>
        updateScopeItemEstimate(scopeItemId, { labor_cost: value })
      }
      onMaxChange={(value) =>
        updateScopeItemEstimate(scopeItemId, { material_cost: value })
      }
    />
  );
}
