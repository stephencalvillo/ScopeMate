import assert from "node:assert/strict";
import test from "node:test";
import { SHARE_LINK_PLACEHOLDER_EMAIL } from "@/lib/contractor/project-share";
import { buildSentScopeRows } from "./sent-scope-rows";
import type {
  ContractorInvitationWithReview,
  ScopeSuggestionWithMeta,
} from "@/types";

const now = new Date("2026-09-30T15:00:00.000Z");

function invitation(
  overrides: Partial<ContractorInvitationWithReview>
): ContractorInvitationWithReview {
  return {
    id: "inv-1",
    project_id: "proj-1",
    invited_by: "user-1",
    contractor_name: "Contractor",
    contractor_email: SHARE_LINK_PLACEHOLDER_EMAIL,
    contractor_company: null,
    invitation_token: "token",
    status: "pending",
    accepted_at: null,
    first_accessed_at: null,
    last_accessed_at: null,
    expires_at: "2026-12-31T00:00:00.000Z",
    created_at: "2026-09-27T16:00:00.000Z",
    updated_at: "2026-09-27T16:00:00.000Z",
    ...overrides,
  };
}

test("unnamed opened share becomes a Sent scope share-again row", () => {
  const rows = buildSentScopeRows(
    [
      invitation({
        first_accessed_at: "2026-09-29T18:00:00.000Z",
      }),
    ],
    [],
    now
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].kind, "sent");
  assert.equal(rows[0].title, "Sent scope");
  assert.equal(rows[0].action, "share");
  assert.match(rows[0].meta, /Sent Sunday 9\/27/);
  assert.match(rows[0].meta, /Opened yesterday 9\/29/);
});

test("pending suggestion becomes a question row with Review", () => {
  const suggestion = {
    id: "sug-1",
    project_id: "proj-1",
    invitation_id: "inv-kurt",
    target_scope_item_id: null,
    suggestion_type: "note",
    category: "other",
    suggested_text: null,
    contractor_note: "Can we keep the existing window?",
    status: "pending",
    homeowner_rejection_reason: null,
    resolved_at: null,
    resolved_by: null,
    created_at: "2026-09-28T12:00:00.000Z",
    updated_at: "2026-09-28T12:00:00.000Z",
    contractor_name: "Kurt Blaiser",
  } as ScopeSuggestionWithMeta;

  const rows = buildSentScopeRows(
    [
      invitation({
        id: "inv-kurt",
        contractor_name: "Kurt Blaiser",
        contractor_email: "kurt@example.com",
        first_accessed_at: "2026-09-29T18:00:00.000Z",
      }),
    ],
    [suggestion],
    now
  );

  assert.equal(rows[0].kind, "question");
  assert.equal(rows[0].title, "Kurt Blaiser has a question");
  assert.equal(rows[0].action, "review");
  assert.equal(rows[0].pendingSuggestions.length, 1);
});

test("submitted review becomes a bid row", () => {
  const rows = buildSentScopeRows(
    [
      invitation({
        id: "inv-juan",
        contractor_name: "Juan Numberjuan",
        contractor_email: "juan@example.com",
        status: "submitted",
        first_accessed_at: "2026-09-28T12:00:00.000Z",
        review: {
          id: "rev-1",
          project_id: "proj-1",
          invitation_id: "inv-juan",
          notes: "Bid attached",
          status: "submitted",
          submitted_at: "2026-09-28T20:00:00.000Z",
          scope_snapshot: null,
          created_at: "2026-09-27T16:00:00.000Z",
          updated_at: "2026-09-28T20:00:00.000Z",
        },
      }),
    ],
    [],
    now
  );

  assert.equal(rows[0].kind, "submitted");
  assert.equal(rows[0].title, "Juan Numberjuan");
  assert.equal(rows[0].action, "review");
  assert.equal(
    rows[0].meta,
    "Sent Sunday 9/27 · Bid submitted 9/28"
  );
});

test("unopened invitations stay off the list", () => {
  const rows = buildSentScopeRows(
    [
      invitation({ id: "unopened-share" }),
      invitation({
        id: "unopened-named",
        contractor_name: "Juan Mejia",
        contractor_email: "juan@example.com",
      }),
      invitation({
        id: "opened-share",
        first_accessed_at: "2026-09-29T18:00:00.000Z",
      }),
      invitation({
        id: "opened-by-last-access",
        contractor_name: "Juan Mejia",
        contractor_email: "juan@example.com",
        created_at: "2026-09-29T16:00:00.000Z",
        last_accessed_at: "2026-09-30T12:00:00.000Z",
      }),
    ],
    [],
    now
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    ["opened-by-last-access", "opened-share"]
  );
  assert.equal(rows[0].title, "Juan Mejia");
  assert.match(rows[0].meta, /Opened today 9\/30/);
  assert.equal(rows[1].title, "Sent scope");
  assert.match(rows[1].meta, /Opened yesterday 9\/29/);
});

test("revoked invitations are omitted", () => {
  const rows = buildSentScopeRows(
    [invitation({ status: "revoked" })],
    [],
    now
  );
  assert.equal(rows.length, 0);
});
