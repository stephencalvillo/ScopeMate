import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { SharedScopeList } from "@/components/share/shared-scope-list";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection } from "@/components/layout/page-section";
import { Badge } from "@/components/ui/badge";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeVariant } from "@/lib/project-status";
import type { SharedPhoto } from "@/lib/phase2/client";
import {
  formatProjectTypeLabel,
  PROJECT_STATUS_LABELS,
  type ProjectWithScope,
} from "@/types";

export function SharedProjectView({
  project,
  photos,
}: {
  project: ProjectWithScope;
  photos: SharedPhoto[];
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
        <p className="text-sm text-[var(--muted)]">
          {formatProjectLocation(project)}
        </p>
      </div>

      <ScopeSummary summary={project.ai_summary} />

      <PageSection title="Scope of work">
        <SharedScopeList items={project.scope_items} />
      </PageSection>

      <SharedPhotoGallery photos={photos} />
    </div>
  );
}
