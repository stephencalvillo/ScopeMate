import type { FollowUpQuestion } from "@/types";
import { formatDimensionAnswer } from "@/lib/follow-up/dimension-labels";
import { formatExactDimensionLabel, isExactDimensionAnswer } from "@/lib/follow-up/dimension-answer";

export function formatFollowUpAnswer(
  question: Pick<FollowUpQuestion, "answer" | "question_type" | "question">,
  projectType?: string
): string {
  if (!question.answer) return "";

  if (question.question_type === "dimension_estimate") {
    if (isExactDimensionAnswer(question.answer)) {
      return formatExactDimensionLabel(question.answer);
    }

    return formatDimensionAnswer(
      question.answer,
      projectType,
      question.question
    );
  }

  if (question.answer === "not_sure") {
    return "Not sure";
  }

  return question.answer;
}
