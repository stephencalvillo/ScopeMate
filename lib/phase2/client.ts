import type { FollowUpQuestion, ScopeItem } from "@/types";

export type ProjectPhotoWithUrl = {
  id: string;
  project_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  sort_order: number;
  created_at: string;
  url: string;
};

import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";

async function projectFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
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

export async function fetchPhotos(
  projectId: string,
  getToken?: () => Promise<string | null>
): Promise<ProjectPhotoWithUrl[]> {
  const response = await projectFetch(
    `/api/projects/${projectId}/photos`,
    undefined,
    getToken
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not load photos.");
  }
  return data.photos as ProjectPhotoWithUrl[];
}

export async function uploadPhoto(
  projectId: string,
  file: File,
  getToken?: () => Promise<string | null>
): Promise<ProjectPhotoWithUrl> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await projectFetch(
    `/api/projects/${projectId}/photos`,
    {
      method: "POST",
      body: formData,
    },
    getToken
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not upload photo.");
  }
  return data.photo as ProjectPhotoWithUrl;
}

export async function deletePhoto(
  projectId: string,
  photoId: string,
  getToken?: () => Promise<string | null>
): Promise<void> {
  const response = await projectFetch(
    `/api/projects/${projectId}/photos/${photoId}`,
    { method: "DELETE" },
    getToken
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? "Could not delete photo.");
  }
}

export async function fetchFollowUpQuestions(
  projectId: string
): Promise<FollowUpQuestion[]> {
  const response = await fetch(
    `/api/projects/${projectId}/follow-up-questions`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not load questions.");
  }
  return data.questions as FollowUpQuestion[];
}

export async function generateFollowUpQuestions(
  projectId: string
): Promise<FollowUpQuestion[]> {
  const response = await fetch(
    `/api/projects/${projectId}/follow-up-questions/generate`,
    { method: "POST" }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not generate questions.");
  }
  return data.questions as FollowUpQuestion[];
}

export async function answerFollowUpQuestion(
  projectId: string,
  questionId: string,
  payload: { answer?: string; skipped?: boolean }
): Promise<{ question: FollowUpQuestion; scope_item?: ScopeItem | null }> {
  const response = await fetch(
    `/api/projects/${projectId}/follow-up-questions/${questionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not save answer.");
  }
  return data;
}

export async function syncFollowUpAnswersToScope(
  projectId: string
): Promise<{ scope_items: ScopeItem[] }> {
  const response = await fetch(
    `/api/projects/${projectId}/follow-up-questions/sync-scope`,
    { method: "POST" }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Could not sync answers to scope.");
  }

  return data;
}

export type SharedPhoto = {
  id: string;
  file_name: string;
  url: string;
  photo_type?: "current" | "inspiration" | string;
};
