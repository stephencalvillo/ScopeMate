import Link from "next/link";
import { ProjectCard } from "@/components/project/project-card";
import { ContractorReviewsList } from "@/components/contractor/contractor-reviews-list";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import type { ContractorReviewListItem } from "@/lib/contractor/profile";

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
        />
      ))}
    </div>
  );
}

export function ContractorPortfolio({
  accepted,
  inReview,
}: {
  accepted: ContractorReviewListItem[];
  inReview: ContractorReviewListItem[];
}) {
  const isEmpty = accepted.length === 0 && inReview.length === 0;

  if (isEmpty) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No projects yet</p>
        <p className="text-sm text-[var(--muted)]">
          When a homeowner invites you to review a project, it will show up
          here. You can still open review links from email while you wait.
        </p>
        <Link
          href="/contractors"
          className="inline-block text-sm font-medium text-neutral-900 hover:underline"
        >
          Learn more about ScopeMate for contractors
        </Link>
      </SectionSurface>
    );
  }

  return (
    <div className="space-y-12">
      <PageSection
        title="Active"
        description="Projects where the homeowner accepted your proposal."
      >
        <AcceptedProjectsGrid projects={accepted} />
      </PageSection>

      <PageSection
        title="In review"
        description="Open reviews you can continue or proposals awaiting a homeowner decision."
      >
        <ContractorReviewsList reviews={inReview} emptyState="in-review" />
      </PageSection>
    </div>
  );
}
