import type { ScopeSuggestionWithMeta } from "@/types";

function contractorLabel(suggestion: ScopeSuggestionWithMeta) {
  return suggestion.contractor_name?.trim() || "Contractor";
}

export function formatSuggestionHeadline(suggestion: ScopeSuggestionWithMeta) {
  const name = contractorLabel(suggestion);

  switch (suggestion.suggestion_type) {
    case "add":
      return `${name} suggested a new scope item`;
    case "edit":
      return `${name} edited scope item`;
    case "remove":
      return `${name} suggested removing a scope item`;
    case "note":
      return `${name} left a note`;
  }
}

export function getSuggestionBody(suggestion: ScopeSuggestionWithMeta) {
  if (suggestion.suggestion_type === "add") {
    return suggestion.suggested_text?.trim() || suggestion.contractor_note?.trim() || null;
  }

  if (suggestion.suggestion_type === "remove") {
    return (
      suggestion.contractor_note?.trim() ||
      suggestion.target_scope_item_text?.trim() ||
      suggestion.suggested_text?.trim() ||
      null
    );
  }

  return (
    suggestion.contractor_note?.trim() ||
    suggestion.suggested_text?.trim() ||
    suggestion.target_scope_item_text?.trim() ||
    null
  );
}
