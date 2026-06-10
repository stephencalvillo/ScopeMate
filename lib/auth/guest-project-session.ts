const GUEST_TOKEN_KEY_PREFIX = "scopemate_guest_token:";

function guestTokenKey(projectId: string) {
  return `${GUEST_TOKEN_KEY_PREFIX}${projectId}`;
}

export function persistGuestProjectToken(projectId: string, token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(guestTokenKey(projectId), token);
}

export function readGuestProjectToken(projectId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(guestTokenKey(projectId));
}

export function clearGuestProjectToken(projectId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(guestTokenKey(projectId));
}
