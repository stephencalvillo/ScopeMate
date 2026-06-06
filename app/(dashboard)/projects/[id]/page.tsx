import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { getProjectForUser } from "@/lib/db/projects";
import { getProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { generate } = await searchParams;
  const user = await ensureUserRecord();
  const project = await getProjectForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const acceptedProposal =
    project.accepted_estimate_id != null
      ? await getProjectAcceptedProposalSummary(project.id)
      : null;

  return (
    <ProjectDetailView
      project={project}
      autoGenerate={generate === "1"}
      acceptedProposal={acceptedProposal}
    />
  );
}
