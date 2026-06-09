export function getClerkProxyUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim();
  if (!configured) {
    return undefined;
  }

  return configured.replace(/\/$/, "");
}
