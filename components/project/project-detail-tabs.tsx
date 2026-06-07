"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContractorShareSection } from "@/components/contractor/contractor-share-and-activity";
import { ProjectActivitySection } from "@/components/project/project-activity-section";
import { ReviewedProjectScopesSection } from "@/components/review/reviewed-project-scopes-section";
import { NeedsAttentionPanel } from "@/components/suggestions/needs-attention-panel";
import { ScopeEditor } from "@/components/scope/scope-editor";
import {
  parseProjectTab,
  ProjectTabNav,
  type ProjectTabId,
} from "@/components/project/project-tab-nav";
import type { ProjectWithScope } from "@/types";

export function ProjectDetailTabs({
  project,
  autoGenerate = false,
  activityRefreshKey: activityRefreshKeyProp,
  showTabs = true,
}: {
  project: ProjectWithScope;
  autoGenerate?: boolean;
  activityRefreshKey?: number;
  showTabs?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseProjectTab(searchParams.get("tab"));
  const [counts, setCounts] = useState({
    reviewedScopes: 0,
    needsAttention: 0,
  });
  const [internalActivityRefreshKey, setInternalActivityRefreshKey] =
    useState(0);
  const activityRefreshKey =
    activityRefreshKeyProp ?? internalActivityRefreshKey;

  const loadTabCounts = useCallback(async () => {
    const [reviewedResponse, suggestionsResponse] = await Promise.all([
      fetch(`/api/projects/${project.id}/reviewed-scopes`),
      fetch(`/api/projects/${project.id}/suggestions`),
    ]);

    const [reviewedData, suggestionsData] = await Promise.all([
      reviewedResponse.json(),
      suggestionsResponse.json(),
    ]);

    setCounts((current) => {
      const reviewedScopes = reviewedResponse.ok
        ? (reviewedData.reviewed_scopes ?? []).length
        : 0;
      const needsAttention = suggestionsResponse.ok
        ? (suggestionsData.suggestions ?? []).filter(
            (item: { status: string }) => item.status === "pending"
          ).length
        : 0;

      if (
        current.reviewedScopes === reviewedScopes &&
        current.needsAttention === needsAttention
      ) {
        return current;
      }

      return { reviewedScopes, needsAttention };
    });
  }, [project.id]);

  useEffect(() => {
    if (!showTabs) return;
    loadTabCounts();
  }, [loadTabCounts, showTabs]);

  function setTab(tab: ProjectTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }

    const query = params.toString();
    router.replace(
      query ? `/projects/${project.id}?${query}` : `/projects/${project.id}`,
      { scroll: false }
    );
  }

  const handleReviewedScopesCount = useCallback((count: number) => {
    setCounts((current) =>
      current.reviewedScopes === count
        ? current
        : { ...current, reviewedScopes: count }
    );
  }, []);

  const handleNeedsAttentionCount = useCallback((count: number) => {
    setCounts((current) =>
      current.needsAttention === count
        ? current
        : { ...current, needsAttention: count }
    );
  }, []);

  const showOverview = !showTabs || activeTab === "overview";

  return (
    <div className="space-y-8">
      {showTabs ? (
        <ProjectTabNav
          activeTab={activeTab}
          counts={counts}
          onTabChange={setTab}
        />
      ) : null}

      {showOverview ? (
        <div className="space-y-8">
          <ScopeEditor project={project} autoGenerate={autoGenerate} />
          <ContractorShareSection />
        </div>
      ) : null}

      {showTabs && activeTab === "activity" ? (
        <ProjectActivitySection
          projectId={project.id}
          refreshKey={activityRefreshKey}
          embedded
        />
      ) : null}

      {showTabs && activeTab === "reviewed-scopes" ? (
        <ReviewedProjectScopesSection
          projectId={project.id}
          embedded
          onCountChange={handleReviewedScopesCount}
        />
      ) : null}

      {showTabs && activeTab === "needs-attention" ? (
        <NeedsAttentionPanel
          projectId={project.id}
          onCountChange={handleNeedsAttentionCount}
          onSuggestionsUpdated={loadTabCounts}
        />
      ) : null}
    </div>
  );
}
