import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isMissingTableError } from "@/lib/db/errors";
import { generateFollowUpQuestionsForProject } from "@/lib/ai/generate-follow-up";
import { dedupeFollowUpQuestionsForDisplay } from "@/lib/follow-up/dedupe-questions";
import { normalizeFollowUpQuestion } from "@/lib/follow-up/normalize";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id, { request });
    const questions = await generateFollowUpQuestionsForProject(project);

    return NextResponse.json({
      questions: dedupeFollowUpQuestionsForDisplay(
        questions.map(normalizeFollowUpQuestion)
      ),
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ questions: [] });
    }
    return jsonError(error);
  }
}
