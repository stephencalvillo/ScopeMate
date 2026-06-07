import { notFound } from "next/navigation";
import { ReviewedScopeDetail } from "@/components/review/reviewed-scope-detail";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { getReviewedScopeDetailForProject } from "@/lib/contractor/reviewed-scopes";
import { getSubmittedEstimateForInvitation } from "@/lib/estimates/estimates";
import { getProjectForUser } from "@/lib/db/projects";
import { listProjectPhotosWithUrls } from "@/lib/storage/photos";

export default async function ReviewedScopePage({
  params,
}: {
  params: Promise<{ id: string; invitationId: string }>;
}) {
  const { id, invitationId } = await params;
  const user = await ensureUserRecord();
  const project = await getProjectForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const detail = await getReviewedScopeDetailForProject({
    projectId: id,
    invitationId,
  });

  if (!detail) {
    notFound();
  }

  const estimate = await getSubmittedEstimateForInvitation({
    projectId: id,
    invitationId,
  });
  const photos = await listProjectPhotosWithUrls(id).then((rows) =>
    rows.map((photo) => ({
      id: photo.id,
      file_name: photo.file_name,
      url: photo.url,
    }))
  );

  return (
    <ReviewedScopeDetail
      projectId={project.id}
      project={project}
      scope={detail}
      suggestions={detail.suggestions}
      currentSummary={project.ai_summary}
      currentScopeItems={project.scope_items}
      estimate={estimate}
      photos={photos}
    />
  );
}
