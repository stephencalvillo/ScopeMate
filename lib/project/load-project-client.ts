import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { waitForClerkSession } from "@/lib/auth/clerk-session-ready";
import { readGuestProjectToken } from "@/lib/auth/guest-project-session";
import { claimGuestProjectClient } from "@/lib/project/claim-guest-project-client";
import type { ProjectWithScope } from "@/types";

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function ensureGuestProjectClaimed(
  projectId: string,
  getToken: () => Promise<string | null>,
  guestToken?: string | null
) {
  const token = guestToken ?? readGuestProjectToken(projectId);
  if (!token) {
    return;
  }

  try {
    await claimGuestProjectClient(projectId, getToken);
  } catch {
    // Project may already be claimed if the user retried this flow.
  }
}

export async function fetchProjectWithScopeClient(
  projectId: string,
  getToken: () => Promise<string | null>,
  options?: { maxAttempts?: number; delayMs?: number }
): Promise<ProjectWithScope> {
  const maxAttempts = options?.maxAttempts ?? 10;
  const delayMs = options?.delayMs ?? 400;

  await waitForClerkSession(getToken);

  let lastError = "Could not load your project.";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await authenticatedFetch(
      getToken,
      `/api/projects/${projectId}`
    );
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return data as ProjectWithScope;
    }

    lastError =
      typeof data.error === "string" ? data.error : "Could not load your project.";

    if (attempt < maxAttempts - 1) {
      await delay(delayMs);
    }
  }

  throw new Error(lastError);
}
