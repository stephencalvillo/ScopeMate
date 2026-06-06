const DEFAULT_BASE = "http://localhost:3000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

function readConfiguredAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return normalizeBaseUrl(configured);
  return null;
}

export function getAppBaseUrl(request?: Request) {
  const configured = readConfiguredAppUrl();
  if (configured) return configured;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return normalizeBaseUrl(`https://${productionHost}`);
  }

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return normalizeBaseUrl(`${proto}://${host}`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeBaseUrl(`https://${vercelUrl}`);
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_BASE;
}

export function buildShareUrl(token: string, request?: Request) {
  return buildReviewUrl(token, request);
}

export function buildReviewUrl(token: string, request?: Request) {
  return `${getAppBaseUrl(request)}/review/${token}`;
}

export function buildProjectUrl(projectId: string, request?: Request) {
  return `${getAppBaseUrl(request)}/projects/${projectId}`;
}

export function buildProjectTabUrl(
  projectId: string,
  tab: string,
  request?: Request
) {
  return `${buildProjectUrl(projectId, request)}?tab=${tab}`;
}
