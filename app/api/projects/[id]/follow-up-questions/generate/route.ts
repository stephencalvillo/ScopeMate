import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { generateFollowUpQuestionsForProject } from "@/lib/ai/generate-follow-up";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getOwnedProject(id);
    const questions = await generateFollowUpQuestionsForProject(project);
    return NextResponse.json({ questions });
  } catch (error) {
    return jsonError(error);
  }
}
