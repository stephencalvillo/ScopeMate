import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isMissingTableError } from "@/lib/db/errors";
import { dedupeFollowUpQuestionsForDisplay } from "@/lib/follow-up/dedupe-questions";
import { ensureFinishLevelMaterialsQuestion } from "@/lib/follow-up/finish-level";
import { normalizeFollowUpQuestion } from "@/lib/follow-up/normalize";
import { createServiceClient } from "@/lib/db/supabase";
import type { FollowUpQuestion } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getAccessibleProject(id);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const normalized = ((data ?? []) as FollowUpQuestion[]).map(
      normalizeFollowUpQuestion
    );
    const questions = await ensureFinishLevelMaterialsQuestion(id, normalized);

    return NextResponse.json({
      questions: dedupeFollowUpQuestionsForDisplay(questions),
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ questions: [] });
    }
    return jsonError(error);
  }
}
