import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContractorInviteSection } from "@/components/contractor/contractor-invite-section";
import { FollowUpQuestionsPanel } from "@/components/follow-up/follow-up-questions-panel";
import { PhotoUploadSection } from "@/components/photos/photo-upload-section";
import { ProjectActionsMenu } from "@/components/project/project-actions-menu";
import { ShareLinkDock } from "@/components/project/share-link-dock";
import { ScopeEditor } from "@/components/scope/scope-editor";
import { SuggestionsInbox } from "@/components/suggestions/suggestions-inbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { getProjectForUser } from "@/lib/db/projects";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeVariant } from "@/lib/project-status";
import {
  formatProjectTypeLabel,
  PROJECT_STATUS_LABELS,
} from "@/types";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string }>;
}) {
  const { id } = await params;
  const { generate } = await searchParams;
  const user = await ensureUserRecord();
  const project = await getProjectForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const hasScope = project.scope_items.length > 0 || project.ai_summary;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-4xl tracking-tight text-neutral-900">
                {project.title}
              </h1>
              <Badge variant={projectStatusBadgeVariant(project.status)}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {formatProjectTypeLabel(project.project_type)}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {formatProjectLocation(project)}
            </p>
          </div>
          <ProjectActionsMenu projectId={project.id} />
        </div>
      </div>

      {hasScope ? (
        <>
          <SuggestionsInbox projectId={project.id} />
          <ScopeEditor
            project={project}
            autoGenerate={generate === "1"}
          />
          <FollowUpQuestionsPanel
            projectId={project.id}
            projectType={project.project_type}
          />
          <PhotoUploadSection projectId={project.id} />
          <ContractorInviteSection projectId={project.id} />
          <ShareLinkDock project={project} />
        </>
      ) : (
        <ScopeEditor
          project={project}
          autoGenerate={generate === "1"}
        />
      )}
    </div>
  );
}
