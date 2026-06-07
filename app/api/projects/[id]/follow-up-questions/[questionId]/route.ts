import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { followUpAnswerSchema } from "@/lib/validators/follow-up";
import { normalizeFollowUpQuestion } from "@/lib/follow-up/normalize";
import { syncFollowUpAnswerToScope } from "@/lib/follow-up/to-scope-item";
import type { FollowUpQuestion } from "@/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await context.params;
    const project = await getAccessibleProject(id);

    const body = followUpAnswerSchema.parse(await request.json());
    const supabase = createServiceClient();

    const { data: existing, error: existingError } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("id", questionId)
      .eq("project_id", id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const update = body.skipped
      ? {
          skipped: true,
          answer: null,
          answered_at: new Date().toISOString(),
        }
      : {
          skipped: false,
          answer: body.answer ?? null,
          answered_at: new Date().toISOString(),
        };

    const { data, error } = await supabase
      .from("follow_up_questions")
      .update(update)
      .eq("id", questionId)
      .select("*")
      .single();

    if (error) throw error;

    const question = normalizeFollowUpQuestion(data as FollowUpQuestion);
    const scopeItem = await syncFollowUpAnswerToScope(
      id,
      question,
      project.project_type
    );

    return NextResponse.json({
      question,
      scope_item: scopeItem,
    });
  } catch (error) {
    return jsonError(error);
  }
}
