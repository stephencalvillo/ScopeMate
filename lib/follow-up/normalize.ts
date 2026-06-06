import type { FollowUpQuestion, FollowUpQuestionCategory } from "@/types";

export function normalizeFollowUpQuestion(
  question: FollowUpQuestion & { category?: FollowUpQuestionCategory }
): FollowUpQuestion {
  return {
    ...question,
    category: question.category ?? "other",
  };
}
