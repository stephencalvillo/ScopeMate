import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeownerReviewRedirectPath } from "./review-homeowner-redirect";

test("buildHomeownerReviewRedirectPath sends in-progress reviews to the project page", () => {
  assert.equal(
    buildHomeownerReviewRedirectPath({
      projectId: "project-1",
      invitationId: "invitation-1",
      reviewSubmitted: false,
    }),
    "/projects/project-1"
  );
});

test("buildHomeownerReviewRedirectPath sends submitted reviews to the homeowner review detail page", () => {
  assert.equal(
    buildHomeownerReviewRedirectPath({
      projectId: "project-1",
      invitationId: "invitation-1",
      reviewSubmitted: true,
    }),
    "/projects/project-1/reviews/invitation-1"
  );
});
