import assert from "node:assert/strict";
import test from "node:test";
import {
  createReviewSessionValue,
  verifyReviewSessionValue,
} from "./review-session";

test("review session cookie validates only for matching token", () => {
  process.env.CLERK_SECRET_KEY = "test-review-session-secret";

  const tokenA = "invite-token-a";
  const tokenB = "invite-token-b";
  const session = createReviewSessionValue(tokenA);

  assert.equal(verifyReviewSessionValue(session, tokenA), true);
  assert.equal(verifyReviewSessionValue(session, tokenB), false);
  assert.equal(verifyReviewSessionValue(`${session}tampered`, tokenA), false);
});
