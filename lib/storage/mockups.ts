import { PHOTOS_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from "@/lib/config/phase2";
import { createServiceClient } from "@/lib/db/supabase";
import { getPhotoExtension } from "@/lib/storage/photos";
import type { ProjectMockup } from "@/types";

function buildMockupStoragePath(
  homeownerId: string,
  projectId: string,
  mockupId: string,
  mimeType: string
) {
  const ext = getPhotoExtension(mimeType);
  return `${homeownerId}/${projectId}/mockups/${mockupId}.${ext}`;
}

async function createSignedMockupUrl(storagePath: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not open the mock-up.");
  return data.signedUrl;
}

export async function uploadProjectMockup({
  homeownerId,
  projectId,
  file,
  fileName,
  mimeType,
  fileSize,
  prompt,
  sortOrder,
}: {
  homeownerId: string;
  projectId: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
  prompt: string;
  sortOrder: number;
}): Promise<ProjectMockup & { url: string }> {
  const supabase = createServiceClient();
  const mockupId = crypto.randomUUID();
  const storagePath = buildMockupStoragePath(
    homeownerId,
    projectId,
    mockupId,
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
    .from("project_mockups")
    .insert({
      id: mockupId,
      project_id: projectId,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      file_size: fileSize,
      prompt,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    throw insertError;
  }

  const url = await createSignedMockupUrl(storagePath);
  return { ...(data as ProjectMockup), url };
}

export async function listProjectMockupsWithUrls(
  projectId: string
): Promise<(ProjectMockup & { url: string })[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("project_mockups")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const mockups = (data ?? []) as ProjectMockup[];
  return Promise.all(
    mockups.map(async (mockup) => ({
      ...mockup,
      url: await createSignedMockupUrl(mockup.storage_path),
    }))
  );
}

export async function deleteProjectMockup(mockup: ProjectMockup): Promise<void> {
  const supabase = createServiceClient();
  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([mockup.storage_path]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("project_mockups")
    .delete()
    .eq("id", mockup.id);

  if (deleteError) throw deleteError;
}

export async function downloadProjectPhotoBytes(storagePath: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw error ?? new Error("Could not read the project photo.");
  }

  return Buffer.from(await data.arrayBuffer());
}
