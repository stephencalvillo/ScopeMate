import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { createServiceClient } from "@/lib/db/supabase";
import { deleteProjectPhoto } from "@/lib/storage/photos";
import type { ProjectPhoto } from "@/types";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { id, photoId } = await context.params;
    await getAccessibleProject(id);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("project_photos")
      .select("*")
      .eq("id", photoId)
      .eq("project_id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    await deleteProjectPhoto(data as ProjectPhoto);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
