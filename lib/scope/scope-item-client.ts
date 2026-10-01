import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { readGuestProjectToken } from "@/lib/auth/guest-project-session";
import type { ScopeItem, ScopeItemPriority } from "@/types";

function withGuestToken(path: string, guestToken?: string | null) {
  if (!guestToken) return path;

  const params = new URLSearchParams({ guest_token: guestToken });
  return `${path}?${params.toString()}`;
}

export function scopeItemsCollectionPath(
  projectId: string,
  guestToken?: string | null
) {
  return withGuestToken(`/api/projects/${projectId}/scope-items`, guestToken);
}

export function scopeItemRequestPath(
  projectId: string,
  itemId: string,
  guestToken?: string | null
) {
  return withGuestToken(
    `/api/projects/${projectId}/scope-items/${itemId}`,
    guestToken
  );
}

function currentGuestToken(projectId: string) {
  if (typeof window === "undefined") return null;

  return (
    new URLSearchParams(window.location.search).get("guest_token") ??
    readGuestProjectToken(projectId)
  );
}

function resolveScopeItemsCollectionPath(projectId: string) {
  return scopeItemsCollectionPath(projectId, currentGuestToken(projectId));
}

function resolveScopeItemPath(projectId: string, itemId: string) {
  return scopeItemRequestPath(projectId, itemId, currentGuestToken(projectId));
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

export async function createScopeItemClient(
  projectId: string,
  payload: {
    category: string;
    text: string;
    priority?: ScopeItemPriority;
    needs_verification?: boolean;
  },
  getToken?: () => Promise<string | null>
): Promise<ScopeItem> {
  const response = await scopeItemFetch(
    resolveScopeItemsCollectionPath(projectId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: payload.category,
        text: payload.text,
        priority: payload.priority ?? "recommended",
        needs_verification: payload.needs_verification ?? false,
      }),
    },
    getToken
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Could not add that item."));
  }

  return (await response.json()) as ScopeItem;
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
