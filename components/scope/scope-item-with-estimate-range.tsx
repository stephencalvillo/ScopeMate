import { SubmittedScopeEstimateRange } from "@/components/estimate/submitted-scope-estimate-range";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { cn } from "@/lib/utils";
import type { ScopeItem } from "@/types";

type EstimateRangeValues = {
  labor_cost: number | string;
  material_cost: number | string;
};

export function ScopeItemWithEstimateRange({
  item,
  range,
  showAttribution = true,
  interactive = false,
}: {
  item: ScopeItem;
  range?: EstimateRangeValues | null;
  showAttribution?: boolean;
  interactive?: boolean;
}) {
  const hasRange = Boolean(range);

  return (
    <ScopeItemShell
      interactive={interactive}
      className={cn(
        "w-full",
        hasRange &&
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-4"
      )}
    >
      <ScopeItemContent item={item} showAttribution={showAttribution} />
      {hasRange && range ? (
        <SubmittedScopeEstimateRange
          laborCost={range.labor_cost}
          materialCost={range.material_cost}
        />
      ) : null}
    </ScopeItemShell>
  );
}
