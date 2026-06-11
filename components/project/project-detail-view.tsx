"use client";

import { Suspense, useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { AcceptedProposalSummary } from "@/components/project/accepted-proposal-summary";
import { ProjectActionsMenu } from "@/components/project/project-actions-menu";
import { ProjectClaimHandler } from "@/components/project/project-claim-handler";
import { ProjectDetailTabs } from "@/components/project/project-detail-tabs";
import { ProjectTitleEditor } from "@/components/project/project-title-editor";
import {
  ProjectShareHeaderActions,
  ProjectShareHeaderRow,
  ProjectShareProvider,
} from "@/components/project/project-share-ui";
import { ScopeEditor } from "@/components/scope/scope-editor";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { Badge } from "@/components/ui/badge";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeProps } from "@/lib/project-status";
import type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision-types";
import { formatProjectTypeLabel, type ProjectWithScope } from "@/types";
import type { ProjectPreviewContext } from "@/lib/admin/preview-context";

function ProjectHeaderMeta({
  project,
  canEditTitle,
}: {
  project: ProjectWithScope;
  canEditTitle: boolean;
}) {
  const statusBadge = projectStatusBadgeProps(project);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ProjectTitleEditor
          projectId={project.id}
          title={project.title}
          canEdit={canEditTitle}
        />
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
  isGuestProject = false,
  projectsBreadcrumbHref,
  previewContext,
}: {
  project: ProjectWithScope;
  autoGenerate: boolean;
  acceptedProposal?: ProjectAcceptedProposalSummary | null;
  isGuestProject?: boolean;
  projectsBreadcrumbHref?: "/projects" | "/contractor" | null;
  previewContext?: ProjectPreviewContext;
}) {
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const handleActivityChange = useCallback(() => {
    setActivityRefreshKey((current) => current + 1);
  }, []);

  const hasScope = project.scope_items.length > 0 || project.ai_summary;

  const breadcrumb =
    projectsBreadcrumbHref === null
      ? null
      : projectsBreadcrumbHref
        ? (
            <MyProjectsBreadcrumb href={projectsBreadcrumbHref} />
          )
        : isGuestProject && project.creator_role !== "contractor"
          ? null
          : (
              <MyProjectsBreadcrumb
                href={
                  project.creator_role === "contractor" ? "/contractor" : "/projects"
                }
              />
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
        <Suspense fallback={null}>
          <ProjectClaimHandler
            projectId={project.id}
            isGuestProject={isGuestProject}
          />
        </Suspense>
        <PageBreadcrumbHeader breadcrumb={breadcrumb}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <ProjectHeaderMeta
              project={project}
              canEditTitle={!isGuestProject}
            />
            <ProjectActionsMenu projectId={project.id} />
          </div>
        </PageBreadcrumbHeader>
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
        <PageBreadcrumbHeader breadcrumb={breadcrumb}>
          <ProjectShareHeaderRow>
            <ProjectHeaderMeta
              project={project}
              canEditTitle={!isGuestProject}
            />
            <ProjectShareHeaderActions>
              <ProjectActionsMenu projectId={project.id} />
            </ProjectShareHeaderActions>
          </ProjectShareHeaderRow>
        </PageBreadcrumbHeader>

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
            showTabs={!isGuestProject}
            previewContext={previewContext}
          />
        </Suspense>
      </div>
    </ProjectShareProvider>
  );
}
