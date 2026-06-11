import { redirect } from "next/navigation";
import { ProjectDetailClientFallback } from "@/components/project/project-detail-client-fallback";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { ensureUserRecord } from "@/lib/auth/clerk";
import {
  getContractorProfile,
  isContractorProfileReady,
} from "@/lib/contractor/profile";
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
  const { generate, guest_token: guestToken, share, claim, tab } =
    await searchParams;
  const project = await getAccessibleProjectWithScope(id, { guestToken });

  if (
    project &&
    project.creator_role === "contractor" &&
    project.homeowner_id === null
  ) {
    try {
      const user = await ensureUserRecord();
      const profile = await getContractorProfile(user.id);

      if (
        isContractorProfileReady(profile) &&
        project.created_by_user_id === user.id
      ) {
        const redirectParams = new URLSearchParams();
        if (generate === "1") redirectParams.set("generate", "1");
        if (tab) redirectParams.set("tab", tab);
        if (share === "1") redirectParams.set("share", "1");
        if (claim === "1") redirectParams.set("claim", "1");
        if (guestToken) redirectParams.set("guest_token", guestToken);

        const query = redirectParams.toString();
        redirect(
          query
            ? `/contractor/projects/${id}?${query}`
            : `/contractor/projects/${id}`
        );
      }
    } catch {
      // Guest or incomplete contractor setup can keep using the public project route.
    }
  }

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
