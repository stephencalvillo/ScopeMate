"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { OwnerProjectDetails } from "@/components/project/owner-project-details";
import { OwnerScopeList } from "@/components/project/owner-scope-list";
import { SentScopesSection } from "@/components/project/sent-scopes-section";
import { MockupsSection } from "@/components/mockups/mockups-section";
import { PhotoUploadSection } from "@/components/photos/photo-upload-section";
import { UpdateProjectScopeDialog } from "@/components/scope/update-project-scope-dialog";
import { updateProjectSummaryClient } from "@/lib/project/update-project-client";
import {
  groupScopeItemsByCategory,
  withoutAnswerDerivedScopeItems,
} from "@/lib/scope/group-by-category";
import { restoreScopeItem } from "@/lib/scope/scope-item-client";
import type { ProjectPreviewContext } from "@/lib/admin/preview-context";
import type { ProjectWithScope } from "@/types";

export function OwnerProjectWorkspace({
  project,
  activityRefreshKey = 0,
  previewContext,
  persistScopeItems = true,
}: {
  project: ProjectWithScope;
  activityRefreshKey?: number;
  previewContext?: ProjectPreviewContext;
  persistScopeItems?: boolean;
  onGeneratingChange?: (generating: boolean) => void;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [summary, setSummary] = useState(project.ai_summary);
  const [items, setItems] = useState(project.scope_items);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  useEffect(() => {
    setSummary(project.ai_summary);
    setItems(project.scope_items);
  }, [project.ai_summary, project.scope_items]);

  const groupedItems = groupScopeItemsByCategory(
    withoutAnswerDerivedScopeItems(items)
  );

  const handleSaveSummary = useCallback(
    async (nextSummary: string) => {
      if (!persistScopeItems) {
        setSummary(nextSummary);
        return;
      }

      await updateProjectSummaryClient(
        project.id,
        nextSummary,
        isSignedIn ? getToken : undefined
      );
      setSummary(nextSummary);
    },
    [getToken, isSignedIn, persistScopeItems, project.id]
  );

  return (
    <>
      {summary ? (
        <UpdateProjectScopeDialog
          summary={summary}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdate={handleSaveSummary}
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
        <MockupsSection
          projectId={project.id}
          layout="sidebar"
          preview={Boolean(previewContext)}
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
        persist={persistScopeItems}
        onCreated={(created) =>
          setItems((current) => [...current, created])
        }
        onUpdated={(updated) =>
          setItems((current) =>
            current.map((entry) => (entry.id === updated.id ? updated : entry))
          )
        }
        onRemoved={(itemId) =>
          setItems((current) => current.filter((entry) => entry.id !== itemId))
        }
        onRestore={(item) =>
          setItems((current) => restoreScopeItem(current, item))
        }
      />
    </div>
    </>
  );
}
