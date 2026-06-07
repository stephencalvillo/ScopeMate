import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const titleSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
  },
  required: ["title"],
} as const;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function generateProjectTitle(description: string): Promise<string> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You name homeowner renovation and construction projects. Return a short, specific project title based on the description. Use 2-5 words in title case. Examples: Kitchen remodel, Roof replacement, Back patio addition, Primary bath renovation. Do not copy the full description, add quotes, or end with punctuation.",
      },
      {
        role: "user",
        content: description.trim(),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "project_title",
        strict: true,
        schema: titleSchema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Could not generate project title.");

  const parsed = JSON.parse(content) as { title: string };
  const title = normalizeTitle(parsed.title);

  if (!title) {
    throw new Error("Could not generate project title.");
  }

  return title;
}
