"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { AcceptedProposalSummary } from "@/components/project/accepted-proposal-summary";
import { ProjectActionsMenu } from "@/components/project/project-actions-menu";
import { ProjectClaimHandler } from "@/components/project/project-claim-handler";
import { ProjectDetailTabs } from "@/components/project/project-detail-tabs";
import { OwnerProjectWorkspace } from "@/components/project/owner-project-workspace";
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
import { usesCreationWalkthrough } from "@/lib/project/creation-walkthrough";
import { usesOwnerProjectWorkspace } from "@/lib/project/owner-workspace";
import { projectStatusBadgeProps } from "@/lib/project-status";
import type { ProjectAcceptedProposalSummary } from "@/lib/estimates/proposal-decision-types";
import { formatProjectTypeLabel, type ProjectWithScope } from "@/types";
import type { ProjectPreviewContext } from "@/lib/admin/preview-context";

function ProjectHeaderMeta({
  project,
  canEditTitle,
  heading,
  showStatusBadge = true,
  locationOnly = false,
  showLocationMeta = true,
}: {
  project: ProjectWithScope;
  canEditTitle: boolean;
  heading?: string;
  showStatusBadge?: boolean;
  locationOnly?: boolean;
  showLocationMeta?: boolean;
}) {
  const statusBadge = projectStatusBadgeProps(project);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {heading ? (
          <h1 className="font-display text-4xl tracking-tight text-neutral-900">
            {heading}
          </h1>
        ) : (
          <ProjectTitleEditor
            projectId={project.id}
            title={project.title}
            canEdit={canEditTitle}
          />
        )}
        {showStatusBadge ? (
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        ) : null}
      </div>
      {showLocationMeta ? (
        locationOnly ? (
          <p className="text-sm text-[var(--muted)]">
            {formatProjectLocation(project)}
          </p>
        ) : (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
            <span>{formatProjectTypeLabel(project.project_type)}</span>
            <span aria-hidden>{"\u00b7"}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {formatProjectLocation(project)}
            </span>
          </p>
        )
      ) : null}
    </div>
  );
}

function ProjectDetailHeader({
  project,
  isGuestProject,
  useCreationWalkthrough,
  useOwnerWorkspace,
  canManageProject,
  listHref,
  preview,
}: {
  project: ProjectWithScope;
  isGuestProject: boolean;
  useCreationWalkthrough: boolean;
  useOwnerWorkspace: boolean;
  canManageProject: boolean;
  listHref: string;
  preview: boolean;
}) {
  const actions = canManageProject ? (
    <ProjectActionsMenu
      projectId={project.id}
      listHref={listHref}
      preview={preview}
    />
  ) : null;
  const meta = (
    <ProjectHeaderMeta
      project={project}
      canEditTitle={!isGuestProject}
      heading={useCreationWalkthrough ? "Confirm and share" : undefined}
      showStatusBadge={!useCreationWalkthrough && !useOwnerWorkspace}
      locationOnly={useOwnerWorkspace}
      showLocationMeta={!useCreationWalkthrough}
    />
  );

  if (useCreationWalkthrough) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        {meta}
        {actions}
      </div>
    );
  }

  return (
    <ProjectShareHeaderRow>
      {meta}
      <ProjectShareHeaderActions>{actions}</ProjectShareHeaderActions>
    </ProjectShareHeaderRow>
  );
}

export function ProjectDetailView({
  project,
  autoGenerate,
  acceptedProposal = null,
  isGuestProject = false,
  projectsBreadcrumbHref,
  previewContext,
  actionPreviewListHref,
}: {
  project: ProjectWithScope;
  autoGenerate: boolean;
  acceptedProposal?: ProjectAcceptedProposalSummary | null;
  isGuestProject?: boolean;
  projectsBreadcrumbHref?: "/projects" | "/contractor" | null;
  previewContext?: ProjectPreviewContext;
  actionPreviewListHref?: string;
}) {
  const hasScope = project.scope_items.length > 0 || project.ai_summary;
  const [creationCompletedAt, setCreationCompletedAt] = useState(
    project.creation_completed_at
  );

  useEffect(() => {
    setCreationCompletedAt(project.creation_completed_at);
  }, [project.creation_completed_at]);

  const walkthroughProject = {
    ...project,
    creation_completed_at: creationCompletedAt,
  };
  const useCreationWalkthrough = usesCreationWalkthrough(walkthroughProject);
  const useOwnerWorkspace = usesOwnerProjectWorkspace(walkthroughProject);
  const canManageProject =
    !isGuestProject || projectsBreadcrumbHref === "/contractor";
  const listHref =
    previewContext?.listPath ??
    actionPreviewListHref ??
    (projectsBreadcrumbHref === "/contractor" ? "/contractor" : "/projects");
  const preview = Boolean(previewContext) || Boolean(actionPreviewListHref);
  const handleCreationComplete = useCallback(() => {
    setCreationCompletedAt((current) => current ?? new Date().toISOString());
  }, []);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const handleActivityChange = useCallback(() => {
    setActivityRefreshKey((current) => current + 1);
  }, []);
  const [isGenerating, setIsGenerating] = useState(
    Boolean(autoGenerate && !hasScope)
  );
  const handleGeneratingChange = useCallback((generating: boolean) => {
    setIsGenerating(generating);
  }, []);

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
      <ProjectShareProvider
        project={project}
        onActivityChange={handleActivityChange}
      >
        <div className="space-y-8">
          <Suspense fallback={null}>
            <ProjectClaimHandler
              projectId={project.id}
              isGuestProject={isGuestProject}
            />
          </Suspense>
          {isGenerating ? null : (
            <PageBreadcrumbHeader breadcrumb={breadcrumb}>
              <ProjectDetailHeader
                project={project}
                isGuestProject={isGuestProject}
                useCreationWalkthrough={useCreationWalkthrough}
                useOwnerWorkspace={useOwnerWorkspace}
                canManageProject={canManageProject}
                listHref={listHref}
                preview={preview}
              />
            </PageBreadcrumbHeader>
          )}
          {isGenerating ? null : acceptedProposalBanner}
          <ScopeEditor
            project={walkthroughProject}
            autoGenerate={autoGenerate}
            onGeneratingChange={handleGeneratingChange}
            onCreationComplete={handleCreationComplete}
          />
        </div>
      </ProjectShareProvider>
    );
  }

  return (
    <ProjectShareProvider
      project={project}
      onActivityChange={handleActivityChange}
    >
      <div className="space-y-8">
        {isGenerating ? null : (
          <PageBreadcrumbHeader breadcrumb={breadcrumb}>
            <ProjectDetailHeader
              project={project}
              isGuestProject={isGuestProject}
              useCreationWalkthrough={useCreationWalkthrough}
              useOwnerWorkspace={useOwnerWorkspace}
              canManageProject={canManageProject}
              listHref={listHref}
              preview={preview}
            />
          </PageBreadcrumbHeader>
        )}

        {isGenerating ? null : acceptedProposalBanner}

        <Suspense
          fallback={
            <div className="text-sm text-[var(--muted)]">Loading project...</div>
          }
        >
          {useOwnerWorkspace ? (
            <OwnerProjectWorkspace
              project={project}
              activityRefreshKey={activityRefreshKey}
              previewContext={previewContext}
              onGeneratingChange={handleGeneratingChange}
            />
          ) : (
            <ProjectDetailTabs
              project={walkthroughProject}
              autoGenerate={autoGenerate}
              activityRefreshKey={activityRefreshKey}
              showTabs={false}
              previewContext={previewContext}
              onGeneratingChange={handleGeneratingChange}
              onCreationComplete={handleCreationComplete}
            />
          )}
        </Suspense>
      </div>
    </ProjectShareProvider>
  );
}
