import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { getAccessibleProjectWithScope } from "@/lib/db/projects";
import { getProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    generate?: string;
    tab?: string;
    guest_token?: string;
  }>;
}) {
  const { id } = await params;
  const { generate, guest_token: guestToken } = await searchParams;
  const project = await getAccessibleProjectWithScope(id, { guestToken });

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
      isGuestProject={project.homeowner_id === null}
    />
  );
}
