import assert from "node:assert/strict";
import test from "node:test";
import {
  FINISH_LEVEL_QUESTION,
} from "../follow-up/finish-level";
import { TIMELINE_QUESTION } from "../follow-up/timeline";
import {
  buildProjectReadinessSummary,
  countReadinessPhotos,
} from "./readiness-summary";
import type { FollowUpQuestion } from "../../types";

function makeQuestion(
  overrides: Partial<FollowUpQuestion> & Pick<FollowUpQuestion, "category" | "question">
): FollowUpQuestion {
  return {
    id: "question-id",
    project_id: "project-id",
    question_type: "choice",
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

const project = {
  city: "Austin",
  zip: "78701",
  location: "Austin, TX 78701",
};

test("buildProjectReadinessSummary surfaces timeline and finish answers", () => {
  const summary = buildProjectReadinessSummary(
    project,
    [
      makeQuestion({
        category: "timeline",
        question: TIMELINE_QUESTION,
        answer: "1–3 months",
      }),
      makeQuestion({
        category: "materials",
        question: FINISH_LEVEL_QUESTION,
        answer: "Elevated",
      }),
    ],
    [{ photo_type: "current" }, { photo_type: "inspiration" }]
  );

  assert.equal(summary.target_start, "1–3 months");
  assert.equal(summary.finish_level, "Elevated");
  assert.equal(summary.location, "Austin, TX");
  assert.deepEqual(summary.photos, { current: 1, inspiration: 1, total: 2 });
});

test("buildProjectReadinessSummary keeps Just exploring without urgency framing", () => {
  const summary = buildProjectReadinessSummary(
    project,
    [
      makeQuestion({
        category: "timeline",
        question: TIMELINE_QUESTION,
        answer: "Just exploring",
      }),
    ],
    []
  );

  assert.equal(summary.target_start, "Just exploring");
});

test("countReadinessPhotos defaults missing photo_type to current", () => {
  assert.deepEqual(countReadinessPhotos([{}, { photo_type: "current" }]), {
    current: 2,
    inspiration: 0,
    total: 2,
  });
});
