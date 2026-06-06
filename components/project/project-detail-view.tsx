"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { AcceptedProposalSummary } from "@/components/project/accepted-proposal-summary";
import { ProjectActionsMenu } from "@/components/project/project-actions-menu";
import { ProjectDetailTabs } from "@/components/project/project-detail-tabs";
import {
  ProjectShareHeaderActions,
  ProjectShareHeaderRow,
  ProjectShareProvider,
} from "@/components/project/project-share-ui";
import { ScopeEditor } from "@/components/scope/scope-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeProps } from "@/lib/project-status";
import type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision";
import { formatProjectTypeLabel, type ProjectWithScope } from "@/types";

function ProjectHeaderMeta({ project }: { project: ProjectWithScope }) {
  const statusBadge = projectStatusBadgeProps(project);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          {project.title}
        </h1>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>
      <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
        <span>{formatProjectTypeLabel(project.project_type)}</span>
        <span aria-hidden>{"\u00b7"}</span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {formatProjectLocation(project)}
        </span>
      </p>
    </div>
  );
}

export function ProjectDetailView({
  project,
  autoGenerate,
  acceptedProposal = null,
}: {
  project: ProjectWithScope;
  autoGenerate: boolean;
  acceptedProposal?: ProjectAcceptedProposalSummary | null;
}) {
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const handleActivityChange = useCallback(() => {
    setActivityRefreshKey((current) => current + 1);
  }, []);

  const hasScope = project.scope_items.length > 0 || project.ai_summary;

  const backButton = (
    <Button variant="ghost" size="sm" className="-ml-2" asChild>
      <Link href="/projects">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>
    </Button>
  );

  const acceptedProposalBanner =
    acceptedProposal != null ? (
      <AcceptedProposalSummary
        projectId={project.id}
        summary={acceptedProposal}
      />
    ) : null;

  if (!hasScope) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          {backButton}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <ProjectHeaderMeta project={project} />
            <ProjectActionsMenu projectId={project.id} />
          </div>
        </div>
        {acceptedProposalBanner}
        <ScopeEditor project={project} autoGenerate={autoGenerate} />
      </div>
    );
  }

  return (
    <ProjectShareProvider
      project={project}
      onActivityChange={handleActivityChange}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          {backButton}
          <ProjectShareHeaderRow>
            <ProjectHeaderMeta project={project} />
            <ProjectShareHeaderActions>
              <ProjectActionsMenu projectId={project.id} />
            </ProjectShareHeaderActions>
          </ProjectShareHeaderRow>
        </div>

        {acceptedProposalBanner}

        <Suspense
          fallback={
            <div className="text-sm text-[var(--muted)]">Loading project...</div>
          }
        >
          <ProjectDetailTabs
            project={project}
            autoGenerate={autoGenerate}
            activityRefreshKey={activityRefreshKey}
          />
        </Suspense>
      </div>
    </ProjectShareProvider>
  );
}
