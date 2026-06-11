"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/project-card";
import { ContractorReviewsList } from "@/components/contractor/contractor-reviews-list";
import { ContractorBidHistorySection } from "@/components/contractor/contractor-bid-history-section";
import {
  ContractorPortfolioTabNav,
  type ContractorPortfolioTabId,
} from "@/components/contractor/contractor-portfolio-tab-nav";
import { SectionSurface } from "@/components/layout/page-section";
import type { ContractorReviewListItem } from "@/lib/contractor/review-list-item";
import type { Project } from "@/types";

function ActiveProjectsGrid({
  clientProjects,
  accepted,
}: {
  clientProjects: Project[];
  accepted: ContractorReviewListItem[];
}) {
  const hasProjects = clientProjects.length > 0 || accepted.length > 0;

  if (!hasProjects) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">
          Client projects you&apos;ve scoped and jobs accepted by homeowners.
        </p>
        <SectionSurface className="space-y-2">
          <p className="text-sm font-medium text-neutral-900">No active projects</p>
          <p className="text-sm text-[var(--muted)]">
            Start a client project or wait for a homeowner to accept your
            proposal.
          </p>
          <Button asChild>
            <Link href="/contractor/projects/new">Start a client project</Link>
          </Button>
        </SectionSurface>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {clientProjects.map((project) => (
        <ProjectCard
          key={`client-${project.id}`}
          project={project}
          href={`/contractor/projects/${project.id}`}
          showProjectType={false}
          aiSummaryOnly
        />
      ))}
      {accepted.map((item) => (
        <ProjectCard
          key={`accepted-${item.invitation.id}`}
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

function InReviewTab({ reviews }: { reviews: ContractorReviewListItem[] }) {
  return <ContractorReviewsList reviews={reviews} emptyState="in-review" />;
}

function HistoryTab({ reviews }: { reviews: ContractorReviewListItem[] }) {
  return <ContractorBidHistorySection reviews={reviews} />;
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
  const [activeTab, setActiveTab] = useState<ContractorPortfolioTabId>("active");

  const counts = {
    active: clientProjects.length + accepted.length,
    inReview: inReview.length,
    history: history.length,
  };

  return (
    <div className="space-y-6">
      <ContractorPortfolioTabNav
        activeTab={activeTab}
        counts={counts}
        onTabChange={setActiveTab}
      />

      {activeTab === "active" ? (
        <ActiveProjectsGrid
          clientProjects={clientProjects}
          accepted={accepted}
        />
      ) : null}

      {activeTab === "in-review" ? <InReviewTab reviews={inReview} /> : null}

      {activeTab === "history" ? <HistoryTab reviews={history} /> : null}
    </div>
  );
}
