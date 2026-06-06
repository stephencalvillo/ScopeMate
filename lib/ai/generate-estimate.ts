import { readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import {
  buildInputSnapshot,
  buildUserPrompt,
} from "@/lib/ai/build-user-prompt";
import { formatProjectLocation } from "@/lib/location/parse";
import { replaceEstimateLineItems } from "@/lib/estimates/estimates";
import type { EstimateLineItemInput } from "@/lib/estimates/estimates";
import { normalizeEstimateRangeStorage } from "@/lib/estimates/money";
import { createServiceClient } from "@/lib/db/supabase";
import type {
  AiRunInputSnapshot,
  ContractorReview,
  ProjectWithScope,
  ScopeItem,
} from "@/types";

const PROMPT_VERSION = process.env.ESTIMATE_PROMPT_VERSION ?? "estimate-v1";
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const estimateJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    line_items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          description: { type: "string" },
          labor_cost: { type: "number" },
          material_cost: { type: "number" },
          scope_item_id: { type: ["string", "null"] },
        },
        required: ["description", "labor_cost", "material_cost", "scope_item_id"],
      },
    },
  },
  required: ["line_items"],
} as const;

type AiEstimateOutput = {
  line_items: Array<{
    description: string;
    labor_cost: number;
    material_cost: number;
    scope_item_id: string | null;
  }>;
};

async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(process.cwd(), "prompts", `${PROMPT_VERSION}.md`);
  return readFile(promptPath, "utf8");
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function buildEstimateUserPrompt(project: ProjectWithScope): string {
  const scopeLines = project.scope_items
    .map((item) => `- id:${item.id} [${item.category}] ${item.text}`)
    .join("\n");
  const location = formatProjectLocation(project);
  const zip = project.zip?.trim();
  const marketLocation = zip ? `${location} (ZIP ${zip})` : location;

  return [
    buildUserPrompt(project),
    "",
    "Scope items:",
    scopeLines || "(none)",
    "",
    `Generate draft estimate line items for this scope.`,
    `Use typical ${marketLocation} market pricing for each line item.`,
    "For each line, set labor_cost to the low end of a realistic installed price range and material_cost to the high end.",
  ].join("\n");
}

function fallbackLineItemsFromScope(scopeItems: ScopeItem[]): EstimateLineItemInput[] {
  if (scopeItems.length === 0) {
    return [
      {
        description: "General construction labor and materials",
        labor_cost: 0,
        material_cost: 0,
        scope_item_id: null,
      },
    ];
  }

  return scopeItems.map((item) => ({
    description: item.text,
    labor_cost: 0,
    material_cost: 0,
    scope_item_id: item.id,
  }));
}

function sanitizeAiLineItems(
  output: AiEstimateOutput,
  scopeItems: ScopeItem[]
): EstimateLineItemInput[] {
  const scopeIds = new Set(scopeItems.map((item) => item.id));

  return output.line_items
    .filter((item) => item.description.trim().length > 0)
    .map((item) => {
      const { labor_cost, material_cost } = normalizeEstimateRangeStorage(
        Math.max(0, Number(item.labor_cost) || 0),
        Math.max(0, Number(item.material_cost) || 0)
      );

      return {
        description: item.description.trim(),
        labor_cost,
        material_cost,
        scope_item_id:
          item.scope_item_id && scopeIds.has(item.scope_item_id)
            ? item.scope_item_id
            : null,
      };
    });
}

export async function generateDraftEstimateForReview({
  review,
  project,
}: {
  review: ContractorReview;
  project: ProjectWithScope;
}) {
  const userPrompt = buildEstimateUserPrompt(project);
  const systemPrompt = await loadSystemPrompt();
  const inputSnapshot = buildInputSnapshot({
    project,
    promptVersion: PROMPT_VERSION,
    model: MODEL,
    systemPrompt,
    userPrompt,
  });

  let lineItems: EstimateLineItemInput[] = fallbackLineItemsFromScope(
    project.scope_items
  );

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "estimate_output",
          strict: true,
          schema: estimateJsonSchema,
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content) as AiEstimateOutput;
      const sanitized = sanitizeAiLineItems(parsed, project.scope_items);
      if (sanitized.length > 0) {
        lineItems = sanitized;
      }
    }

    const supabase = createServiceClient();
    await supabase.from("ai_runs").insert({
      project_id: project.id,
      prompt_version: PROMPT_VERSION,
      model: MODEL,
      input_snapshot: inputSnapshot satisfies AiRunInputSnapshot,
      output_snapshot: {
        line_items: lineItems,
        finish_reason: response.choices[0]?.finish_reason ?? null,
      },
    });
  } catch {
    lineItems = fallbackLineItemsFromScope(project.scope_items);
  }

  return replaceEstimateLineItems({
    review,
    lineItems,
  });
}
