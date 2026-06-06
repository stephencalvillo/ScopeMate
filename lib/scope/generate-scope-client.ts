import type { GenerateScopeResult } from "@/types";

export async function generateScopeClient(
  projectId: string,
  options?: { additional_notes?: string }
): Promise<GenerateScopeResult> {
  const response = await fetch(`/api/projects/${projectId}/generate-scope`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options ?? {}),
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
