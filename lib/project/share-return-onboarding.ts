const PENDING_SHARE_DIALOG_KEY = "scopemate-pending-share-dialog";
const SIGNUP_SHARE_INTENT_KEY = "scopemate-signup-share-intent";

/** Clerk-safe return path with no query string (avoids verify-email 404s). */
export function buildShareClaimReturnUrl(projectId: string) {
  return `/projects/${projectId}/setup`;
}

export function persistSignupShareIntent(projectId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SIGNUP_SHARE_INTENT_KEY, projectId);
}

export function readSignupShareIntent(projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SIGNUP_SHARE_INTENT_KEY) === projectId;
}

export function clearSignupShareIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SIGNUP_SHARE_INTENT_KEY);
}

/** @deprecated Legacy return URL — do not pass query strings through Clerk redirects. */
export function buildLegacyShareClaimReturnUrl(
  projectId: string,
  guestToken?: string | null
) {
  const params = new URLSearchParams({
    claim: "1",
    share: "1",
  });

  if (guestToken) {
    params.set("guest_token", guestToken);
  }

  return `/projects/${projectId}?${params.toString()}`;
}

export function persistPendingShareDialog(projectId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_SHARE_DIALOG_KEY, projectId);
}

export function readPendingShareDialog(projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PENDING_SHARE_DIALOG_KEY) === projectId;
}

export function clearPendingShareDialog() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SHARE_DIALOG_KEY);
}
