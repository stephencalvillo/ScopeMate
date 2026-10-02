const CONTRACTOR_COMMENT_TYPES = new Set(["edit", "note", "remove"]);

export const NO_CONTRACTOR_CHANGES_LABEL = "No changes from original";

type CountableSuggestion = {
  suggestion_type: string;
  target_scope_item_id?: string | null;
};

export function isContractorCommentOnItem(
  suggestion: CountableSuggestion,
  itemId: string
) {
  return (
    suggestion.target_scope_item_id === itemId &&
    CONTRACTOR_COMMENT_TYPES.has(suggestion.suggestion_type)
  );
}

/** Counts only comments and added lines that the contractor view actually shows. */
export function countVisibleContractorChanges(
  suggestions: CountableSuggestion[],
  visibleScopeItemIds: Iterable<string>
) {
  let commentCount = 0;

  for (const itemId of visibleScopeItemIds) {
    if (suggestions.some((entry) => isContractorCommentOnItem(entry, itemId))) {
      commentCount += 1;
    }
  }

  const suggestionCount = suggestions.filter(
    (entry) => entry.suggestion_type === "add"
  ).length;

  return { commentCount, suggestionCount };
}

export function formatContractorViewChangeStatus(
  commentCount: number,
  suggestionCount: number
) {
  const parts = [
    commentCount > 0
      ? `${commentCount} comment${commentCount === 1 ? "" : "s"}`
      : null,
    suggestionCount > 0
      ? `${suggestionCount} suggestion${suggestionCount === 1 ? "" : "s"}`
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" · ") : NO_CONTRACTOR_CHANGES_LABEL;
}
