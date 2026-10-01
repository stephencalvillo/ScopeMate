"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmShareSummary } from "@/components/review/confirm-share-summary";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProjectDetailPath } from "@/lib/project/use-project-detail-path";
import { GenerateScopeButton } from "@/components/scope/generate-scope-button";
import {
  FollowUpQuestionsPanel,
  useFollowUpConfirmStep,
} from "@/components/follow-up/follow-up-questions-panel";
import { PhotoUploadSection } from "@/components/photos/photo-upload-section";
import {
  ProjectShareLastStepActions,
  useProjectShareCopy,
} from "@/components/project/project-share-ui";
import {
  ReviewConfirmSteps,
  type ReviewConfirmStepItem,
} from "@/components/review/review-confirm-steps";
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
import { usesCreationWalkthrough } from "@/lib/project/creation-walkthrough";
import { markCreationCompleteClient } from "@/lib/project/creation-complete-client";
import {
  groupScopeItemsByCategory,
  withoutAnswerDerivedScopeItems,
} from "@/lib/scope/group-by-category";
import { restoreScopeItem } from "@/lib/scope/scope-item-client";
import type { ProjectPhotoWithUrl } from "@/lib/phase2/client";
import type { ProjectWithScope, ScopeItem } from "@/types";

export function ScopeEditor({
  project,
  autoGenerate = false,
  persistScopeItems = true,
  onGeneratingChange,
  onCreationComplete,
}: {
  project: ProjectWithScope;
  autoGenerate?: boolean;
  persistScopeItems?: boolean;
  onGeneratingChange?: (generating: boolean) => void;
  onCreationComplete?: () => void;
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

  useEffect(() => {
    onGeneratingChange?.(isGenerating);
  }, [isGenerating, onGeneratingChange]);

  const hasScope = items.length > 0 || Boolean(summary);
  const isUpdatingScope = Boolean(updatedSummary);
  const useConfirmSteps = hasScope && usesCreationWalkthrough(project);
  const groupedItems = groupScopeItemsByCategory(
    useConfirmSteps ? withoutAnswerDerivedScopeItems(items) : items
  );
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
      {summary ? (
        <UpdateProjectScopeDialog
          summary={summary}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdate={handleUpdateScope}
        />
      ) : null}

      {useConfirmSteps ? (
        <NewProjectConfirmSteps
          project={project}
          summary={summary}
          generateError={generateError}
          groupedItems={filteredGroups}
          persistScopeItems={persistScopeItems}
          scopeGroups={groupedItems}
          categoriesInScope={categoriesInScope}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onUpdateItem={(updated) =>
            setItems((current) =>
              current.map((entry) => (entry.id === updated.id ? updated : entry))
            )
          }
          onRemoveItem={(itemId) =>
            setItems((current) => current.filter((entry) => entry.id !== itemId))
          }
          onRestoreItem={(item) =>
            setItems((current) => restoreScopeItem(current, item))
          }
          onOpenUpdateDialog={() => setUpdateDialogOpen(true)}
          onCreationComplete={onCreationComplete}
        />
      ) : (
        <>
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

              <ScopeItemsList
                projectId={project.id}
                groups={filteredGroups}
                persist={persistScopeItems}
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
                onRestore={(item) =>
                  setItems((current) => restoreScopeItem(current, item))
                }
              />
            </PageSection>
          )}
        </>
      )}
    </div>
  );
}

function ScopeItemsList({
  projectId,
  groups,
  persist = true,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  projectId: string;
  groups: ReturnType<typeof groupScopeItemsByCategory>;
  persist?: boolean;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No items in this category.</p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <ScopeCategoryGroup
          key={group.category}
          category={group.category}
          itemCount={group.items.length}
        >
          {group.items.map((item) => (
            <ScopeItemRow
              key={item.id}
              item={item}
              projectId={projectId}
              persist={persist}
              onUpdated={onUpdated}
              onRemoved={onRemoved}
              onRestore={onRestore}
            />
          ))}
        </ScopeCategoryGroup>
      ))}
    </div>
  );
}

function NewProjectConfirmSteps({
  project,
  summary,
  generateError,
  groupedItems,
  persistScopeItems = true,
  scopeGroups,
  categoriesInScope,
  categoryFilter,
  onCategoryFilterChange,
  onUpdateItem,
  onRemoveItem,
  onRestoreItem,
  onOpenUpdateDialog,
  onCreationComplete,
}: {
  project: ProjectWithScope;
  summary: string | null;
  generateError: string | null;
  groupedItems: ReturnType<typeof groupScopeItemsByCategory>;
  persistScopeItems?: boolean;
  scopeGroups: ReturnType<typeof groupScopeItemsByCategory>;
  categoriesInScope: string[];
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onUpdateItem: (item: ScopeItem) => void;
  onRemoveItem: (itemId: string) => void;
  onRestoreItem: (item: ScopeItem) => void;
  onOpenUpdateDialog: () => void;
  onCreationComplete?: () => void;
}) {
  const { shareSectionTitle, shareDescription } = useProjectShareCopy();
  const { getToken, isSignedIn } = useAuth();
  const followUpStep = useFollowUpConfirmStep(
    project.id,
    project.project_type
  );
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<ProjectPhotoWithUrl[]>([]);
  const handleConfirmedIdsChange = useCallback((ids: string[]) => {
    setConfirmedIds(ids);
  }, []);
  const handlePhotosChange = useCallback((nextPhotos: ProjectPhotoWithUrl[]) => {
    setPhotos(nextPhotos);
  }, []);
  const handleWalkthroughComplete = useCallback(() => {
    void (async () => {
      try {
        const result = await markCreationCompleteClient(
          project.id,
          isSignedIn ? getToken : undefined
        );
        if (result.creation_completed_at) {
          onCreationComplete?.();
        }
      } catch {
        // Stay on the stepper; sharing still finishes creation.
      }
    })();
  }, [getToken, isSignedIn, onCreationComplete, project.id]);
  const summaryConfirmed = confirmedIds.includes("summary");
  const snapshot = (
    <ConfirmShareSummary
      project={project}
      summary={summary}
      showSummary={summaryConfirmed}
      answeredQuestions={followUpStep.answeredQuestions}
      photos={photos}
      scopeGroups={scopeGroups}
      showScope={confirmedIds.includes("scope")}
    />
  );

  const steps: ReviewConfirmStepItem[] = [
    {
      id: "summary",
      title: "Project summary",
      content: summary ? (
        <ScopeSummary summary={summary} embedded />
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No project summary yet.
        </p>
      ),
      confirmStart: (
        <button
          type="button"
          className="text-sm text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-neutral-900"
          onClick={onOpenUpdateDialog}
        >
          Edit summary
        </button>
      ),
    },
    {
      id: "follow-up",
      title: "Follow-up questions",
      confirmStart: followUpStep.confirmStart,
      content: followUpStep.content,
    },
    {
      id: "photos",
      title: "Project photos",
      confirmStart: ({ confirm }) => (
        <button
          type="button"
          className="text-sm text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-neutral-900"
          onClick={confirm}
        >
          Skip photos
        </button>
      ),
      content: (
        <PhotoUploadSection
          projectId={project.id}
          embedded
          onPhotosChange={handlePhotosChange}
        />
      ),
    },
    {
      id: "scope",
      title: "Scope items",
      description: "Review or edit items before sharing.",
      confirmLabel: "Finish",
      content: (
        <div className="space-y-4">
          <div className="flex justify-start">
            <ScopeCategoryFilter
              categories={categoriesInScope}
              value={categoryFilter}
              onChange={onCategoryFilterChange}
            />
          </div>
          {generateError ? (
            <p className="text-sm text-red-600">{generateError}</p>
          ) : null}
          <ScopeItemsList
            projectId={project.id}
            groups={groupedItems}
            persist={persistScopeItems}
            onUpdated={onUpdateItem}
            onRemoved={onRemoveItem}
            onRestore={onRestoreItem}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-10">
      <aside className="mb-6 lg:order-2 lg:mb-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        {snapshot}
      </aside>
      <div className="lg:order-1">
        <ReviewConfirmSteps
          steps={steps}
          confirmLabel="Next"
          onConfirmedIdsChange={handleConfirmedIdsChange}
          onComplete={handleWalkthroughComplete}
          completeFooter={
            <PageSection title={shareSectionTitle} description={shareDescription}>
              <ProjectShareLastStepActions />
            </PageSection>
          }
        />
      </div>
    </div>
  );
}
