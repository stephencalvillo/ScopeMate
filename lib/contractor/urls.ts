const DEFAULT_BASE = "http://localhost:3000";

export function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_BASE;
}

export function buildReviewUrl(token: string) {
  return `${getAppBaseUrl()}/review/${token}`;
}

export function buildProjectUrl(projectId: string) {
  return `${getAppBaseUrl()}/projects/${projectId}`;
}
