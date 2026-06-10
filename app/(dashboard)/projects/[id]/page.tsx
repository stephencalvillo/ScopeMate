import { ProjectDetailClientFallback } from "@/components/project/project-detail-client-fallback";
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
    share?: string;
    claim?: string;
  }>;
}) {
  const { id } = await params;
  const { generate, guest_token: guestToken, share, claim } =
    await searchParams;
  const project = await getAccessibleProjectWithScope(id, { guestToken });

  if (!project) {
    return (
      <ProjectDetailClientFallback
        projectId={id}
        autoGenerate={generate === "1"}
        openShareOnLoad={share === "1" || claim === "1"}
        guestToken={guestToken ?? null}
      />
    );
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
