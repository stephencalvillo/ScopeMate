import { describe, expect, it } from "vitest";
import {
  isShareLinkInvitation,
  SHARE_LINK_PLACEHOLDER_EMAIL,
  shareLinkInvitationIsActive,
} from "@/lib/contractor/project-share";

describe("share link invitation access", () => {
  it("treats placeholder and current share-token invitations as share links", () => {
    expect(
      isShareLinkInvitation(
        {
          contractor_email: SHARE_LINK_PLACEHOLDER_EMAIL,
          invitation_token: "token-a",
        },
        { share_token: "token-b" }
      )
    ).toBe(true);

    expect(
      isShareLinkInvitation(
        {
          contractor_email: "joe@example.com",
          invitation_token: "token-a",
        },
        { share_token: "token-a" }
      )
    ).toBe(true);
  });

  it("does not treat personal email invitations as share links", () => {
    expect(
      isShareLinkInvitation(
        {
          contractor_email: "maria@example.com",
          invitation_token: "personal-token",
        },
        { share_token: "share-token" }
      )
    ).toBe(false);
  });

  it("requires the current enabled share token for share-link access", () => {
    expect(
      shareLinkInvitationIsActive(
        { invitation_token: "old-token" },
        { share_enabled: true, share_token: "new-token" }
      )
    ).toBe(false);

    expect(
      shareLinkInvitationIsActive(
        { invitation_token: "new-token" },
        { share_enabled: true, share_token: "new-token" }
      )
    ).toBe(true);

    expect(
      shareLinkInvitationIsActive(
        { invitation_token: "new-token" },
        { share_enabled: false, share_token: "new-token" }
      )
    ).toBe(false);
  });
});
