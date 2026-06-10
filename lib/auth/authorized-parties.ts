export function getAuthorizedParties(): string[] {
  const parties = new Set<string>();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) {
    parties.add(appUrl);
  }

  for (const origin of [
    "https://scopebuddy.ai",
    "https://www.scopebuddy.ai",
    "https://myscopemate.ai",
    "https://www.myscopemate.ai",
  ]) {
    parties.add(origin);
  }

  if (process.env.NODE_ENV === "development") {
    parties.add("http://localhost:3000");
  }

  return [...parties];
}
