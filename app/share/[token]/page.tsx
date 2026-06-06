import { PublicShell } from "@/components/layout/public-shell";
import { ShareExpiredNotice } from "@/components/share/share-expired-notice";
import { SharedProjectView } from "@/components/share/shared-project-view";
import { getProjectByShareToken } from "@/lib/db/projects";
import { listProjectPhotosWithUrls } from "@/lib/storage/photos";

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await getProjectByShareToken(token);

  const photos = project
    ? (await listProjectPhotosWithUrls(project.id)).map((photo) => ({
        id: photo.id,
        file_name: photo.file_name,
        url: photo.url,
      }))
    : [];

  return (
    <PublicShell>
      {project ? (
        <SharedProjectView project={project} photos={photos} />
      ) : (
        <ShareExpiredNotice />
      )}
    </PublicShell>
  );
}
