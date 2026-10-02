import type {
  ProjectWithScope,
  ReviewScopeSnapshot,
  ReviewScopeSnapshotSuggestion,
} from "@/types";
import { PREVIEW_TIMESTAMP } from "./constants";

export function buildPreviewScopeSnapshot(
  project: ProjectWithScope,
  suggestions: ReviewScopeSnapshotSuggestion[] = []
): ReviewScopeSnapshot {
  return {
    captured_at: PREVIEW_TIMESTAMP,
    ai_summary: project.ai_summary,
    scope_items: project.scope_items.map((item) => ({
      id: item.id,
      category: item.category,
      text: item.text,
      source: item.source,
      priority: item.priority,
      sort_order: item.sort_order,
      needs_verification: item.needs_verification,
    })),
    suggestions,
  };
}
