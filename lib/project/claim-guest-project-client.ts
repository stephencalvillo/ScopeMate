import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { clearGuestProjectToken, readGuestProjectToken } from "@/lib/auth/guest-project-session";

export async function claimGuestProjectClient(
  projectId: string,
  getToken: () => Promise<string | null>
): Promise<void> {
  const guestToken = readGuestProjectToken(projectId);
  const response = await authenticatedFetch(
    getToken,
    `/api/projects/${projectId}/claim`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(guestToken ? { guest_token: guestToken } : {}),
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Could not save this project to your account."
    );
  }

  clearGuestProjectToken(projectId);
}
