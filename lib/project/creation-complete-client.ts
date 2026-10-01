import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { readGuestProjectToken } from "@/lib/auth/guest-project-session";

function creationCompletePath(projectId: string) {
  const path = `/api/projects/${projectId}/creation-complete`;
  if (typeof window === "undefined") return path;

  const token =
    new URLSearchParams(window.location.search).get("guest_token") ??
    readGuestProjectToken(projectId);
  if (!token) return path;

  const url = new URL(path, window.location.origin);
  url.searchParams.set("guest_token", token);
  return `${url.pathname}${url.search}`;
}

export async function markCreationCompleteClient(
  projectId: string,
  getToken?: () => Promise<string | null>
): Promise<{ creation_completed_at: string | null }> {
  const requestInit: RequestInit = { method: "POST" };
  const path = creationCompletePath(projectId);

  const response = getToken
    ? await authenticatedFetch(getToken, path, requestInit)
    : await fetch(path, {
        ...requestInit,
        credentials: "include",
      });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Could not finish project setup."
    );
  }

  return {
    creation_completed_at:
      typeof data.creation_completed_at === "string"
        ? data.creation_completed_at
        : null,
  };
}
