import { createHmac, timingSafeEqual } from "crypto";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { REVIEW_SESSION_COOKIE } from "@/lib/contractor/constants";

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSigningSecret() {
  const secret =
    process.env.REVIEW_SESSION_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("Missing REVIEW_SESSION_SECRET or CLERK_SECRET_KEY.");
  }
  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("base64url");
}

export function createReviewSessionValue(token: string) {
  const issuedAt = Date.now();
  const payload = `${token}.${issuedAt}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifyReviewSessionValue(value: string, token: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [sessionToken, issuedAtRaw, signature] = parts;
  if (sessionToken !== token) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;

  const payload = `${sessionToken}.${issuedAtRaw}`;
  const expected = signPayload(payload);

  try {
    const provided = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (provided.length !== expectedBuffer.length) return false;
    return timingSafeEqual(provided, expectedBuffer);
  } catch {
    return false;
  }
}

export function reviewSessionCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function reviewSessionCookie(token: string) {
  return {
    name: REVIEW_SESSION_COOKIE,
    value: createReviewSessionValue(token),
    ...reviewSessionCookieOptions(),
  };
}
