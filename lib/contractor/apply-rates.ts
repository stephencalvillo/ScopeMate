import type {
  CategoryPricingMode,
  DraftEstimateEntry,
} from "@/lib/estimates/inline-estimate";
import type { ContractorRateItem } from "@/types";

type SavedRateLookup = Pick<
  ContractorRateItem,
  "category" | "labor_cost" | "material_cost"
>;

function formatDraftCost(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function applySavedRatesToEntries({
  entries,
  rates,
  pricingMode,
}: {
  entries: DraftEstimateEntry[];
  rates: SavedRateLookup[];
  pricingMode: CategoryPricingMode;
}): DraftEstimateEntry[] {
  const rateByCategory = new Map(rates.map((rate) => [rate.category, rate]));

  if (pricingMode === "section") {
    return entries.map((entry) => {
      if (!entry.isSection || !entry.category) {
        return entry;
      }

      const rate = rateByCategory.get(entry.category);
      if (!rate) {
        return entry;
      }

      return {
        ...entry,
        labor_cost: formatDraftCost(rate.labor_cost),
        material_cost: formatDraftCost(rate.material_cost),
      };
    });
  }

  return entries.map((entry) => {
    if (entry.isSection || !entry.category) {
      return entry;
    }

    const rate = rateByCategory.get(entry.category);
    if (!rate) {
      return entry;
    }

    return {
      ...entry,
      labor_cost: formatDraftCost(rate.labor_cost),
      material_cost: formatDraftCost(rate.material_cost),
    };
  });
}

export function countAppliedRateCategories({
  entries,
  rates,
  pricingMode,
}: {
  entries: DraftEstimateEntry[];
  rates: SavedRateLookup[];
  pricingMode: CategoryPricingMode;
}) {
  const next = applySavedRatesToEntries({
    entries,
    rates,
    pricingMode,
  });

  let applied = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const before = entries[index];
    const after = next[index];

    if (
      before.labor_cost !== after.labor_cost ||
      before.material_cost !== after.material_cost
    ) {
      applied += 1;
    }
  }

  return applied;
}
