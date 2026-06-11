import { formatProjectLocation } from "@/lib/location/parse";
import type {
  AiRunInputSnapshot,
  FollowUpQuestion,
  Project,
  ScopeItem,
} from "@/types";

export function buildUserPrompt(
  project: Project,
  options?: {
    followUps?: FollowUpQuestion[];
    additionalNotes?: string;
    updatedSummary?: string;
    existingScopeItems?: ScopeItem[];
  }
): string {
  const followUps = options?.followUps;
  const lines = [
    `Project title: ${project.title}`,
    `Location: ${formatProjectLocation(project)}`,
    `Homeowner description:`,
    project.original_description,
  ];

  const answered = (followUps ?? []).filter(
    (q) => !q.skipped && q.answer !== null && q.answer !== ""
  );

  if (answered.length > 0) {
    lines.push("", "Additional details from follow-up questions:");
    for (const q of answered) {
      lines.push(`- ${q.question}: ${q.answer}`);
    }
  }

  const existingScopeItems = options?.existingScopeItems ?? [];
  if (existingScopeItems.length > 0) {
    lines.push("", "Current scope items:");
    for (const item of existingScopeItems) {
      lines.push(`- [${item.category}] ${item.text}`);
    }
  }

  if (options?.updatedSummary) {
    lines.push(
      "",
      "Updated project summary from the homeowner:",
      options.updatedSummary,
      "",
      "Regenerate the scope items and summary to reflect this updated project description. Keep existing work that still applies unless it conflicts with the updated summary."
    );
  } else if (options?.additionalNotes) {
    lines.push(
      "",
      "Homeowner wants to add or change:",
      options.additionalNotes,
      "",
      "Update the scope to include these details. Keep existing work that still applies."
    );
  }

  return lines.join("\n");
}

export function buildInputSnapshot({
  project,
  promptVersion,
  model,
  systemPrompt,
  userPrompt,
}: {
  project: Project;
  promptVersion: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): AiRunInputSnapshot {
  return {
    prompt_version: promptVersion,
    model,
    user_prompt: userPrompt,
    system_prompt: systemPrompt,
    project: {
      id: project.id,
      title: project.title,
      project_type: project.project_type,
      location: formatProjectLocation(project),
      city: project.city,
      zip: project.zip,
      original_description: project.original_description,
    },
  };
}
