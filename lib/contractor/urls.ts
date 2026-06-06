const DEFAULT_BASE = "http://localhost:3000";

export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_BASE;
}

export function buildShareUrl(token: string) {
  return `${getAppBaseUrl()}/share/${token}`;
}

export function buildReviewUrl(token: string) {
  return `${getAppBaseUrl()}/review/${token}`;
}

export function buildProjectUrl(projectId: string) {
  return `${getAppBaseUrl()}/projects/${projectId}`;
}
