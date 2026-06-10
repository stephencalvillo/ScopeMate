import { waitForClerkSession } from "@/lib/auth/clerk-session-ready";

export async function authenticatedFetch(
  getToken: () => Promise<string | null>,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await waitForClerkSession(getToken);
  if (!token) {
    throw new Error(
      "Your account session is still loading. Refresh the page and try again."
    );
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
