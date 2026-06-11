import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import type { AiFollowUpQuestion, FollowUpQuestion } from "@/types";

export const FINISH_LEVEL_QUESTION = "What finish level are you targeting?";

export const FINISH_LEVEL_CHOICES = [
  "Budget friendly",
  "Elevated",
  "High-end",
  "Not sure",
] as const;

export const FINISH_LEVEL_PLANNING_NOTE =
  "Planning level only — not a quote. Contractors verify pricing on site.";

export function buildFinishLevelMaterialsQuestion(): AiFollowUpQuestion {
  return {
    question: FINISH_LEVEL_QUESTION,
    question_type: "choice",
    category: "materials",
    choices: [...FINISH_LEVEL_CHOICES],
  };
}

export function isFinishLevelMaterialsQuestion(
  question: Pick<FollowUpQuestion, "category" | "question">
): boolean {
  return question.question.trim() === FINISH_LEVEL_QUESTION;
}

export function hasPartialFollowUpSet(questions: FollowUpQuestion[]): boolean {
  return (
    questions.length === 1 && isFinishLevelMaterialsQuestion(questions[0]!)
  );
}

export async function ensureFinishLevelMaterialsQuestion(
  projectId: string,
  existingQuestions: FollowUpQuestion[]
): Promise<FollowUpQuestion[]> {
  if (existingQuestions.some(isFinishLevelMaterialsQuestion)) {
    return existingQuestions;
  }

  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("follow_up_questions")
      .insert({
        project_id: projectId,
        question: FINISH_LEVEL_QUESTION,
        question_type: "choice",
        category: "materials",
        choices: [...FINISH_LEVEL_CHOICES],
        sort_order: existingQuestions.length,
        source: "ai",
      })
      .select("*")
      .single();

    if (error) throw error;

    return [...existingQuestions, data as FollowUpQuestion];
  } catch (error) {
    if (isMissingTableError(error)) return existingQuestions;
    throw error;
  }
}
