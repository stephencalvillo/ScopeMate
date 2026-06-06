import { isMissingTableError, isMissingColumnError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import { normalizeFollowUpQuestion } from "@/lib/follow-up/normalize";
import type {
  FollowUpQuestion,
  FollowUpQuestionCategory,
  ScopeItem,
} from "@/types";

function followUpCategoryToScopeCategory(
  category: FollowUpQuestionCategory
): string {
  const map: Record<FollowUpQuestionCategory, string> = {
    dimensions: "other",
    materials: "fixtures",
    timeline: "other",
    permits: "permits",
    trade_scope: "carpentry",
    other: "other",
  };

  return map[category] ?? "other";
}

export function buildScopeItemTextFromFollowUp(
  question: FollowUpQuestion,
  projectType?: string
): string | null {
  if (question.skipped || !question.answer) return null;

  const answer = formatFollowUpAnswer(question, projectType);
  if (!answer) return null;

  if (question.answer === "not_sure") {
    return `${question.question} (homeowner is not sure)`;
  }

  return `${question.question}: ${answer}`;
}

export async function syncFollowUpAnswerToScope(
  projectId: string,
  question: FollowUpQuestion,
  projectType?: string
): Promise<ScopeItem | null> {
  const supabase = createServiceClient();
  const normalized = normalizeFollowUpQuestion(question);
  const text = buildScopeItemTextFromFollowUp(normalized, projectType);

  const { data: existing, error: existingError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", projectId)
    .eq("follow_up_question_id", normalized.id)
    .maybeSingle();

  if (existingError) {
    if (isMissingTableError(existingError) || isMissingColumnError(existingError)) {
      return null;
    }
    throw existingError;
  }

  if (!text) {
    if (existing) {
      const { error: removeError } = await supabase
        .from("scope_items")
        .delete()
        .eq("id", existing.id);

      if (removeError) throw removeError;
    }

    return null;
  }

  const payload = {
    category: followUpCategoryToScopeCategory(normalized.category),
    text,
    source: "homeowner" as const,
    priority: "optional" as const,
    status: "active" as const,
    needs_verification: false,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("scope_items")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return data as ScopeItem;
  }

  const { count, error: countError } = await supabase
    .from("scope_items")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("status", "active");

  if (countError) throw countError;

  const { data, error } = await supabase
    .from("scope_items")
    .insert({
      project_id: projectId,
      follow_up_question_id: normalized.id,
      sort_order: count ?? 0,
      ...payload,
    })
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error) || isMissingColumnError(error)) return null;
    throw error;
  }

  return data as ScopeItem;
}

export async function syncAllFollowUpAnswersToScope(
  projectId: string,
  projectType?: string
): Promise<ScopeItem[]> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const synced: ScopeItem[] = [];

    for (const raw of (data ?? []) as FollowUpQuestion[]) {
      const question = normalizeFollowUpQuestion(raw);
      const item = await syncFollowUpAnswerToScope(
        projectId,
        question,
        projectType
      );
      if (item) synced.push(item);
    }

    return synced;
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
}
