import { formatCategoryLabel } from "@/lib/utils";
import { normalizeEstimateRangeStorage } from "@/lib/estimates/money";
import type { EstimateLineItem, ScopeItem, ScopeSuggestion } from "@/types";
import type { EstimateLineItemInput } from "@/lib/estimates/estimates";

export type CategoryPricingMode = "item" | "section";

export const SECTION_ESTIMATE_PREFIX = "section:";

export function sectionEstimateKey(category: string) {
  return `${SECTION_ESTIMATE_PREFIX}${category}`;
}

export function sectionEstimateDescription(category: string) {
  return `${SECTION_ESTIMATE_PREFIX}${category}`;
}

export function parseSectionEstimateCategory(
  description: string
): string | null {
  if (!description.startsWith(SECTION_ESTIMATE_PREFIX)) return null;
  return description.slice(SECTION_ESTIMATE_PREFIX.length);
}

export function displaySectionEstimateLabel(category: string) {
  return formatCategoryLabel(category);
}

export type DraftEstimateEntry = {
  clientId: string;
  key: string;
  scope_item_id: string | null;
  suggestion_id: string | null;
  category: string | null;
  description: string;
  labor_cost: string;
  material_cost: string;
  isSection: boolean;
  isDraftAdd?: boolean;
};

function draftKeyForScopeItem(scopeItemId: string) {
  return `item:${scopeItemId}`;
}

export function draftKeyForSuggestion(suggestionId: string) {
  return `suggestion:${suggestionId}`;
}

export function inferCategoryPricingMode(
  category: string,
  scopeItems: ScopeItem[],
  lineItems: EstimateLineItem[]
): CategoryPricingMode {
  const categoryItemIds = new Set(
    scopeItems
      .filter((item) => item.category === category)
      .map((item) => item.id)
  );

  if (
    lineItems.some(
      (line) =>
        line.scope_item_id && categoryItemIds.has(line.scope_item_id)
    )
  ) {
    return "item";
  }

  if (
    lineItems.some(
      (line) => parseSectionEstimateCategory(line.description) === category
    )
  ) {
    return "section";
  }

  return "item";
}

export function buildPricingModeMap(
  scopeItems: ScopeItem[],
  lineItems: EstimateLineItem[],
  globalMode?: CategoryPricingMode
): Record<string, CategoryPricingMode> {
  const categories = new Set(scopeItems.map((item) => item.category));
  const mode =
    globalMode ?? inferGlobalPricingMode(scopeItems, lineItems);

  return Object.fromEntries(
    [...categories].map((category) => [category, mode])
  );
}

export function inferGlobalPricingMode(
  scopeItems: ScopeItem[],
  lineItems: EstimateLineItem[]
): CategoryPricingMode {
  const categories = new Set(scopeItems.map((item) => item.category));
  if (categories.size === 0) return "item";

  const modes = [...categories].map((category) =>
    inferCategoryPricingMode(category, scopeItems, lineItems)
  );

  return modes.every((mode) => mode === "section") ? "section" : "item";
}

export function buildDraftEntries({
  scopeItems,
  lineItems,
  pricingModeByCategory,
}: {
  scopeItems: ScopeItem[];
  lineItems: EstimateLineItem[];
  pricingModeByCategory: Record<string, CategoryPricingMode>;
}): DraftEstimateEntry[] {
  const lineByScopeId = new Map(
    lineItems
      .filter((line) => line.scope_item_id)
      .map((line) => [line.scope_item_id as string, line])
  );
  const lineBySectionCategory = new Map(
    lineItems
      .map((line) => {
        const category = parseSectionEstimateCategory(line.description);
        return category ? ([category, line] as const) : null;
      })
      .filter((entry): entry is [string, EstimateLineItem] => entry !== null)
  );

  const categories = [...new Set(scopeItems.map((item) => item.category))];
  const entries: DraftEstimateEntry[] = [];

  for (const category of categories) {
    const mode = pricingModeByCategory[category] ?? "item";

    if (mode === "section") {
      const existing = lineBySectionCategory.get(category);
      entries.push({
        clientId: existing?.id ?? crypto.randomUUID(),
        key: sectionEstimateKey(category),
        scope_item_id: null,
        suggestion_id: null,
        category,
        description: sectionEstimateDescription(category),
        labor_cost: String(existing?.labor_cost ?? 0),
        material_cost: String(existing?.material_cost ?? 0),
        isSection: true,
      });
      continue;
    }

    for (const item of scopeItems.filter(
      (scopeItem) => scopeItem.category === category
    )) {
      const existing = lineByScopeId.get(item.id);
      entries.push({
        clientId: existing?.id ?? crypto.randomUUID(),
        key: draftKeyForScopeItem(item.id),
        scope_item_id: item.id,
        suggestion_id: null,
        category: item.category,
        description: item.text,
        labor_cost: String(existing?.labor_cost ?? 0),
        material_cost: String(existing?.material_cost ?? 0),
        isSection: false,
      });
    }
  }

  return entries;
}

function lineItemForDraftAdd(
  lineItems: EstimateLineItem[],
  suggestion: Pick<ScopeSuggestion, "id" | "suggested_text">
) {
  const prefix = `${draftKeyForSuggestion(suggestion.id)}:`;
  return (
    lineItems.find((line) => line.description.startsWith(prefix)) ??
    lineItems.find(
      (line) =>
        !line.scope_item_id &&
        line.description.trim() === (suggestion.suggested_text ?? "").trim()
    )
  );
}

export function appendDraftAddEstimateEntries({
  entries,
  draftAddSuggestions,
  lineItems,
  pricingMode,
  preservedEntries,
}: {
  entries: DraftEstimateEntry[];
  draftAddSuggestions: ScopeSuggestion[];
  lineItems: EstimateLineItem[];
  pricingMode: CategoryPricingMode;
  preservedEntries: DraftEstimateEntry[];
}) {
  if (pricingMode !== "item") return entries;

  const draftAdds = draftAddSuggestions.filter(
    (suggestion) =>
      suggestion.suggestion_type === "add" && suggestion.status === "draft"
  );

  const nextEntries = [...entries];

  for (const suggestion of draftAdds) {
    const key = draftKeyForSuggestion(suggestion.id);
    const preserved = preservedEntries.find((entry) => entry.key === key);
    const existingLine = lineItemForDraftAdd(lineItems, suggestion);
    const text = suggestion.suggested_text?.trim() ?? "";

    nextEntries.push({
      clientId: existingLine?.id ?? preserved?.clientId ?? crypto.randomUUID(),
      key,
      scope_item_id: null,
      suggestion_id: suggestion.id,
      category: suggestion.category ?? "other",
      description: text,
      labor_cost: String(
        preserved?.labor_cost ?? existingLine?.labor_cost ?? 0
      ),
      material_cost: String(
        preserved?.material_cost ?? existingLine?.material_cost ?? 0
      ),
      isSection: false,
      isDraftAdd: true,
    });
  }

  return nextEntries;
}

export function draftAddEstimateDescription(
  suggestionId: string,
  suggestedText: string
) {
  return `${draftKeyForSuggestion(suggestionId)}:${suggestedText.trim()}`;
}

export function parseDraftAddEstimateDescription(description: string) {
  const match = description.match(/^suggestion:([^:]+):([\s\S]*)$/);
  if (!match) return null;
  return { suggestionId: match[1], suggestedText: match[2] };
}

export function serializeDraftEntries(
  entries: DraftEstimateEntry[],
  pricingModeByCategory: Record<string, CategoryPricingMode>,
  scopeItems: ScopeItem[]
): EstimateLineItemInput[] {
  const categories = new Set(scopeItems.map((item) => item.category));

  return entries
    .filter((entry) => {
      if (entry.isDraftAdd) {
        return pricingModeByCategory[entry.category ?? ""] === "item";
      }
      if (entry.isSection) {
        return pricingModeByCategory[entry.category ?? ""] === "section";
      }

      if (!entry.scope_item_id || !entry.category) return false;
      return pricingModeByCategory[entry.category] === "item";
    })
    .filter((entry) => {
      if (entry.isDraftAdd) return Boolean(entry.suggestion_id);
      if (entry.isSection) return categories.has(entry.category ?? "");
      return scopeItems.some((item) => item.id === entry.scope_item_id);
    })
    .map((entry) => {
      const { labor_cost, material_cost } = normalizeEstimateRangeStorage(
        Number(entry.labor_cost) || 0,
        Number(entry.material_cost) || 0
      );

      return {
        scope_item_id: entry.scope_item_id,
        description: entry.isSection
          ? sectionEstimateDescription(entry.category ?? "other")
          : entry.isDraftAdd && entry.suggestion_id
            ? draftAddEstimateDescription(entry.suggestion_id, entry.description)
            : entry.description.trim(),
        labor_cost,
        material_cost,
      };
    })
    .filter(
      (entry) =>
        entry.description.length > 0 &&
        (entry.labor_cost > 0 || entry.material_cost > 0)
    );
}

export function mergeGeneratedLineItems({
  scopeItems,
  generatedLineItems,
  pricingModeByCategory,
}: {
  scopeItems: ScopeItem[];
  generatedLineItems: EstimateLineItem[];
  pricingModeByCategory: Record<string, CategoryPricingMode>;
}) {
  return buildDraftEntries({
    scopeItems,
    lineItems: generatedLineItems,
    pricingModeByCategory,
  });
}
