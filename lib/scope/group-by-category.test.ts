import assert from "node:assert/strict";
import test from "node:test";
import { SCOPE_CATEGORIES } from "@/types";
import {
  compareScopeCategories,
  groupScopeItemsByCategory,
} from "./group-by-category";
import type { ScopeItem } from "@/types";

test("carpentry comes immediately before drywall in the trade sequence", () => {
  const carpentry = SCOPE_CATEGORIES.indexOf("carpentry");
  const drywall = SCOPE_CATEGORIES.indexOf("drywall");

  assert.ok(carpentry >= 0);
  assert.ok(drywall >= 0);
  assert.equal(carpentry, drywall - 1);
});

test("grouped scope lists put carpentry before drywall", () => {
  const items: ScopeItem[] = [
    {
      id: "drywall-1",
      project_id: "project-1",
      category: "drywall",
      text: "Hang drywall",
      source: "ai",
      priority: "required",
      status: "active",
      sort_order: 0,
      needs_verification: false,
      created_at: "2026-10-01T00:00:00.000Z",
      updated_at: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "carpentry-1",
      project_id: "project-1",
      category: "carpentry",
      text: "Frame walls",
      source: "ai",
      priority: "required",
      status: "active",
      sort_order: 0,
      needs_verification: false,
      created_at: "2026-10-01T00:00:00.000Z",
      updated_at: "2026-10-01T00:00:00.000Z",
    },
  ];

  assert.ok(compareScopeCategories("carpentry", "drywall") < 0);
  assert.deepEqual(
    groupScopeItemsByCategory(items).map((group) => group.category),
    ["carpentry", "drywall"]
  );
});
