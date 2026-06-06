import type { AiFollowUpQuestion, FollowUpQuestion } from "@/types";

const CATEGORY_ORDER = [
  "dimensions",
  "materials",
  "timeline",
  "permits",
  "trade_scope",
  "other",
] as const;

function isDimensionQuestion(
  question: Pick<AiFollowUpQuestion | FollowUpQuestion, "question_type" | "category">
) {
  return (
    question.question_type === "dimension_estimate" ||
    question.category === "dimensions"
  );
}

export function dedupeFollowUpQuestions(
  questions: AiFollowUpQuestion[],
  maxQuestions: number
): AiFollowUpQuestion[] {
  const seenCategories = new Set<string>();
  let seenDimensionQuestion = false;
  const deduped: AiFollowUpQuestion[] = [];

  for (const question of questions) {
    if (isDimensionQuestion(question)) {
      if (seenDimensionQuestion) continue;
      seenDimensionQuestion = true;
      seenCategories.add("dimensions");
      deduped.push(question);
      continue;
    }

    if (seenCategories.has(question.category)) continue;

    seenCategories.add(question.category);
    deduped.push(question);

    if (deduped.length >= maxQuestions) break;
  }

  if (deduped.length >= maxQuestions) {
    return sortFollowUpQuestions(deduped);
  }

  for (const question of questions) {
    if (deduped.includes(question)) continue;

    if (isDimensionQuestion(question)) {
      if (seenDimensionQuestion) continue;
      seenDimensionQuestion = true;
    } else if (seenCategories.has(question.category)) {
      continue;
    } else {
      seenCategories.add(question.category);
    }

    deduped.push(question);
    if (deduped.length >= maxQuestions) break;
  }

  return sortFollowUpQuestions(deduped);
}

export function dedupeFollowUpQuestionsForDisplay(
  questions: FollowUpQuestion[]
): FollowUpQuestion[] {
  const seenCategories = new Set<string>();
  let seenDimensionQuestion = false;
  const deduped: FollowUpQuestion[] = [];

  for (const question of questions) {
    if (isDimensionQuestion(question)) {
      if (seenDimensionQuestion) continue;
      seenDimensionQuestion = true;
      seenCategories.add("dimensions");
      deduped.push(question);
      continue;
    }

    if (seenCategories.has(question.category)) continue;

    seenCategories.add(question.category);
    deduped.push(question);
  }

  return deduped;
}

function sortFollowUpQuestions<T extends { category: string }>(questions: T[]): T[] {
  return [...questions].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number]) -
      CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number])
  );
}
