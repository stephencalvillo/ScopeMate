import { createServiceClient } from "@/lib/db/supabase";
import type {
  ReviewScopeSnapshot,
  ReviewScopeSnapshotItem,
  ReviewScopeSnapshotSuggestion,
  ScopeItem,
  ScopeSuggestion,
} from "@/types";

export function parseReviewScopeSnapshot(
  value: unknown
): ReviewScopeSnapshot | null {
  if (!value || typeof value !== "object") return null;

  const snapshot = value as ReviewScopeSnapshot;
  if (!Array.isArray(snapshot.scope_items) || !Array.isArray(snapshot.suggestions)) {
    return null;
  }

  return snapshot;
}

export function snapshotItemToScopeItem(
  item: ReviewScopeSnapshotItem,
  projectId: string,
  capturedAt: string
): ScopeItem {
  return {
    id: item.id,
    project_id: projectId,
    category: item.category,
    text: item.text,
    source: item.source,
    priority: item.priority,
    status: "active",
    sort_order: item.sort_order,
    needs_verification: item.needs_verification,
    contractor_attribution_name: item.contractor_attribution_name ?? undefined,
    created_at: capturedAt,
    updated_at: capturedAt,
  };
}

export async function buildReviewScopeSnapshot({
  projectId,
  aiSummary,
  drafts,
}: {
  projectId: string;
  aiSummary: string | null;
  drafts: ScopeSuggestion[];
}): Promise<ReviewScopeSnapshot> {
  const supabase = createServiceClient();

  const { data: scopeItems, error } = await supabase
    .from("scope_items")
    .select(
      "id, category, text, source, priority, sort_order, needs_verification, suggestion_id"
    )
    .eq("project_id", projectId)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const capturedAt = new Date().toISOString();

  return {
    captured_at: capturedAt,
    ai_summary: aiSummary,
    scope_items: (scopeItems ?? []).map(
      (item): ReviewScopeSnapshotItem => ({
        id: item.id as string,
        category: item.category as string,
        text: item.text as string,
        source: item.source as ReviewScopeSnapshotItem["source"],
        priority: item.priority as ReviewScopeSnapshotItem["priority"],
        sort_order: item.sort_order as number,
        needs_verification: Boolean(item.needs_verification),
        contractor_attribution_name: null,
        suggestion_id: (item.suggestion_id as string | null) ?? null,
      })
    ),
    suggestions: drafts.map(
      (draft): ReviewScopeSnapshotSuggestion => ({
        id: draft.id,
        suggestion_type: draft.suggestion_type,
        category: draft.category,
        suggested_text: draft.suggested_text,
        contractor_note: draft.contractor_note,
        target_scope_item_id: draft.target_scope_item_id,
      })
    ),
  };
}
