import { compareScopeCategories } from "@/lib/scope/group-by-category";

type Categorizable = { category: string };

export function sortByConstructionOrder<T extends Categorizable>(
  items: T[]
): T[] {
  return [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const categoryCompare = compareScopeCategories(
        a.item.category,
        b.item.category
      );
      if (categoryCompare !== 0) return categoryCompare;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
