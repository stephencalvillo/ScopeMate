import assert from "node:assert/strict";
import test from "node:test";
import { usesCreationWalkthrough } from "./creation-walkthrough";

test("guest unshared drafts use the creation walkthrough", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: false,
    }),
    true
  );
});

test("claimed homeowner projects use long-scroll even before share", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: "user-1",
      created_by_user_id: null,
      share_enabled: false,
    }),
    false
  );
});

test("signed-in contractor drafts use long-scroll", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: "contractor-1",
      share_enabled: false,
    }),
    false
  );
});

test("already-shared projects use long-scroll", () => {
  assert.equal(
    usesCreationWalkthrough({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: true,
    }),
    false
  );
});
