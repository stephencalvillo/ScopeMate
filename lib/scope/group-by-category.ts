import { SCOPE_CATEGORIES, type ScopeItem } from "@/types";
import { formatCategoryLabel } from "@/lib/utils";

export type ScopeCategoryGroup = {
  category: string;
  items: ScopeItem[];
};

function categorySortKey(category: string): [number, number | string] {
  if (category === "other") return [2, 0];

  const knownIndex = (SCOPE_CATEGORIES as readonly string[]).indexOf(category);
  if (knownIndex >= 0) return [0, knownIndex];

  return [1, formatCategoryLabel(category).toLowerCase()];
}

export function compareScopeCategories(a: string, b: string): number {
  const [aTier, aKey] = categorySortKey(a);
  const [bTier, bKey] = categorySortKey(b);

  if (aTier !== bTier) return aTier - bTier;
  if (typeof aKey === "number" && typeof bKey === "number") return aKey - bKey;

  return String(aKey).localeCompare(String(bKey));
}

export function groupScopeItemsByCategory(
  items: ScopeItem[]
): ScopeCategoryGroup[] {
  const groups = new Map<string, ScopeItem[]>();

  for (const item of items) {
    const categoryItems = groups.get(item.category) ?? [];
    categoryItems.push(item);
    groups.set(item.category, categoryItems);
  }

  const orderedCategories = [...groups.keys()].sort(compareScopeCategories);

  return orderedCategories.map((category) => ({
    category,
    items: (groups.get(category) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }));
}
