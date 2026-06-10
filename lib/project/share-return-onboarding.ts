const PENDING_SHARE_DIALOG_KEY = "scopemate-pending-share-dialog";

export function buildShareClaimReturnUrl(
  projectId: string,
  guestToken?: string | null
) {
  const params = new URLSearchParams({
    share: "1",
  });

  if (guestToken) {
    params.set("guest_token", guestToken);
  }

  return `/projects/${projectId}/setup?${params.toString()}`;
}

/** @deprecated Legacy return URL — prefer buildShareClaimReturnUrl (setup page). */
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
