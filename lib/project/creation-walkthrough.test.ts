import assert from "node:assert/strict";
import test from "node:test";
import { usesCreationWalkthrough } from "./creation-walkthrough";

test("guest unshared drafts use the creation walkthrough", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: false,
      creator_role: "homeowner",
      creation_completed_at: null,
    }),
    true
  );
});

test("guests stay on the walkthrough after Finish until they claim or share", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: false,
      creator_role: "homeowner",
      creation_completed_at: "2026-10-01T00:00:00.000Z",
    }),
    true
  );
});

test("signed-in homeowners use the walkthrough until they finish creation", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: "user-1",
      created_by_user_id: "user-1",
      share_enabled: false,
      creator_role: "homeowner",
      creation_completed_at: null,
    }),
    true
  );
});

test("signed-in homeowners leave the walkthrough after Finish", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: "user-1",
      created_by_user_id: "user-1",
      share_enabled: false,
      creator_role: "homeowner",
      creation_completed_at: "2026-10-01T00:00:00.000Z",
    }),
    false
  );
});

test("legacy owned payloads without the column stay off the walkthrough", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: "user-1",
      created_by_user_id: "user-1",
      share_enabled: false,
      creator_role: "homeowner",
    }),
    false
  );
});

test("signed-in contractor drafts do not use the homeowner walkthrough", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: "contractor-1",
      share_enabled: false,
      creator_role: "contractor",
      creation_completed_at: null,
    }),
    false
  );
});

test("already-shared projects leave the walkthrough", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: true,
      creator_role: "homeowner",
      creation_completed_at: null,
    }),
    false
  );
});
