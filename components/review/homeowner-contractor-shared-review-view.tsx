"use client";

import { ProjectReadinessSummary } from "@/components/review/project-readiness-summary";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { PageSection } from "@/components/layout/page-section";
import { groupScopeItemsByCategory } from "@/lib/scope/group-by-category";
import type { SharedPhoto } from "@/lib/phase2/client";
import type { ProjectReadinessSummary as ProjectReadinessSummaryData } from "@/lib/project/readiness-summary";
import { formatProjectTypeLabel, type ProjectWithScope } from "@/types";

export function HomeownerContractorSharedReviewView({
  project,
  photos,
  readiness,
  contractorLabel,
}: {
  project: ProjectWithScope;
  photos: SharedPhoto[];
  readiness: ProjectReadinessSummaryData;
  contractorLabel: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]">
          Shared by {contractorLabel}
        </p>
        <h1 className="font-display text-3xl tracking-tight text-balance text-neutral-900 sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {formatProjectTypeLabel(project.project_type)}
        </p>
      </div>

      <ProjectReadinessSummary readiness={readiness} />

      <ScopeSummary summary={project.ai_summary} />

      <SharedPhotoGallery photos={photos} />

      {project.scope_items.length > 0 ? (
        <PageSection title="Scope">
          <div className="space-y-6">
            {groupScopeItemsByCategory(project.scope_items).map((group) => (
              <ScopeCategoryGroup
                key={group.category}
                category={group.category}
                itemCount={group.items.length}
              >
                {group.items.map((item) => (
                  <ScopeItemShell key={item.id}>
                    <ScopeItemContent item={item} />
                  </ScopeItemShell>
                ))}
              </ScopeCategoryGroup>
            ))}
          </div>
        </PageSection>
      ) : null}
    </div>
  );
}
