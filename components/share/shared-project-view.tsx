import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ProjectReadinessSummary } from "@/components/review/project-readiness-summary";
import { SharedScopeList } from "@/components/share/shared-scope-list";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { projectStatusBadgeVariant } from "@/lib/project-status";
import type { SharedPhoto } from "@/lib/phase2/client";
import type { ProjectReadinessSummary as ProjectReadinessSummaryData } from "@/lib/project/readiness-summary";
import {
  formatProjectTypeLabel,
  PROJECT_STATUS_LABELS,
  type ProjectWithScope,
} from "@/types";

export function SharedProjectView({
  project,
  photos,
  readiness,
}: {
  project: ProjectWithScope;
  photos: SharedPhoto[];
  readiness?: ProjectReadinessSummaryData;
}) {
  return (
    <div className="space-y-8">
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
      </div>

      {readiness ? <ProjectReadinessSummary readiness={readiness} /> : null}

      <ScopeSummary summary={project.ai_summary} />

      <PageSection title="Scope of work">
        <SharedScopeList items={project.scope_items} />
      </PageSection>

      <SharedPhotoGallery photos={photos} />
    </div>
  );
}
