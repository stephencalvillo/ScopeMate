import { NextResponse } from "next/server";
import { formatProjectLocation } from "@/lib/location/parse";
import { jsonError } from "@/lib/api/response";
import { getProjectByShareToken } from "@/lib/db/projects";
import { createServiceClient } from "@/lib/db/supabase";
import { loadProjectReadinessSummary } from "@/lib/project/readiness-summary";
import { createSignedPhotoUrl } from "@/lib/storage/photos";
import type { ProjectPhoto } from "@/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const project = await getProjectByShareToken(token);

    if (!project) {
      return NextResponse.json(
        { error: "This share link is not available." },
        { status: 404 }
      );
    }

    const supabase = createServiceClient();
    const { data: photoRows, error: photoError } = await supabase
      .from("project_photos")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true });

    if (photoError) throw photoError;

    const photos = await Promise.all(
      ((photoRows ?? []) as ProjectPhoto[]).map(async (photo) => ({
        id: photo.id,
        file_name: photo.file_name,
        url: await createSignedPhotoUrl(photo.storage_path),
        photo_type:
          "photo_type" in photo
            ? ((photo as ProjectPhoto & { photo_type?: string }).photo_type ??
              "current")
            : "current",
      }))
    );
    const readiness = await loadProjectReadinessSummary(
      project.id,
      project,
      photos
    );
    return NextResponse.json({
      title: project.title,
      project_type: project.project_type,
      location: formatProjectLocation(project),
      city: project.city,
      zip: project.zip,
      ai_summary: project.ai_summary,
      scope_items: project.scope_items,
      photos,
      readiness,
    });
  } catch (error) {
    return jsonError(error);
  }
}
