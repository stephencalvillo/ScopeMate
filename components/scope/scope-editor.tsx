"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectDetailPath } from "@/lib/project/use-project-detail-path";
import { GenerateScopeButton } from "@/components/scope/generate-scope-button";
import { FollowUpQuestionsPanel } from "@/components/follow-up/follow-up-questions-panel";
import { PhotoUploadSection } from "@/components/photos/photo-upload-section";
import { ScopeCategoryFilter } from "@/components/scope/scope-category-filter";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import {
  ScopeGeneratingLoader,
  UPDATE_SCOPE_STEPS,
} from "@/components/scope/scope-generating-loader";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemRow } from "@/components/scope/scope-item-row";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { UpdateProjectScopeDialog } from "@/components/scope/update-project-scope-dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { groupScopeItemsByCategory } from "@/lib/scope/group-by-category";
import type { ProjectWithScope, ScopeItem } from "@/types";

export function ScopeEditor({
  project,
  autoGenerate = false,
}: {
  project: ProjectWithScope;
  autoGenerate?: boolean;
}) {
  const router = useRouter();
  const projectPath = useProjectDetailPath(project.id);
  const [summary, setSummary] = useState(project.ai_summary);
  const [items, setItems] = useState(project.scope_items);
  const [isGenerating, setIsGenerating] = useState(
    autoGenerate && project.scope_items.length === 0 && !project.ai_summary
  );
  const [updatedSummary, setUpdatedSummary] = useState<string | undefined>();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    setSummary(project.ai_summary);
    setItems(project.scope_items);
  }, [project.ai_summary, project.scope_items]);

  const groupedItems = groupScopeItemsByCategory(items);
  const categoriesInScope = groupedItems.map((group) => group.category);
  const filteredGroups =
    categoryFilter === "all"
      ? groupedItems
      : groupedItems.filter((group) => group.category === categoryFilter);

  useEffect(() => {
    if (
      categoryFilter !== "all" &&
      !categoriesInScope.includes(categoryFilter)
    ) {
      setCategoryFilter("all");
    }
  }, [categoriesInScope, categoryFilter]);

  const hasScope = items.length > 0 || Boolean(summary);
  const isUpdatingScope = Boolean(updatedSummary);

  const handleGenerated = useCallback(
    (payload: { ai_summary: string; scope_items: ScopeItem[] }) => {
      setSummary(payload.ai_summary);
      setItems(payload.scope_items);
      setIsGenerating(false);
      setUpdatedSummary(undefined);
      setGenerateError(null);
      router.replace(projectPath);
      router.refresh();
    },
    [projectPath, router]
  );

  const handleGenerateError = useCallback(
    (message: string) => {
      setIsGenerating(false);
      setUpdatedSummary(undefined);
      setGenerateError(message);
      router.replace(projectPath);
    },
    [projectPath, router]
  );

  const handleUpdateScope = useCallback((nextSummary: string) => {
    setGenerateError(null);
    setUpdatedSummary(nextSummary);
    setIsGenerating(true);
  }, []);

  if (isGenerating) {
    return (
      <ScopeGeneratingLoader
        projectId={project.id}
        updatedSummary={updatedSummary}
        steps={isUpdatingScope ? UPDATE_SCOPE_STEPS : undefined}
        helperText={
          isUpdatingScope
            ? "ScopeBuddy is updating your scope list from your summary."
            : undefined
        }
        onComplete={handleGenerated}
        onError={handleGenerateError}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ScopeSummary
        summary={summary}
        headerAction={
          hasScope ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setUpdateDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Update project scope
            </Button>
          ) : undefined
        }
      />

      {summary ? (
        <UpdateProjectScopeDialog
          summary={summary}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdate={handleUpdateScope}
        />
      ) : null}

      <FollowUpQuestionsPanel
        projectId={project.id}
        projectType={project.project_type}
      />

      <PhotoUploadSection projectId={project.id} />

      {!hasScope ? (
        <PageSection
          title="Turn your description into a scope"
          description="ScopeBuddy will read your description and organize it into clear work items a contractor can review."
        >
          <SectionSurface className="space-y-4">
            {generateError ? (
              <p className="text-sm text-red-600">{generateError}</p>
            ) : null}
            <GenerateScopeButton
              projectId={project.id}
              onGenerated={handleGenerated}
            />
          </SectionSurface>
        </PageSection>
      ) : (
        <PageSection
          title="Scope items"
          description="Review or edit items before sharing."
          action={
            <ScopeCategoryFilter
              categories={categoriesInScope}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          }
        >
          {generateError ? (
            <p className="text-sm text-red-600">{generateError}</p>
          ) : null}

          <div className="space-y-3">
            {filteredGroups.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No items in this category.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <ScopeCategoryGroup
                  key={group.category}
                  category={group.category}
                  itemCount={group.items.length}
                >
                  {group.items.map((item) => (
                    <ScopeItemRow
                      key={item.id}
                      item={item}
                      projectId={project.id}
                      onUpdated={(updated) =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === updated.id ? updated : entry
                          )
                        )
                      }
                      onRemoved={(itemId) =>
                        setItems((current) =>
                          current.filter((entry) => entry.id !== itemId)
                        )
                      }
                    />
                  ))}
                </ScopeCategoryGroup>
              ))
            )}
          </div>
        </PageSection>
      )}
    </div>
  );
}
