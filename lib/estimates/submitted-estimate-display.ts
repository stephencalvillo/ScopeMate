import {
  buildDraftEntries,
  buildPricingModeMap,
  inferGlobalPricingMode,
  type CategoryPricingMode,
} from "@/lib/estimates/inline-estimate";
import type { EstimateLineItem, ScopeItem } from "@/types";

export type SubmittedEstimateDisplay = {
  pricingMode: CategoryPricingMode;
  scopeItemRanges: Map<string, { labor_cost: string; material_cost: string }>;
  sectionRanges: Map<string, { labor_cost: string; material_cost: string }>;
};

export function buildSubmittedEstimateDisplay({
  scopeItems,
  lineItems,
}: {
  scopeItems: ScopeItem[];
  lineItems: EstimateLineItem[];
}): SubmittedEstimateDisplay | null {
  if (lineItems.length === 0) {
    return null;
  }

  const pricingMode = inferGlobalPricingMode(scopeItems, lineItems);
  const entries = buildDraftEntries({
    scopeItems,
    lineItems,
    pricingModeByCategory: buildPricingModeMap(
      scopeItems,
      lineItems,
      pricingMode
    ),
  });

  const scopeItemRanges = new Map<
    string,
    { labor_cost: string; material_cost: string }
  >();
  const sectionRanges = new Map<
    string,
    { labor_cost: string; material_cost: string }
  >();

  for (const entry of entries) {
    if (entry.isSection && entry.category) {
      sectionRanges.set(entry.category, {
        labor_cost: entry.labor_cost,
        material_cost: entry.material_cost,
      });
      continue;
    }

    if (entry.scope_item_id) {
      scopeItemRanges.set(entry.scope_item_id, {
        labor_cost: entry.labor_cost,
        material_cost: entry.material_cost,
      });
    }
  }

  return {
    pricingMode,
    scopeItemRanges,
    sectionRanges,
  };
}
