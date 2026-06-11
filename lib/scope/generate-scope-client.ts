import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import type { GenerateScopeResult } from "@/types";

export async function generateScopeClient(
  projectId: string,
  options?: { additional_notes?: string },
  getToken?: () => Promise<string | null>
): Promise<GenerateScopeResult> {
  const requestInit: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options ?? {}),
  };

  const response = getToken
    ? await authenticatedFetch(
        getToken,
        `/api/projects/${projectId}/generate-scope`,
        requestInit
      )
    : await fetch(`/api/projects/${projectId}/generate-scope`, {
        ...requestInit,
        credentials: "include",
      });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not generate scope.");
  }

  return data as GenerateScopeResult;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
