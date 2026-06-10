import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { generateFollowUpQuestionsForProject } from "@/lib/ai/generate-follow-up";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id, { request });
    const questions = await generateFollowUpQuestionsForProject(project);
    return NextResponse.json({ questions });
  } catch (error) {
    return jsonError(error);
  }
}
