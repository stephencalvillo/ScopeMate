import { generateProjectTitle } from "@/lib/ai/generate-project-title";

export function deriveTitle(description: string, provided?: string): string {
  if (provided?.trim()) return provided.trim();

  const firstSentence = description.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 80) {
    return firstSentence;
  }

  return (
    description.trim().slice(0, 60).trim() +
    (description.length > 60 ? "..." : "")
  );
}

export function isGenericTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "new project" ||
    normalized === "untitled project" ||
    normalized === "my project" ||
    normalized.endsWith("...") ||
    normalized.length > 60
  );
}

export async function resolveProjectTitle(
  description: string,
  provided?: string
): Promise<string> {
  if (provided?.trim()) return provided.trim();

  try {
    return await generateProjectTitle(description);
  } catch (error) {
    console.error("Project title generation failed:", error);
    return deriveTitle(description);
  }
}
