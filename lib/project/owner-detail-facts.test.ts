import assert from "node:assert/strict";
import test from "node:test";
import { Pencil, Ruler } from "lucide-react";
import type { FollowUpQuestion } from "@/types";
import { ownerDetailIcon } from "./owner-detail-facts";

function question(
  overrides: Partial<FollowUpQuestion> &
    Pick<FollowUpQuestion, "question" | "question_type" | "category">
): FollowUpQuestion {
  return {
    id: "question-id",
    project_id: "project-id",
    choices: null,
    answer: null,
    skipped: false,
    sort_order: 0,
    source: "ai",
    created_at: "2026-10-01T00:00:00.000Z",
    answered_at: null,
    ...overrides,
  };
}

test("kitchen and bathroom size facts both use the ruler icon", () => {
  const kitchen = question({
    question: "About how large is the kitchen?",
    question_type: "dimension_estimate",
    category: "dimensions",
  });
  const bathroom = question({
    question: "About how large is the guest bathroom?",
    question_type: "dimension_estimate",
    category: "dimensions",
  });
  const bedroom = question({
    question: "About how large is the bedroom?",
    question_type: "dimension_estimate",
    category: "dimensions",
  });

  assert.equal(ownerDetailIcon(kitchen), Ruler);
  assert.equal(ownerDetailIcon(bathroom), Ruler);
  assert.equal(ownerDetailIcon(bedroom), Ruler);
  assert.notEqual(ownerDetailIcon(kitchen), Pencil);
});
