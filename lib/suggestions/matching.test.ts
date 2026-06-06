import { describe, expect, it } from "vitest";
import {
  findMatchingSuggestions,
  matchesAcceptedSuggestion,
} from "@/lib/suggestions/matching";
import type { ScopeSuggestion } from "@/types";

function suggestion(
  overrides: Partial<ScopeSuggestion> & Pick<ScopeSuggestion, "id">
): ScopeSuggestion {
  return {
    project_id: "project-1",
    invitation_id: "invitation-1",
    target_scope_item_id: null,
    suggestion_type: "edit",
    category: null,
    suggested_text: null,
    contractor_note: null,
    status: "pending",
    homeowner_rejection_reason: null,
    resolved_at: null,
    resolved_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("matchesAcceptedSuggestion", () => {
  it("matches other open edit/remove suggestions on the same scope item", () => {
    const accepted = suggestion({
      id: "accepted",
      invitation_id: "invitation-a",
      target_scope_item_id: "item-1",
      suggestion_type: "edit",
    });

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "other-edit",
          invitation_id: "invitation-b",
          target_scope_item_id: "item-1",
          suggestion_type: "edit",
        })
      )
    ).toBe(true);

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "other-remove",
          invitation_id: "invitation-b",
          target_scope_item_id: "item-1",
          suggestion_type: "remove",
        })
      )
    ).toBe(true);
  });

  it("does not match suggestions on other scope items or invitations for the same item", () => {
    const accepted = suggestion({
      id: "accepted",
      target_scope_item_id: "item-1",
      suggestion_type: "remove",
    });

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "other-item",
          target_scope_item_id: "item-2",
          suggestion_type: "edit",
        })
      )
    ).toBe(false);

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "same-item-add",
          target_scope_item_id: "item-1",
          suggestion_type: "add",
          suggested_text: "Install niche",
          category: "plumbing",
        })
      )
    ).toBe(false);
  });

  it("matches duplicate add suggestions by category and normalized text", () => {
    const accepted = suggestion({
      id: "accepted",
      suggestion_type: "add",
      category: "tile",
      suggested_text: "  Install  heated floor ",
    });

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "duplicate-add",
          invitation_id: "invitation-b",
          suggestion_type: "add",
          category: "tile",
          suggested_text: "install heated floor",
        })
      )
    ).toBe(true);

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "different-add",
          invitation_id: "invitation-b",
          suggestion_type: "add",
          category: "tile",
          suggested_text: "Install shower bench",
        })
      )
    ).toBe(false);
  });

  it("ignores notes and already-resolved suggestions", () => {
    const accepted = suggestion({
      id: "accepted",
      target_scope_item_id: "item-1",
      suggestion_type: "edit",
    });

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "note",
          suggestion_type: "note",
          contractor_note: "Looks good overall",
        })
      )
    ).toBe(false);

    expect(
      matchesAcceptedSuggestion(
        accepted,
        suggestion({
          id: "resolved",
          target_scope_item_id: "item-1",
          suggestion_type: "edit",
          status: "rejected",
        })
      )
    ).toBe(false);
  });
});

describe("findMatchingSuggestions", () => {
  it("returns all matching open suggestions except the accepted one", () => {
    const accepted = suggestion({
      id: "accepted",
      target_scope_item_id: "item-1",
      suggestion_type: "edit",
    });

    const matches = findMatchingSuggestions(accepted, [
      accepted,
      suggestion({
        id: "match-1",
        invitation_id: "invitation-b",
        target_scope_item_id: "item-1",
        suggestion_type: "edit",
      }),
      suggestion({
        id: "match-2",
        invitation_id: "invitation-c",
        target_scope_item_id: "item-1",
        suggestion_type: "remove",
      }),
      suggestion({
        id: "ignore",
        target_scope_item_id: "item-2",
        suggestion_type: "edit",
      }),
    ]);

    expect(matches.map((entry) => entry.id)).toEqual(["match-1", "match-2"]);
  });
});
