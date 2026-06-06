import { readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { SCOPE_CATEGORIES } from "@/types";

const PROMPT_VERSION =
  process.env.CONTRACTOR_SCOPE_ADD_PROMPT_VERSION ?? "contractor-scope-add-v1";
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string" },
    note: { type: "string" },
  },
  required: ["text", "note"],
} as const;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", `${PROMPT_VERSION}.md`);
  return readFile(promptPath, "utf8");
}

export async function parseContractorScopeAddition({
  category,
  description,
  projectTitle,
}: {
  category: string;
  description: string;
  projectTitle: string;
}) {
  const openai = getOpenAIClient();
  const systemPrompt = await loadSystemPrompt();
  const categoryLabel = SCOPE_CATEGORIES.includes(
    category as (typeof SCOPE_CATEGORIES)[number]
  )
    ? category
    : "other";

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          `Project: ${projectTitle}`,
          `Category: ${categoryLabel}`,
          `Contractor input: ${description}`,
        ].join("\n"),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "contractor_scope_addition",
        strict: true,
        schema: responseSchema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Could not generate scope item.");

  const parsed = JSON.parse(content) as { text: string; note: string };

  return {
    text: parsed.text.trim(),
    note: parsed.note.trim() || undefined,
  };
}
