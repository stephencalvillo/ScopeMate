import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getOwnedProject } from "@/lib/api/project-access";
import { isMissingTableError } from "@/lib/db/errors";
import { normalizeFollowUpQuestion } from "@/lib/follow-up/normalize";
import { createServiceClient } from "@/lib/db/supabase";
import type { FollowUpQuestion } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getOwnedProject(id);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("follow_up_questions")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      questions: ((data ?? []) as FollowUpQuestion[]).map(
        normalizeFollowUpQuestion
      ),
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ questions: [] });
    }
    return jsonError(error);
  }
}
