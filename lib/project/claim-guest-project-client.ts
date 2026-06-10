import { waitForClerkSession } from "@/lib/auth/clerk-session-ready";
import {
  clearGuestProjectToken,
  readGuestProjectToken,
} from "@/lib/auth/guest-project-session";

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function claimGuestProjectClient(
  projectId: string,
  getToken: () => Promise<string | null>
): Promise<void> {
  const sessionToken = await waitForClerkSession(getToken);
  if (!sessionToken) {
    throw new Error(
      "Your account session is still loading. Refresh the page and try again."
    );
  }

  const guestToken = readGuestProjectToken(projectId);
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`/api/projects/${projectId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(guestToken ? { guest_token: guestToken } : {}),
      }),
    });

    if (response.ok) {
      clearGuestProjectToken(projectId);
      return;
    }

    if (response.status === 401 && attempt < maxAttempts - 1) {
      await waitForClerkSession(getToken, { maxAttempts: 4, delayMs: 300 });
      await delay(200 * (attempt + 1));
      continue;
    }

    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Could not save this project to your account."
    );
  }
}
