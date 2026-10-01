import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { readGuestProjectToken } from "@/lib/auth/guest-project-session";
import type { ScopeItem, ScopeItemPriority } from "@/types";

export function scopeItemRequestPath(
  projectId: string,
  itemId: string,
  guestToken?: string | null
) {
  const path = `/api/projects/${projectId}/scope-items/${itemId}`;
  if (!guestToken) return path;

  const params = new URLSearchParams({ guest_token: guestToken });
  return `${path}?${params.toString()}`;
}

function resolveScopeItemPath(projectId: string, itemId: string) {
  const guestToken =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("guest_token") ??
        readGuestProjectToken(projectId);

  return scopeItemRequestPath(projectId, itemId, guestToken);
}

async function scopeItemFetch(
  input: string,
  init: RequestInit,
  getToken?: () => Promise<string | null>
) {
  if (getToken) {
    return authenticatedFetch(getToken, input, init);
  }

  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

async function readErrorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}));
  return typeof data.error === "string" ? data.error : fallback;
}

export async function updateScopeItemClient(
  projectId: string,
  itemId: string,
  payload: { text: string; priority: ScopeItemPriority },
  getToken?: () => Promise<string | null>
): Promise<ScopeItem> {
  const response = await scopeItemFetch(
    resolveScopeItemPath(projectId, itemId),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    getToken
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Could not save that item."));
  }

  return (await response.json()) as ScopeItem;
}

export async function deleteScopeItemClient(
  projectId: string,
  itemId: string,
  getToken?: () => Promise<string | null>
): Promise<void> {
  const response = await scopeItemFetch(
    resolveScopeItemPath(projectId, itemId),
    { method: "DELETE" },
    getToken
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Could not remove that item.")
    );
  }
}

export function restoreScopeItem(items: ScopeItem[], item: ScopeItem) {
  if (items.some((entry) => entry.id === item.id)) {
    return items;
  }

  return [...items, item].sort((a, b) => a.sort_order - b.sort_order);
}
