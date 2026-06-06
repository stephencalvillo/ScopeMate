import type { ScopeSuggestion, ScopeSuggestionType } from "@/types";

const OPEN_STATUSES = new Set<ScopeSuggestion["status"]>([
  "pending",
  "follow_up_requested",
]);

const TARGETED_TYPES = new Set<ScopeSuggestionType>(["edit", "remove"]);

export function normalizeSuggestionText(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

export function normalizeSuggestionCategory(value: string | null | undefined) {
  return value?.trim() || "other";
}

export function isOpenSuggestion(suggestion: Pick<ScopeSuggestion, "status">) {
  return OPEN_STATUSES.has(suggestion.status);
}

export function matchesAcceptedSuggestion(
  accepted: ScopeSuggestion,
  candidate: ScopeSuggestion
) {
  if (candidate.id === accepted.id) {
    return false;
  }

  if (!isOpenSuggestion(candidate)) {
    return false;
  }

  if (accepted.suggestion_type === "note" || candidate.suggestion_type === "note") {
    return false;
  }

  if (TARGETED_TYPES.has(accepted.suggestion_type)) {
    if (!accepted.target_scope_item_id) {
      return false;
    }

    return (
      TARGETED_TYPES.has(candidate.suggestion_type) &&
      candidate.target_scope_item_id === accepted.target_scope_item_id
    );
  }

  if (accepted.suggestion_type === "add") {
    if (candidate.suggestion_type !== "add") {
      return false;
    }

    return (
      normalizeSuggestionCategory(candidate.category) ===
        normalizeSuggestionCategory(accepted.category) &&
      normalizeSuggestionText(candidate.suggested_text) ===
        normalizeSuggestionText(accepted.suggested_text)
    );
  }

  return false;
}

export function findMatchingSuggestions(
  accepted: ScopeSuggestion,
  candidates: ScopeSuggestion[]
) {
  return candidates.filter((candidate) =>
    matchesAcceptedSuggestion(accepted, candidate)
  );
}
