import { buildScopeItemTextFromFollowUp } from "@/lib/follow-up/scope-item-text";
import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import type { FollowUpQuestion, ScopeItem } from "@/types";

export type ProjectDetailFact = {
  id: string;
  label: string;
  value: string;
};

type DetailScopeItem = Pick<
  ScopeItem,
  "id" | "text" | "follow_up_question_id" | "sort_order"
>;

function parseCopiedDetailText(text: string): { label: string; value: string } | null {
  const notSure = text.match(/^(.*) \(homeowner is not sure\)$/);
  if (notSure?.[1]) {
    return { label: notSure[1], value: "Not sure" };
  }

  const splitAt = text.indexOf(": ");
  if (splitAt <= 0) return null;

  const label = text.slice(0, splitAt).trim();
  const value = text.slice(splitAt + 2).trim();
  if (!label || !value) return null;

  return { label, value };
}

export function listProjectDetailFacts(
  questions: FollowUpQuestion[],
  projectType?: string,
  linkedItems: DetailScopeItem[] = []
): ProjectDetailFact[] {
  const facts: ProjectDetailFact[] = [];
  const labels = new Set<string>();

  const answered = [...questions]
    .filter((question) => !question.skipped && Boolean(question.answer))
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const question of answered) {
    const value = formatFollowUpAnswer(question, projectType);
    const label = question.question.trim();
    if (!value || !label || labels.has(label)) continue;

    labels.add(label);
    facts.push({
      id: question.id,
      label,
      value,
    });
  }

  const copied = [...linkedItems]
    .filter((item) => item.follow_up_question_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const item of copied) {
    const parsed = parseCopiedDetailText(item.text);
    if (!parsed || labels.has(parsed.label)) continue;

    labels.add(parsed.label);
    facts.push({
      id: item.follow_up_question_id ?? item.id,
      label: parsed.label,
      value: parsed.value,
    });
  }

  return facts;
}

export function projectDetailScopeItemIds(
  questions: FollowUpQuestion[],
  items: Array<Pick<ScopeItem, "id" | "text" | "follow_up_question_id">>,
  projectType?: string
): Set<string> {
  const copiedTexts = new Set(
    questions
      .map((question) => buildScopeItemTextFromFollowUp(question, projectType))
      .filter((text): text is string => Boolean(text))
  );

  const ids = new Set<string>();

  for (const item of items) {
    if (item.follow_up_question_id || copiedTexts.has(item.text)) {
      ids.add(item.id);
    }
  }

  return ids;
}
