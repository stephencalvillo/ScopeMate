import type { FollowUpQuestion } from "@/types";
import { formatDimensionAnswer } from "@/lib/follow-up/dimension-labels";

export function formatFollowUpAnswer(
  question: Pick<FollowUpQuestion, "answer" | "question_type">,
  projectType?: string
): string {
  if (!question.answer) return "";

  if (question.question_type === "dimension_estimate") {
    return formatDimensionAnswer(question.answer, projectType);
  }

  if (question.answer === "not_sure") {
    return "Not sure";
  }

  return question.answer;
}
