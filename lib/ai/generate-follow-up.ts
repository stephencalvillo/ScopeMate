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
import {
  buildInjectedContextQuestions,
  describeInjectedTopics,
} from "@/lib/follow-up/context-signals";
import { dedupeFollowUpQuestions } from "@/lib/follow-up/dedupe-questions";
import {
  buildFinishLevelMaterialsQuestion,
  ensureFinishLevelMaterialsQuestion,
} from "@/lib/follow-up/finish-level";
import {
  getMissingInjectedQuestions,
  hasAiGapFollowUps,
  needsFollowUpBackfill,
} from "@/lib/follow-up/missing-questions";
import { createServiceClient } from "@/lib/db/supabase";
import { isMissingTableError } from "@/lib/db/errors";
import type {
  AiFollowUpOutput,
  AiFollowUpQuestion,
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
  existingQuestions: FollowUpQuestion[],
  options?: {
    aiQuestionLimit: number;
    injectedTopics: string[];
  }
): string {
  const scopeLines = scopeItems
    .map((item) => `- [${item.category}] ${item.text}`)
    .join("\n");

  const answeredLines = existingQuestions
    .filter((q) => q.answer && !q.skipped)
    .map((q) => `- Q: ${q.question}\n  A: ${q.answer}`)
    .join("\n");

  const injectedLines =
    options?.injectedTopics.map((topic) => `- ${topic}`) ?? [];

  return [
    buildUserPrompt(project),
    "",
    "Current scope items (do not ask about topics already covered here):",
    scopeLines || "(none)",
    "",
    answeredLines ? `Already answered follow-ups:\n${answeredLines}` : "",
    injectedLines.length > 0
      ? `Already planned follow-up topics (do not duplicate):\n${injectedLines.join("\n")}`
      : "",
    "",
    `Suggest up to ${options?.aiQuestionLimit ?? MAX_FOLLOW_UP_QUESTIONS} short follow-up questions for gaps only.`,
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

function buildFollowUpContext(project: Project, scopeItems: ScopeItem[]) {
  return {
    description: project.original_description,
    scopeItems,
    projectType: project.project_type,
  };
}

async function insertFollowUpQuestions(
  projectId: string,
  questions: AiFollowUpQuestion[],
  startSortOrder: number
): Promise<FollowUpQuestion[]> {
  if (questions.length === 0) return [];

  const supabase = createServiceClient();
  const rows = questions.map((question, index) => ({
    project_id: projectId,
    question: question.question,
    question_type: question.question_type,
    category: normalizeCategory(question.category),
    choices: question.choices,
    sort_order: startSortOrder + index,
    source: "ai" as const,
  }));

  const { data, error } = await supabase
    .from("follow_up_questions")
    .insert(rows)
    .select("*");

  if (error) throw error;
  return (data ?? []) as FollowUpQuestion[];
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

  const activeScopeItems = (scopeItems ?? []) as ScopeItem[];
  const followUpContext = buildFollowUpContext(project, activeScopeItems);
  let questions = await ensureFinishLevelMaterialsQuestion(
    project.id,
    (existingQuestions ?? []) as FollowUpQuestion[]
  );

  if (!needsFollowUpBackfill(questions, followUpContext)) {
    return questions;
  }

  const missingInjected = getMissingInjectedQuestions(questions, followUpContext);
  const injectedTopics = describeInjectedTopics(
    buildInjectedContextQuestions(followUpContext)
  );

  let insertedInjected: FollowUpQuestion[] = [];
  if (missingInjected.length > 0) {
    try {
      insertedInjected = await insertFollowUpQuestions(
        project.id,
        missingInjected,
        questions.length
      );
      questions = [...questions, ...insertedInjected];
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
    }
  }

  const remainingSlots = Math.max(MAX_FOLLOW_UP_QUESTIONS - questions.length, 0);
  const shouldGenerateAi =
    remainingSlots > 0 && !hasAiGapFollowUps(questions);

  if (!shouldGenerateAi) {
    return questions;
  }

  try {
    const openai = getOpenAIClient();
    const systemPrompt = await loadSystemPrompt();
    const userPrompt = buildFollowUpUserPrompt(
      project,
      activeScopeItems,
      questions,
      {
        aiQuestionLimit: remainingSlots,
        injectedTopics,
      }
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
      return questions;
    }

    const parsed = JSON.parse(content) as AiFollowUpOutput;
    const existingCategories = new Set(
      questions.map((question) => question.category)
    );
    const aiQuestions = dedupeFollowUpQuestions(
      parsed.questions.filter(
        (question) =>
          question.category !== "materials" &&
          !existingCategories.has(question.category)
      ),
      remainingSlots
    );

    if (aiQuestions.length === 0) {
      return questions;
    }

    const insertedAi = await insertFollowUpQuestions(
      project.id,
      aiQuestions,
      questions.length
    );

    await supabase.from("ai_runs").insert({
      project_id: project.id,
      prompt_version: FOLLOW_UP_PROMPT_VERSION,
      model: MODEL,
      input_snapshot: inputSnapshot,
      output_snapshot: {
        parsed,
        raw_content: content,
        finish_reason: response.choices[0]?.finish_reason ?? null,
        injected_questions: missingInjected,
      },
    });

    return [...questions, ...insertedAi];
  } catch (error) {
    console.error("Follow-up AI generation failed:", error);
    return questions;
  }
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
