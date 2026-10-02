import assert from "node:assert/strict";
import test from "node:test";
import {
  countVisibleContractorChanges,
  formatContractorViewChangeStatus,
  NO_CONTRACTOR_CHANGES_LABEL,
} from "./review-change-status.ts";

test("zero comments and suggestions use the no-changes line", () => {
  const counts = countVisibleContractorChanges([], ["cabinet"]);

  assert.deepEqual(counts, { commentCount: 0, suggestionCount: 0 });
  assert.equal(
    formatContractorViewChangeStatus(counts.commentCount, counts.suggestionCount),
    NO_CONTRACTOR_CHANGES_LABEL
  );
});

test("counts match one visible comment and one added line", () => {
  const counts = countVisibleContractorChanges(
    [
      {
        suggestion_type: "edit",
        target_scope_item_id: "soffit",
      },
      {
        suggestion_type: "add",
        target_scope_item_id: null,
      },
      {
        suggestion_type: "note",
        target_scope_item_id: "hidden-detail",
      },
    ],
    ["soffit", "cabinet"]
  );

  assert.deepEqual(counts, { commentCount: 1, suggestionCount: 1 });
  assert.equal(
    formatContractorViewChangeStatus(counts.commentCount, counts.suggestionCount),
    "1 comment · 1 suggestion"
  );
});

test("pluralizes each kind on its own", () => {
  assert.equal(formatContractorViewChangeStatus(2, 0), "2 comments");
  assert.equal(formatContractorViewChangeStatus(0, 2), "2 suggestions");
  assert.equal(formatContractorViewChangeStatus(1, 0), "1 comment");
  assert.equal(formatContractorViewChangeStatus(0, 1), "1 suggestion");
});
