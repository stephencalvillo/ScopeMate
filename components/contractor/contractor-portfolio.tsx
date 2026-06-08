import Link from "next/link";
import { ProjectCard } from "@/components/project/project-card";
import { ContractorReviewsList } from "@/components/contractor/contractor-reviews-list";
import { ContractorBidHistorySection } from "@/components/contractor/contractor-bid-history-section";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ContractorReviewListItem } from "@/lib/contractor/review-list-item";
import type { Project } from "@/types";

function AcceptedProjectsGrid({
  projects,
}: {
  projects: ContractorReviewListItem[];
}) {
  if (projects.length === 0) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No active projects</p>
        <p className="text-sm text-[var(--muted)]">
          When a homeowner accepts your proposal, the project will show up here.
        </p>
      </SectionSurface>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((item) => (
        <ProjectCard
          key={item.invitation.id}
          project={item.project}
          href={item.review_url}
          showProjectType={false}
          aiSummaryOnly
          proposalRange={item.proposal_range}
        />
      ))}
    </div>
  );
}

function ClientProjectsGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No client projects yet</p>
        <p className="text-sm text-[var(--muted)]">
          Start a scope from Get Started to build a project you can estimate and
          share with your client.
        </p>
        <Link
          href="/homeowners/signup"
          className="inline-block text-sm font-medium text-neutral-900 hover:underline"
        >
          Start a client project
        </Link>
      </SectionSurface>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          href={`/projects/${project.id}`}
          showProjectType={false}
          aiSummaryOnly
        />
      ))}
    </div>
  );
}

export function ContractorPortfolio({
  clientProjects,
  accepted,
  inReview,
  history,
}: {
  clientProjects: Project[];
  accepted: ContractorReviewListItem[];
  inReview: ContractorReviewListItem[];
  history: ContractorReviewListItem[];
}) {
  const isEmpty =
    clientProjects.length === 0 &&
    accepted.length === 0 &&
    inReview.length === 0 &&
    history.length === 0;

  if (isEmpty) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No projects yet</p>
        <p className="text-sm text-[var(--muted)]">
          When a homeowner invites you to review a project, it will show up
          here. You can also start a client project from Get Started.
        </p>
        <div className="flex flex-wrap gap-4 pt-1">
          <Link
            href="/homeowners/signup"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            Start a client project
          </Link>
          <Link
            href="/contractors"
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            Learn more about ScopeMate for contractors
          </Link>
        </div>
      </SectionSurface>
    );
  }

  return (
    <div className="space-y-12">
      <PageSection
        title="Client projects"
        description="Projects you scoped for clients. Open one to refine the scope, estimate, and share."
      >
        <ClientProjectsGrid projects={clientProjects} />
      </PageSection>

      <PageSection title="Active">
        <AcceptedProjectsGrid projects={accepted} />
      </PageSection>

      <PageSection title="In review">
        <ContractorReviewsList reviews={inReview} emptyState="in-review" />
      </PageSection>

      <PageSection
        title="History"
        description="Past proposals and closed reviews."
      >
        <ContractorBidHistorySection reviews={history} />
      </PageSection>
    </div>
  );
}
