import { NextResponse } from "next/server";
import {
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_PROJECT,
} from "@/lib/config/phase2";
import { jsonError } from "@/lib/api/response";
import { getAccessibleProject } from "@/lib/api/project-access";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import {
  isAllowedPhotoMimeType,
  listProjectPhotosWithUrls,
  uploadProjectPhoto,
} from "@/lib/storage/photos";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await getAccessibleProject(id, { request });
    const photos = await listProjectPhotosWithUrls(id);
    return NextResponse.json({ photos });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ photos: [] });
    }
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await getAccessibleProject(id, { request });
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose a photo to upload." },
        { status: 400 }
      );
    }

    if (!isAllowedPhotoMimeType(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Photo must be 10 MB or smaller." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { count, error: countError } = await supabase
      .from("project_photos")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    if (countError) throw countError;

    if ((count ?? 0) >= MAX_PHOTOS_PER_PROJECT) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_PHOTOS_PER_PROJECT} photos.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const photo = await uploadProjectPhoto({
      homeownerId: project.homeowner_id ?? `guest-${id}`,
      projectId: id,
      file: buffer,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      sortOrder: count ?? 0,
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        {
          error:
            "Photo uploads are not set up yet. Run the Phase 2 database migration in Supabase.",
        },
        { status: 503 }
      );
    }
    return jsonError(error);
  }
}
