import {
  CABINET_COUNT_QUESTION,
  type FollowUpContextInput,
  buildInjectedContextQuestions,
} from "@/lib/follow-up/context-signals";
import { isFinishLevelMaterialsQuestion } from "@/lib/follow-up/finish-level";
import type { AiFollowUpQuestion, FollowUpQuestion } from "@/types";

const AI_GAP_CATEGORIES = new Set(["timeline", "permits", "other"]);

function isDimensionFollowUp(
  question: Pick<FollowUpQuestion, "question_type" | "category">
) {
  return (
    question.question_type === "dimension_estimate" ||
    question.category === "dimensions"
  );
}

function isCabinetCountFollowUp(question: Pick<FollowUpQuestion, "question">) {
  return question.question.trim() === CABINET_COUNT_QUESTION;
}

export function hasInjectedFollowUp(
  existing: FollowUpQuestion[],
  injected: AiFollowUpQuestion
): boolean {
  return existing.some((question) => {
    if (injected.category === "dimensions") {
      return (
        isDimensionFollowUp(question) &&
        question.question.trim() === injected.question.trim()
      );
    }

    if (injected.category === "trade_scope") {
      return (
        question.category === "trade_scope" || isCabinetCountFollowUp(question)
      );
    }

    return question.question.trim() === injected.question.trim();
  });
}

export function getMissingInjectedQuestions(
  existing: FollowUpQuestion[],
  input: FollowUpContextInput
): AiFollowUpQuestion[] {
  return buildInjectedContextQuestions(input).filter(
    (question) => !hasInjectedFollowUp(existing, question)
  );
}

export function hasAiGapFollowUps(existing: FollowUpQuestion[]): boolean {
  return existing.some(
    (question) =>
      !isFinishLevelMaterialsQuestion(question) &&
      !isDimensionFollowUp(question) &&
      !isCabinetCountFollowUp(question) &&
      AI_GAP_CATEGORIES.has(question.category)
  );
}

export function needsFollowUpBackfill(
  existing: FollowUpQuestion[],
  input: FollowUpContextInput
): boolean {
  if (!existing.some(isFinishLevelMaterialsQuestion)) {
    return true;
  }

  if (getMissingInjectedQuestions(existing, input).length > 0) {
    return true;
  }

  return !hasAiGapFollowUps(existing);
}
