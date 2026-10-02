import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { deleteProjectMockup } from "@/lib/storage/mockups";
import type { ProjectMockup } from "@/types";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; mockupId: string }> }
) {
  try {
    const { id, mockupId } = await context.params;
    await getAccessibleProject(id, { request });

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("project_mockups")
      .select("*")
      .eq("id", mockupId)
      .eq("project_id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Mock-up not found." }, { status: 404 });
    }

    await deleteProjectMockup(data as ProjectMockup);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
