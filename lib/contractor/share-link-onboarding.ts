const SHARE_LINK_RETURN_KEY = "scopemate-share-link-return";
const SHARE_LINK_DEFERRED_PREFIX = "scopemate-share-link-deferred:";

export function persistShareLinkReturn(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SHARE_LINK_RETURN_KEY, `/review/${token}`);
}

export function readShareLinkReturn(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SHARE_LINK_RETURN_KEY);
}

export function clearShareLinkReturn() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SHARE_LINK_RETURN_KEY);
}

function deferredKey(token: string) {
  return `${SHARE_LINK_DEFERRED_PREFIX}${token}`;
}

export function isShareLinkOnboardingDeferred(token: string) {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(deferredKey(token)) === "1";
}

export function deferShareLinkOnboarding(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(deferredKey(token), "1");
}

export function clearShareLinkOnboardingDeferral(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(deferredKey(token));
}

const SHARE_LINK_PENDING_UNLOCK_KEY = "scopemate-share-link-pending-unlock";

export function persistShareLinkPendingUnlock(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SHARE_LINK_PENDING_UNLOCK_KEY, token);
}

export function readShareLinkPendingUnlock(token: string) {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SHARE_LINK_PENDING_UNLOCK_KEY) === token;
}

export function clearShareLinkPendingUnlock() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SHARE_LINK_PENDING_UNLOCK_KEY);
}
