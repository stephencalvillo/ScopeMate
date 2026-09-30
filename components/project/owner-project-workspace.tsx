"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OwnerProjectDetails } from "@/components/project/owner-project-details";
import { OwnerScopeList } from "@/components/project/owner-scope-list";
import { SentScopesSection } from "@/components/project/sent-scopes-section";
import { PhotoUploadSection } from "@/components/photos/photo-upload-section";
import { UpdateProjectScopeDialog } from "@/components/scope/update-project-scope-dialog";
import {
  ScopeGeneratingLoader,
  UPDATE_SCOPE_STEPS,
} from "@/components/scope/scope-generating-loader";
import { useProjectDetailPath } from "@/lib/project/use-project-detail-path";
import {
  groupScopeItemsByCategory,
  withoutAnswerDerivedScopeItems,
} from "@/lib/scope/group-by-category";
import type { ProjectPreviewContext } from "@/lib/admin/preview-context";
import type { ProjectWithScope, ScopeItem } from "@/types";

export function OwnerProjectWorkspace({
  project,
  activityRefreshKey = 0,
  previewContext,
  onGeneratingChange,
}: {
  project: ProjectWithScope;
  activityRefreshKey?: number;
  previewContext?: ProjectPreviewContext;
  onGeneratingChange?: (generating: boolean) => void;
}) {
  const router = useRouter();
  const projectPath = useProjectDetailPath(project.id);
  const [summary, setSummary] = useState(project.ai_summary);
  const [items, setItems] = useState(project.scope_items);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updatedSummary, setUpdatedSummary] = useState<string | undefined>();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const isUpdatingScope = Boolean(updatedSummary);

  useEffect(() => {
    setSummary(project.ai_summary);
    setItems(project.scope_items);
  }, [project.ai_summary, project.scope_items]);

  useEffect(() => {
    onGeneratingChange?.(isUpdatingScope);
  }, [isUpdatingScope, onGeneratingChange]);

  const groupedItems = groupScopeItemsByCategory(
    withoutAnswerDerivedScopeItems(items)
  );

  const handleGenerated = useCallback(
    (payload: { ai_summary: string; scope_items: ScopeItem[] }) => {
      setSummary(payload.ai_summary);
      setItems(payload.scope_items);
      setUpdatedSummary(undefined);
      setGenerateError(null);
      router.replace(previewContext?.detailPath ?? projectPath);
      router.refresh();
    },
    [previewContext?.detailPath, projectPath, router]
  );

  const handleGenerateError = useCallback(
    (message: string) => {
      setUpdatedSummary(undefined);
      setGenerateError(message);
      router.replace(previewContext?.detailPath ?? projectPath);
    },
    [previewContext?.detailPath, projectPath, router]
  );

  if (isUpdatingScope && updatedSummary) {
    return (
      <ScopeGeneratingLoader
        projectId={project.id}
        updatedSummary={updatedSummary}
        steps={UPDATE_SCOPE_STEPS}
        helperText="ScopeBuddy is updating your scope list from your summary."
        onComplete={handleGenerated}
        onError={handleGenerateError}
      />
    );
  }

  return (
    <>
      {summary ? (
        <UpdateProjectScopeDialog
          summary={summary}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdate={(nextSummary) => {
            setGenerateError(null);
            setUpdatedSummary(nextSummary);
          }}
        />
      ) : null}

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-10">
      <section className="space-y-3">
        <h2 className="font-display text-lg text-neutral-900">
          Project summary
        </h2>
        {summary ? (
          <p className="text-sm leading-6 text-neutral-800">{summary}</p>
        ) : (
          <p className="text-sm text-[var(--muted)]">No project summary yet.</p>
        )}
        {summary ? (
          <button
            type="button"
            className="text-sm text-[var(--muted)] transition-colors hover:text-neutral-900"
            onClick={() => setUpdateDialogOpen(true)}
          >
            Edit summary
          </button>
        ) : null}
        {generateError ? (
          <p className="text-sm text-red-600">{generateError}</p>
        ) : null}
      </section>

      <aside className="space-y-8 lg:sticky lg:top-6 lg:row-span-3">
        <OwnerProjectDetails
          projectId={project.id}
          projectType={project.project_type}
          previewApiBase={previewContext?.apiBasePath}
        />
        <PhotoUploadSection
          projectId={project.id}
          layout="sidebar"
          previewApiBase={previewContext?.apiBasePath}
        />
      </aside>

      <SentScopesSection
        projectId={project.id}
        refreshKey={activityRefreshKey}
        previewApiBase={previewContext?.apiBasePath}
        reviewBasePath={
          previewContext ? "/adminpanel/preview/homeowner-project-review" : undefined
        }
      />

      <OwnerScopeList
        projectId={project.id}
        groups={groupedItems}
        onUpdated={(updated) =>
          setItems((current) =>
            current.map((entry) => (entry.id === updated.id ? updated : entry))
          )
        }
        onRemoved={(itemId) =>
          setItems((current) => current.filter((entry) => entry.id !== itemId))
        }
      />
    </div>
    </>
  );
}
