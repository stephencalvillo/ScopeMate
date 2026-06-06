import { readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import {
  buildInputSnapshot,
  buildUserPrompt,
} from "@/lib/ai/build-user-prompt";
import {
  FOLLOW_UP_PROMPT_VERSION,
  MAX_FOLLOW_UP_QUESTIONS,
} from "@/lib/config/phase2";
import { dedupeFollowUpQuestions } from "@/lib/follow-up/dedupe-questions";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingTableError } from "@/lib/db/errors";
import type {
  AiFollowUpOutput,
  FollowUpQuestion,
  FollowUpQuestionCategory,
  Project,
  ScopeItem,
} from "@/types";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const followUpJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          question_type: {
            type: "string",
            enum: ["text", "choice", "dimension_estimate"],
          },
          category: {
            type: "string",
            enum: [
              "dimensions",
              "materials",
              "timeline",
              "permits",
              "trade_scope",
              "other",
            ],
          },
          choices: {
            type: ["array", "null"],
            items: { type: "string" },
          },
        },
        required: ["question", "question_type", "category", "choices"],
      },
    },
  },
  required: ["questions"],
} as const;

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(
    process.cwd(),
    "prompts",
    `${FOLLOW_UP_PROMPT_VERSION}.md`
  );
  return readFile(promptPath, "utf8");
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function buildFollowUpUserPrompt(
  project: Project,
  scopeItems: ScopeItem[],
  existingQuestions: FollowUpQuestion[]
): string {
  const scopeLines = scopeItems
    .map((item) => `- [${item.category}] ${item.text}`)
    .join("\n");

  const answeredLines = existingQuestions
    .filter((q) => q.answer && !q.skipped)
    .map((q) => `- Q: ${q.question}\n  A: ${q.answer}`)
    .join("\n");

  return [
    buildUserPrompt(project),
    "",
    "Current scope items (do not ask about topics already covered here):",
    scopeLines || "(none)",
    "",
    answeredLines ? `Already answered follow-ups:\n${answeredLines}` : "",
    "",
    `Suggest up to ${MAX_FOLLOW_UP_QUESTIONS} short follow-up questions for gaps only.`,
    "Return fewer questions if the scope is already detailed.",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeCategory(category: string): FollowUpQuestionCategory {
  const valid: FollowUpQuestionCategory[] = [
    "dimensions",
    "materials",
    "timeline",
    "permits",
    "trade_scope",
    "other",
  ];
  return valid.includes(category as FollowUpQuestionCategory)
    ? (category as FollowUpQuestionCategory)
    : "other";
}

export async function generateFollowUpQuestionsForProject(
  project: Project
): Promise<FollowUpQuestion[]> {
  const supabase = createServiceClient();

  const { data: scopeItems, error: scopeError } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (scopeError) throw scopeError;

  const { data: existingQuestions, error: existingError } = await supabase
    .from("follow_up_questions")
    .select("*")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  if (existingError) {
    if (isMissingTableError(existingError)) return [];
    throw existingError;
  }

  const unanswered = ((existingQuestions ?? []) as FollowUpQuestion[]).filter(
    (q) => !q.skipped && (q.answer === null || q.answer === "")
  );

  if (unanswered.length > 0) {
    return (existingQuestions ?? []) as FollowUpQuestion[];
  }

  if ((existingQuestions ?? []).length > 0) {
    return existingQuestions as FollowUpQuestion[];
  }

  const openai = getOpenAIClient();
  const systemPrompt = await loadSystemPrompt();
  const userPrompt = buildFollowUpUserPrompt(
    project,
    (scopeItems ?? []) as ScopeItem[],
    (existingQuestions ?? []) as FollowUpQuestion[]
  );

  const inputSnapshot = buildInputSnapshot({
    project,
    promptVersion: FOLLOW_UP_PROMPT_VERSION,
    model: MODEL,
    systemPrompt,
    userPrompt,
  });

  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "follow_up_output",
        strict: true,
        schema: followUpJsonSchema,
      },
    },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI did not return follow-up questions.");
  }

  const parsed = JSON.parse(content) as AiFollowUpOutput;
  const questions = dedupeFollowUpQuestions(
    parsed.questions,
    MAX_FOLLOW_UP_QUESTIONS
  );

  if (questions.length === 0) {
    return [];
  }

  const rows = questions.map((q, index) => ({
    project_id: project.id,
    question: q.question,
    question_type: q.question_type,
    category: normalizeCategory(q.category),
    choices: q.choices,
    sort_order: index,
    source: "ai" as const,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("follow_up_questions")
    .insert(rows)
    .select("*");

  if (insertError) {
    if (isMissingTableError(insertError)) return [];
    throw insertError;
  }

  await supabase.from("ai_runs").insert({
    project_id: project.id,
    prompt_version: FOLLOW_UP_PROMPT_VERSION,
    model: MODEL,
    input_snapshot: inputSnapshot,
    output_snapshot: {
      parsed,
      raw_content: content,
      finish_reason: response.choices[0]?.finish_reason ?? null,
    },
  });

  return (inserted ?? []) as FollowUpQuestion[];
}

export async function getAnsweredFollowUps(
  projectId: string
): Promise<FollowUpQuestion[]> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("project_id", projectId)
      .eq("skipped", false)
      .not("answer", "is", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as FollowUpQuestion[];
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
}
