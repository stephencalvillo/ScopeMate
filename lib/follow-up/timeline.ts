import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import type { FollowUpQuestion } from "@/types";

export const TIMELINE_QUESTION = "When are you looking to start?";

export const TIMELINE_CHOICES = [
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Just exploring",
  "Not sure",
] as const;

export function isTimelineQuestion(
  question: Pick<FollowUpQuestion, "category" | "question">
): boolean {
  return question.category === "timeline";
}

export async function saveProjectTimelineAnswer(
  projectId: string,
  answer: string
): Promise<FollowUpQuestion | null> {
  if (!TIMELINE_CHOICES.includes(answer as (typeof TIMELINE_CHOICES)[number])) {
    return null;
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("follow_up_questions")
      .insert({
        project_id: projectId,
        question: TIMELINE_QUESTION,
        question_type: "choice",
        category: "timeline",
        choices: [...TIMELINE_CHOICES],
        answer,
        skipped: false,
        sort_order: 0,
        source: "homeowner",
        answered_at: now,
      })
      .select("*")
      .single();

    if (error) throw error;

    return data as FollowUpQuestion;
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
}
