import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isMissingColumnError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id, { request });

    if (project.creation_completed_at) {
      return NextResponse.json({
        creation_completed_at: project.creation_completed_at,
      });
    }

    const now = new Date().toISOString();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .update({ creation_completed_at: now })
      .eq("id", id)
      .select("creation_completed_at")
      .single();

    if (error && isMissingColumnError(error)) {
      return NextResponse.json({ creation_completed_at: null });
    }

    if (error) throw error;

    return NextResponse.json({
      creation_completed_at: data?.creation_completed_at ?? now,
    });
  } catch (error) {
    return jsonError(error);
  }
}
