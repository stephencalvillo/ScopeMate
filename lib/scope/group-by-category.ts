import { SCOPE_CATEGORIES, type ScopeItem } from "@/types";

export type ScopeCategoryGroup = {
  category: string;
  items: ScopeItem[];
};

export function groupScopeItemsByCategory(
  items: ScopeItem[]
): ScopeCategoryGroup[] {
  const groups = new Map<string, ScopeItem[]>();

  for (const item of items) {
    const categoryItems = groups.get(item.category) ?? [];
    categoryItems.push(item);
    groups.set(item.category, categoryItems);
  }

  const knownCategories = SCOPE_CATEGORIES.filter((category) =>
    groups.has(category)
  );
  const unknownCategories = [...groups.keys()]
    .filter(
      (category) =>
        !SCOPE_CATEGORIES.includes(category as (typeof SCOPE_CATEGORIES)[number])
    )
    .sort();

  return [...knownCategories, ...unknownCategories].map((category) => ({
    category,
    items: (groups.get(category) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }));
}
