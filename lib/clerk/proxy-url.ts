const PRODUCTION_HOSTS = new Set(["myscopemate.ai", "www.myscopemate.ai"]);

function hostnameFromUrl(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value.trim().replace(/\/$/, "")).hostname;
  } catch {
    return null;
  }
}

function isClerkProxyHost(hostname: string) {
  return PRODUCTION_HOSTS.has(hostname) || hostname.endsWith(".vercel.app");
}

export function getClerkProxyUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const hostnames = [
    hostnameFromUrl(process.env.NEXT_PUBLIC_APP_URL),
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
    process.env.VERCEL_URL ?? null,
  ].filter((hostname): hostname is string => Boolean(hostname));

  if (hostnames.some(isClerkProxyHost)) {
    return "/__clerk";
  }

  return undefined;
}
