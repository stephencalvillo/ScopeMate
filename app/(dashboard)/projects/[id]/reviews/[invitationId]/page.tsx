import { notFound } from "next/navigation";
import { ReviewedScopeDetail } from "@/components/review/reviewed-scope-detail";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { getReviewedScopeDetailForProject } from "@/lib/contractor/reviewed-scopes";
import { getProjectForUser } from "@/lib/db/projects";

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

  return (
    <ReviewedScopeDetail
      projectId={project.id}
      projectTitle={project.title}
      scope={detail}
      suggestions={detail.suggestions}
      currentSummary={project.ai_summary}
      currentScopeItems={project.scope_items}
    />
  );
}
