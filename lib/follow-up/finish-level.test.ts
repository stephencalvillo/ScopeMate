import assert from "node:assert/strict";
import test from "node:test";
import {
  FINISH_LEVEL_CHOICES,
  FINISH_LEVEL_QUESTION,
  hasPartialFollowUpSet,
} from "./finish-level";
import type { FollowUpQuestion } from "@/types";

function makeQuestion(
  overrides: Partial<FollowUpQuestion> = {}
): FollowUpQuestion {
  return {
    id: "question-id",
    project_id: "project-id",
    question: FINISH_LEVEL_QUESTION,
    question_type: "choice",
    category: "materials",
    choices: [],
    answer: null,
    skipped: false,
    sort_order: 0,
    source: "ai",
    created_at: "2026-01-01T00:00:00.000Z",
    answered_at: null,
    ...overrides,
  };
}

test("finish level choices use homeowner-friendly budget label", () => {
  assert.equal(FINISH_LEVEL_CHOICES[0], "Budget friendly");
});

test("hasPartialFollowUpSet detects finish-only follow-up sets", () => {
  assert.equal(hasPartialFollowUpSet([makeQuestion()]), true);
  assert.equal(hasPartialFollowUpSet([]), false);
  assert.equal(
    hasPartialFollowUpSet([
      makeQuestion(),
      makeQuestion({
        id: "question-2",
        question: "Roughly how big is the kitchen?",
        category: "dimensions",
        question_type: "dimension_estimate",
      }),
    ]),
    false
  );
});
