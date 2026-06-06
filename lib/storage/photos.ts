import {
  ALLOWED_PHOTO_MIME_TYPES,
  PHOTOS_BUCKET,
  SIGNED_URL_EXPIRY_SECONDS,
} from "@/lib/config/phase2";
import { createServiceClient } from "@/lib/db/supabase";
import type { ProjectPhoto } from "@/types";

export function getPhotoExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error("Unsupported image type.");
  }
}

export function isAllowedPhotoMimeType(
  mimeType: string
): mimeType is (typeof ALLOWED_PHOTO_MIME_TYPES)[number] {
  return (ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function buildPhotoStoragePath(
  homeownerId: string,
  projectId: string,
  photoId: string,
  mimeType: string
): string {
  const ext = getPhotoExtension(mimeType);
  return `${homeownerId}/${projectId}/${photoId}.${ext}`;
}

export async function createSignedPhotoUrl(
  storagePath: string,
  expiresIn = SIGNED_URL_EXPIRY_SECONDS
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not create photo URL.");
  return data.signedUrl;
}

export async function uploadProjectPhoto({
  homeownerId,
  projectId,
  file,
  fileName,
  mimeType,
  fileSize,
  sortOrder,
}: {
  homeownerId: string;
  projectId: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
}): Promise<ProjectPhoto & { url: string }> {
  const supabase = createServiceClient();
  const photoId = crypto.randomUUID();
  const storagePath = buildPhotoStoragePath(
    homeownerId,
    projectId,
    photoId,
    mimeType
  );

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("project_photos")
    .insert({
      id: photoId,
      project_id: projectId,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      file_size: fileSize,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    throw insertError;
  }

  const url = await createSignedPhotoUrl(storagePath);
  return { ...(data as ProjectPhoto), url };
}

export async function deleteProjectPhoto(photo: ProjectPhoto): Promise<void> {
  const supabase = createServiceClient();

  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([photo.storage_path]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("project_photos")
    .delete()
    .eq("id", photo.id);

  if (deleteError) throw deleteError;
}

export async function listProjectPhotosWithUrls(
  projectId: string
): Promise<(ProjectPhoto & { url: string })[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("project_photos")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const photos = (data ?? []) as ProjectPhoto[];
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      url: await createSignedPhotoUrl(photo.storage_path),
    }))
  );
}
