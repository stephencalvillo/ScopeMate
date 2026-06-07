import { NextResponse } from "next/server";
import { checkScopeGenerationLimit } from "@/lib/api/rate-limit";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { generateFollowUpQuestionsForProject } from "@/lib/ai/generate-follow-up";
import { generateScopeForProject } from "@/lib/ai/generate-scope";
import type { Project } from "@/types";

import { generateScopeSchema } from "@/lib/validators/scope";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id);
    const rateLimitKey = project.homeowner_id ?? `guest:${project.id}`;

    if (!checkScopeGenerationLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          error:
            "You have reached the limit for scope generation. Try again in an hour.",
        },
        { status: 429 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const { additional_notes: additionalNotes } =
      generateScopeSchema.parse(rawBody);

    const result = await generateScopeForProject(project, { additionalNotes });

    const updatedProject: Project = {
      ...project,
      ai_summary: result.ai_summary,
      project_type: result.project_type,
      status: "scope_ready",
    };

    if (result.suggested_title) {
      updatedProject.title = result.suggested_title;
    }

    let followUpQuestions: Awaited<
      ReturnType<typeof generateFollowUpQuestionsForProject>
    > = [];

    try {
      followUpQuestions =
        await generateFollowUpQuestionsForProject(updatedProject);
    } catch (followUpError) {
      console.error("Follow-up question generation failed:", followUpError);
    }

    return NextResponse.json({
      ...result,
      follow_up_questions: followUpQuestions,
    });
  } catch (error) {
    return jsonError(error);
  }
}
