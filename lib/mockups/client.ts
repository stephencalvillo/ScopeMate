import { readGuestProjectToken } from "@/lib/auth/guest-project-session";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import type { ProjectMockup } from "@/types";

export type ProjectMockupWithUrl = ProjectMockup & { url: string };

export type GeneratedMockupImage = {
  b64: string;
  mimeType: string;
};

async function projectFetch(
  projectId: string,
  path: string,
  init: RequestInit | undefined,
  getToken?: () => Promise<string | null>
) {
  const url = new URL(path, window.location.origin);
  const token =
    new URLSearchParams(window.location.search).get("guest_token") ??
    readGuestProjectToken(projectId);
  if (token) url.searchParams.set("guest_token", token);

  const input = `${url.pathname}${url.search}`;
  if (getToken) return authenticatedFetch(getToken, input, init);
  return fetch(input, { ...init, credentials: "include" });
}

export async function fetchMockups(
  projectId: string,
  getToken?: () => Promise<string | null>
): Promise<ProjectMockupWithUrl[]> {
  const response = await projectFetch(
    projectId,
    `/api/projects/${projectId}/mockups`,
    undefined,
    getToken
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not load mock-ups.");
  }
  return data.mockups as ProjectMockupWithUrl[];
}

export async function generateMockups(
  projectId: string,
  formData: FormData,
  getToken?: () => Promise<string | null>,
  signal?: AbortSignal
): Promise<GeneratedMockupImage[]> {
  const response = await projectFetch(
    projectId,
    `/api/projects/${projectId}/mockups/generate`,
    { method: "POST", body: formData, signal },
    getToken
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not create the mock-up.");
  }
  return data.images as GeneratedMockupImage[];
}

export async function saveMockups(
  projectId: string,
  input: { prompt: string; images: GeneratedMockupImage[] },
  getToken?: () => Promise<string | null>
): Promise<ProjectMockupWithUrl[]> {
  const response = await projectFetch(
    projectId,
    `/api/projects/${projectId}/mockups`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    getToken
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not save the mock-up.");
  }
  return data.mockups as ProjectMockupWithUrl[];
}

export async function deleteMockup(
  projectId: string,
  mockupId: string,
  getToken?: () => Promise<string | null>
): Promise<void> {
  const response = await projectFetch(
    projectId,
    `/api/projects/${projectId}/mockups/${mockupId}`,
    { method: "DELETE" },
    getToken
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? "Could not remove the mock-up.");
  }
}
