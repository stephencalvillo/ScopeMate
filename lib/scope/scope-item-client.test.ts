import assert from "node:assert/strict";
import test from "node:test";
import {
  restoreScopeItem,
  scopeItemRequestPath,
  scopeItemsCollectionPath,
} from "./scope-item-client";
import type { ScopeItem } from "@/types";

function item(overrides: Partial<ScopeItem> & Pick<ScopeItem, "id" | "sort_order">): ScopeItem {
  return {
    project_id: "project-1",
    category: "planning",
    text: "Item",
    source: "ai",
    priority: "required",
    status: "active",
    needs_verification: false,
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

test("scope item collection path stays plain without a guest token", () => {
  assert.equal(
    scopeItemsCollectionPath("project-1"),
    "/api/projects/project-1/scope-items"
  );
});

test("scope item collection path includes a guest token when present", () => {
  assert.equal(
    scopeItemsCollectionPath("project-1", "guest-abc"),
    "/api/projects/project-1/scope-items?guest_token=guest-abc"
  );
});

test("scope item delete path stays plain without a guest token", () => {
  assert.equal(
    scopeItemRequestPath("project-1", "item-1"),
    "/api/projects/project-1/scope-items/item-1"
  );
});

test("scope item delete path includes a guest token when present", () => {
  assert.equal(
    scopeItemRequestPath("project-1", "item-1", "guest-abc"),
    "/api/projects/project-1/scope-items/item-1?guest_token=guest-abc"
  );
});

test("restoreScopeItem puts a removed item back in sort order", () => {
  const first = item({ id: "a", sort_order: 0, text: "First" });
  const second = item({ id: "b", sort_order: 1, text: "Second" });
  const third = item({ id: "c", sort_order: 2, text: "Third" });

  const restored = restoreScopeItem([first, third], second);

  assert.deepEqual(
    restored.map((entry) => entry.id),
    ["a", "b", "c"]
  );
});

test("restoreScopeItem does not duplicate an item that is already in the list", () => {
  const first = item({ id: "a", sort_order: 0 });
  const restored = restoreScopeItem([first], first);

  assert.equal(restored.length, 1);
  assert.equal(restored[0], first);
});
