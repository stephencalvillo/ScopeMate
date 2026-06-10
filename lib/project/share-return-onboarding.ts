const PENDING_SHARE_DIALOG_KEY = "scopemate-pending-share-dialog";

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
