"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddMoreToScopeSection } from "@/components/scope/add-more-to-scope-section";
import { GenerateScopeButton } from "@/components/scope/generate-scope-button";
import { ScopeCategoryFilter } from "@/components/scope/scope-category-filter";
import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";
import {
  ADD_MORE_STEPS,
  ScopeGeneratingLoader,
} from "@/components/scope/scope-generating-loader";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemRow } from "@/components/scope/scope-item-row";
import { ScopeSummary } from "@/components/scope/scope-summary";
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
  const [summary, setSummary] = useState(project.ai_summary);
  const [items, setItems] = useState(project.scope_items);
  const [isGenerating, setIsGenerating] = useState(
    autoGenerate && project.scope_items.length === 0 && !project.ai_summary
  );
  const [additionalNotes, setAdditionalNotes] = useState<string | undefined>();
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
  const isAddingMore = Boolean(additionalNotes);

  const handleGenerated = useCallback(
    (payload: { ai_summary: string; scope_items: ScopeItem[] }) => {
      setSummary(payload.ai_summary);
      setItems(payload.scope_items);
      setIsGenerating(false);
      setAdditionalNotes(undefined);
      setGenerateError(null);
      router.replace(`/projects/${project.id}`);
      router.refresh();
    },
    [project.id, router]
  );

  const handleGenerateError = useCallback(
    (message: string) => {
      setIsGenerating(false);
      setAdditionalNotes(undefined);
      setGenerateError(message);
      router.replace(`/projects/${project.id}`);
    },
    [project.id, router]
  );

  const handleAddMore = useCallback((notes: string) => {
    setGenerateError(null);
    setAdditionalNotes(notes);
    setIsGenerating(true);
  }, []);

  if (isGenerating) {
    return (
      <ScopeGeneratingLoader
        projectId={project.id}
        additionalNotes={additionalNotes}
        steps={isAddingMore ? ADD_MORE_STEPS : undefined}
        helperText={
          isAddingMore
            ? "ScopeMate is weaving your new details into the scope."
            : undefined
        }
        onComplete={handleGenerated}
        onError={handleGenerateError}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ScopeSummary summary={summary} />

      {!hasScope ? (
        <PageSection
          title="Turn your description into a scope"
          description="ScopeMate will read your description and organize it into clear work items a contractor can review."
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

          <AddMoreToScopeSection onSubmit={handleAddMore} />
        </PageSection>
      )}
    </div>
  );
}
