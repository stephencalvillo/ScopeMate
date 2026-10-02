import assert from "node:assert/strict";
import test from "node:test";
import type { FollowUpQuestion, ScopeItem } from "@/types";
import {
  listProjectDetailFacts,
  projectDetailScopeItemIds,
} from "./project-detail-facts";

function question(
  overrides: Partial<FollowUpQuestion> &
    Pick<FollowUpQuestion, "id" | "question" | "question_type" | "category">
): FollowUpQuestion {
  return {
    project_id: "project-id",
    choices: null,
    answer: null,
    skipped: false,
    sort_order: 0,
    source: "ai",
    created_at: "2026-10-01T00:00:00.000Z",
    answered_at: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

function item(
  overrides: Partial<ScopeItem> & Pick<ScopeItem, "id" | "text" | "category">
): ScopeItem {
  return {
    project_id: "project-id",
    source: "homeowner",
    priority: "optional",
    status: "active",
    sort_order: 0,
    needs_verification: false,
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

const timeline = question({
  id: "timeline",
  question: "When are you looking to start?",
  question_type: "choice",
  category: "timeline",
  answer: "1–3 months",
  sort_order: 0,
});

const size = question({
  id: "size",
  question: "Roughly how big is the garage?",
  question_type: "dimension_estimate",
  category: "dimensions",
  answer: "medium",
  sort_order: 2,
});

test("detail facts use the question as the label and the answer as the value", () => {
  assert.deepEqual(
    listProjectDetailFacts([size, timeline], "Garage Conversion"),
    [
      {
        id: "timeline",
        label: "When are you looking to start?",
        value: "1–3 months",
      },
      {
        id: "size",
        label: "Roughly how big is the garage?",
        value: "Medium (~50-150 sq ft)",
      },
    ]
  );
});

test("old review snapshots drop copied answers even without the question link", () => {
  const liveSize = item({
    id: "size-item",
    category: "other",
    text: "Roughly how big is the garage?: Medium (~50-150 sq ft)",
    follow_up_question_id: "size",
  });
  const snapshotSize = item({
    id: "size-item",
    category: "other",
    text: "Roughly how big is the garage?: Medium (~50-150 sq ft)",
  });
  const snapshotStart = item({
    id: "start-item",
    category: "other",
    text: "When are you looking to start?: 1–3 months",
  });
  const framing = item({
    id: "framing",
    category: "structural",
    text: "Construct new wall framing for entryway and install front door.",
    source: "ai",
  });

  const ids = projectDetailScopeItemIds(
    [timeline, size],
    [liveSize, snapshotSize, snapshotStart, framing],
    "Garage Conversion"
  );

  assert.equal(ids.has("size-item"), true);
  assert.equal(ids.has("start-item"), true);
  assert.equal(ids.has("framing"), false);
});
