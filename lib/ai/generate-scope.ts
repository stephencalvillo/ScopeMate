import { readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import {
  buildInputSnapshot,
  buildUserPrompt,
} from "@/lib/ai/build-user-prompt";
import { getAnsweredFollowUps } from "@/lib/ai/generate-follow-up";
import { normalizeAiScopeItems } from "@/lib/ai/normalize-scope-items";
import { createServiceClient } from "@/lib/db/supabase";
import type {
  AiRunOutputSnapshot,
  AiScopeOutput,
  GenerateScopeResult,
  Project,
  ScopeItem,
} from "@/types";

const PROMPT_VERSION = process.env.SCOPE_PROMPT_VERSION ?? "scope-v1";
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const scopeJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ai_summary: { type: "string" },
    project_type: { type: "string" },
    suggested_title: { type: "string" },
    scope_items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "string" },
          text: { type: "string" },
          priority: {
            type: "string",
            enum: ["required", "recommended", "optional"],
          },
          needs_verification: { type: "boolean" },
        },
        required: ["category", "text", "priority", "needs_verification"],
      },
    },
  },
  required: ["ai_summary", "project_type", "suggested_title", "scope_items"],
} as const;

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", `${PROMPT_VERSION}.md`);
  return readFile(promptPath, "utf8");
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function isGenericTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  return (
    normalized === "" ||
    normalized === "new project" ||
    normalized === "untitled project" ||
    normalized === "my project"
  );
}

export async function generateScopeForProject(
  project: Project,
  options?: { additionalNotes?: string }
): Promise<GenerateScopeResult> {
  const openai = getOpenAIClient();
  const systemPrompt = await loadSystemPrompt();
  const supabase = createServiceClient();

  const followUps = await getAnsweredFollowUps(project.id);

  const { data: existingItems, error: existingItemsError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (existingItemsError) throw existingItemsError;

  const activeScopeItems = (existingItems ?? []) as ScopeItem[];

  const userPrompt = buildUserPrompt(project, {
    followUps,
    additionalNotes: options?.additionalNotes,
    existingScopeItems:
      options?.additionalNotes && activeScopeItems.length > 0
        ? activeScopeItems
        : undefined,
  });

  const inputSnapshot = buildInputSnapshot({
    project,
    promptVersion: PROMPT_VERSION,
    model: MODEL,
    systemPrompt,
    userPrompt,
  });

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "scope_output",
        strict: true,
        schema: scopeJsonSchema,
      },
    },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI did not return a scope.");
  }

  const parsed = JSON.parse(content) as AiScopeOutput;
  parsed.scope_items = normalizeAiScopeItems(parsed.scope_items);

  const outputSnapshot: AiRunOutputSnapshot = {
    parsed,
    raw_content: content,
    finish_reason: response.choices[0]?.finish_reason ?? null,
  };

  const { data: aiRun, error: aiRunError } = await supabase
    .from("ai_runs")
    .insert({
      project_id: project.id,
      prompt_version: PROMPT_VERSION,
      model: MODEL,
      input_snapshot: inputSnapshot,
      output_snapshot: outputSnapshot,
    })
    .select("id")
    .single();

  if (aiRunError) throw aiRunError;

  const { data: allExistingItems, error: existingError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id);

  if (existingError) throw existingError;

  const homeownerItems = ((allExistingItems ?? []) as ScopeItem[]).filter(
    (item) => item.source === "homeowner" && item.status === "active"
  );

  const removedAiIds = ((allExistingItems ?? []) as ScopeItem[])
    .filter((item) => item.source === "ai" && item.status === "removed")
    .map((item) => item.id);

  if (removedAiIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("scope_items")
      .delete()
      .in("id", removedAiIds);

    if (deleteError) throw deleteError;
  }

  const { error: removeAiError } = await supabase
    .from("scope_items")
    .delete()
    .eq("project_id", project.id)
    .eq("source", "ai")
    .eq("status", "active");

  if (removeAiError) throw removeAiError;

  const startOrder = homeownerItems.length;
  const aiRows = parsed.scope_items.map((item, index) => ({
    project_id: project.id,
    category: item.category.toLowerCase(),
    text: item.text,
    source: "ai" as const,
    priority: item.priority,
    status: "active" as const,
    sort_order: startOrder + index,
    needs_verification: item.needs_verification,
  }));

  let insertedItems: ScopeItem[] = [];

  if (aiRows.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("scope_items")
      .insert(aiRows)
      .select("*");

    if (insertError) throw insertError;
    insertedItems = (inserted ?? []) as ScopeItem[];
  }

  const projectUpdate: Record<string, string> = {
    ai_summary: parsed.ai_summary,
    project_type: parsed.project_type,
    status: "scope_ready",
  };

  if (parsed.suggested_title && isGenericTitle(project.title)) {
    projectUpdate.title = parsed.suggested_title;
  }

  const { error: projectError } = await supabase
    .from("projects")
    .update(projectUpdate)
    .eq("id", project.id);

  if (projectError) throw projectError;

  return {
    ai_run_id: aiRun.id,
    prompt_version: PROMPT_VERSION,
    input_snapshot: inputSnapshot,
    output_snapshot: outputSnapshot,
    ai_summary: parsed.ai_summary,
    project_type: parsed.project_type,
    suggested_title: parsed.suggested_title,
    scope_items: [...homeownerItems, ...insertedItems].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  };
}
