import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import type { FollowUpQuestion } from "@/types";

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
