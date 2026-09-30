import assert from "node:assert/strict";
import test from "node:test";
import { usesOwnerProjectWorkspace } from "./owner-workspace";

test("guest unshared drafts stay on the creation accordion", () => {
  assert.equal(
    usesOwnerProjectWorkspace({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: false,
      creator_role: "homeowner",
    }),
    false
  );
});

test("claimed homeowner projects use the owned workspace", () => {
  assert.equal(
    usesOwnerProjectWorkspace({
      homeowner_id: "user-1",
      created_by_user_id: "user-1",
      share_enabled: false,
      creator_role: "homeowner",
    }),
    true
  );
});

test("contractor drafts do not use the homeowner owned workspace", () => {
  assert.equal(
    usesOwnerProjectWorkspace({
      homeowner_id: null,
      created_by_user_id: "contractor-1",
      share_enabled: false,
      creator_role: "contractor",
    }),
    false
  );
});

test("unclaimed shared guests do not use the owned workspace", () => {
  assert.equal(
    usesOwnerProjectWorkspace({
      homeowner_id: null,
      created_by_user_id: null,
      share_enabled: true,
      creator_role: "homeowner",
    }),
    false
  );
});
