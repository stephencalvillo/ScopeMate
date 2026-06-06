import type { AiFollowUpQuestion, FollowUpQuestionCategory } from "@/types";

const CATEGORY_ORDER: FollowUpQuestionCategory[] = [
  "dimensions",
  "materials",
  "timeline",
  "permits",
  "trade_scope",
  "other",
];

export function dedupeFollowUpQuestions(
  questions: AiFollowUpQuestion[],
  maxQuestions: number
): AiFollowUpQuestion[] {
  const seenCategories = new Set<FollowUpQuestionCategory>();
  const deduped: AiFollowUpQuestion[] = [];

  for (const question of questions) {
    if (seenCategories.has(question.category)) continue;

    seenCategories.add(question.category);
    deduped.push(question);

    if (deduped.length >= maxQuestions) break;
  }

  if (deduped.length >= maxQuestions) {
    return deduped;
  }

  for (const question of questions) {
    if (deduped.includes(question)) continue;

    deduped.push(question);
    if (deduped.length >= maxQuestions) break;
  }

  return deduped.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  );
}
