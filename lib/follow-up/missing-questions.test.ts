import assert from "node:assert/strict";
import test from "node:test";
import {
  FINISH_LEVEL_QUESTION,
  isFinishLevelMaterialsQuestion,
} from "./finish-level";
import {
  getMissingInjectedQuestions,
  hasAiGapFollowUps,
  needsFollowUpBackfill,
} from "./missing-questions";
import type { FollowUpQuestion } from "@/types";

const description =
  "The project involves extending the existing house to attach it to a detached garage, which will require structural modifications and a kitchen remodel. Key considerations include ensuring proper structural support, relocating plumbing, and updating the kitchen with new cabinets and windows. The project will also involve laying a new concrete slab where the breezeway currently exists.";

function makeQuestion(
  overrides: Partial<FollowUpQuestion> & Pick<FollowUpQuestion, "question">
): FollowUpQuestion {
  return {
    id: "question-id",
    project_id: "project-id",
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

test("needsFollowUpBackfill detects finish-only projects", () => {
  const existing = [
    makeQuestion({
      question: FINISH_LEVEL_QUESTION,
      category: "materials",
    }),
  ];

  assert.equal(
    needsFollowUpBackfill(existing, { description, scopeItems: [] }),
    true
  );
  assert.equal(getMissingInjectedQuestions(existing, { description, scopeItems: [] }).length, 2);
});

test("needsFollowUpBackfill still works when finish category was stored as other", () => {
  const existing = [
    makeQuestion({
      question: FINISH_LEVEL_QUESTION,
      category: "other",
    }),
  ];

  assert.equal(isFinishLevelMaterialsQuestion(existing[0]!), true);
  assert.equal(
    needsFollowUpBackfill(existing, { description, scopeItems: [] }),
    true
  );
});

test("needsFollowUpBackfill stops once injected and ai-gap questions exist", () => {
  const existing = [
    makeQuestion({
      question: FINISH_LEVEL_QUESTION,
      category: "materials",
    }),
    makeQuestion({
      id: "question-2",
      question: "Roughly how big is the kitchen?",
      category: "dimensions",
      question_type: "dimension_estimate",
    }),
    makeQuestion({
      id: "question-3",
      question: "About how many cabinet doors or faces?",
      category: "trade_scope",
    }),
    makeQuestion({
      id: "question-4",
      question: "When do you want work to start?",
      category: "timeline",
    }),
  ];

  assert.equal(hasAiGapFollowUps(existing), true);
  assert.equal(
    needsFollowUpBackfill(existing, { description, scopeItems: [] }),
    false
  );
});
