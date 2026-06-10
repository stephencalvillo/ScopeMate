const DEFAULT_FALLBACK = "/projects";

function stripQuery(path: string) {
  return path.split("?")[0] || DEFAULT_FALLBACK;
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]) {
  return allowedOrigins.some((allowed) => allowed === origin);
}

export function normalizeAuthRedirectUrl(
  redirectUrl: string | undefined | null,
  options?: { fallback?: string; allowedOrigins?: string[] }
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const trimmed = redirectUrl?.trim();

  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return stripQuery(trimmed) || fallback;
  }

  try {
    const url = new URL(trimmed);
    const allowedOrigins =
      options?.allowedOrigins ??
      [
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
        "https://scopebuddy.ai",
        "https://www.scopebuddy.ai",
        "https://myscopemate.ai",
      ].filter(Boolean);

    if (isAllowedOrigin(url.origin, allowedOrigins as string[])) {
      const path = `${url.pathname}${url.search}`;
      return path || fallback;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function normalizeAuthRedirectUrlClient(
  redirectUrl: string | undefined | null,
  fallback = DEFAULT_FALLBACK
): string {
  const allowedOrigins =
    typeof window !== "undefined"
      ? [window.location.origin]
      : ["https://scopebuddy.ai"];

  return normalizeAuthRedirectUrl(redirectUrl, { fallback, allowedOrigins });
}
