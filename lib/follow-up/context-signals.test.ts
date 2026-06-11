import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInjectedContextQuestions,
  detectCabinetWork,
  detectPrimaryRoom,
  detectRoomsNeedingDimensions,
  hasCabinetQuantityInText,
  hasDimensionInfoInText,
} from "./context-signals";
import type { ScopeItem } from "@/types";

function makeScopeItem(text: string): ScopeItem {
  return {
    id: "scope-item-id",
    project_id: "project-id",
    category: "carpentry",
    text,
    source: "ai",
    priority: "required",
    needs_verification: false,
    status: "active",
    sort_order: 0,
    follow_up_question_id: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

test("detectPrimaryRoom returns kitchen for multi-room remodel", () => {
  const room = detectPrimaryRoom({
    description: "We want to remodel the kitchen and update the bathroom.",
    scopeItems: [],
  });

  assert.equal(room?.key, "kitchen");
});

test("detectRoomsNeedingDimensions returns each room without size info", () => {
  const rooms = detectRoomsNeedingDimensions({
    description: "We want to remodel the kitchen and update the bathroom.",
    scopeItems: [],
  });

  assert.deepEqual(
    rooms.map((room) => room.key),
    ["kitchen", "bathroom"]
  );
});

test("detectPrimaryRoom skips room when dimensions are already provided", () => {
  const room = detectPrimaryRoom({
    description: "Kitchen remodel in a 12x14 kitchen with new cabinets.",
    scopeItems: [],
  });

  assert.equal(room, null);
});

test("detectCabinetWork finds new cabinet scope without quantity", () => {
  assert.equal(
    detectCabinetWork({
      description: "Replace kitchen cabinets with shaker style.",
      scopeItems: [makeScopeItem("Install new kitchen cabinetry")],
    }),
    true
  );
});

test("detectCabinetWork skips when cabinet count is already stated", () => {
  assert.equal(
    detectCabinetWork({
      description: "Refinish about 24 cabinet doors in the kitchen.",
      scopeItems: [],
    }),
    false
  );
});

test("detectPrimaryRoom still asks about kitchen when another room has dimensions", () => {
  const room = detectPrimaryRoom({
    description: "Kitchen remodel and update the 8x10 bathroom.",
    scopeItems: [],
  });

  assert.equal(room?.key, "kitchen");
});

test("buildInjectedContextQuestions returns room and cabinet questions", () => {
  const questions = buildInjectedContextQuestions({
    description: "Kitchen remodel with new cabinets and quartz counters.",
    scopeItems: [],
  });

  assert.equal(questions.length, 2);
  assert.equal(questions[0]?.question_type, "dimension_estimate");
  assert.match(questions[0]?.question ?? "", /kitchen/i);
  assert.equal(questions[1]?.question_type, "choice");
  assert.match(questions[1]?.question ?? "", /cabinet/i);
});

test("buildInjectedContextQuestions asks size for each room without dimensions", () => {
  const questions = buildInjectedContextQuestions({
    description: "Remodel the kitchen and update the bathroom.",
    scopeItems: [],
  });

  assert.equal(questions.length, 2);
  assert.match(questions[0]?.question ?? "", /kitchen/i);
  assert.match(questions[1]?.question ?? "", /bathroom/i);
  assert.equal(questions[0]?.question_type, "dimension_estimate");
  assert.equal(questions[1]?.question_type, "dimension_estimate");
});

test("dimension and cabinet quantity helpers recognize common phrasing", () => {
  assert.equal(hasDimensionInfoInText("The bathroom is roughly 8x10 feet."), true);
  assert.equal(hasCabinetQuantityInText("We have 22 cabinet doors to refinish."), true);
});
