import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { readGuestProjectToken } from "@/lib/auth/guest-project-session";
import type { Project } from "@/types";

function projectUpdatePath(projectId: string) {
  const path = `/api/projects/${projectId}`;
  if (typeof window === "undefined") return path;

  const token =
    new URLSearchParams(window.location.search).get("guest_token") ??
    readGuestProjectToken(projectId);
  if (!token) return path;

  const url = new URL(path, window.location.origin);
  url.searchParams.set("guest_token", token);
  return `${url.pathname}${url.search}`;
}

export async function updateProjectSummaryClient(
  projectId: string,
  aiSummary: string,
  getToken?: () => Promise<string | null>
): Promise<Project> {
  const requestInit: RequestInit = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ai_summary: aiSummary }),
  };
  const path = projectUpdatePath(projectId);

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
        : "Could not save your summary."
    );
  }

  return data as Project;
}
