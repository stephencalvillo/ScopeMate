"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { ProjectSetupLoadingCard } from "@/components/project/project-setup-loading-card";
import { persistGuestProjectToken } from "@/lib/auth/guest-project-session";
import {
  ensureGuestProjectClaimed,
  fetchProjectWithScopeClient,
} from "@/lib/project/load-project-client";
import { persistPendingShareDialog } from "@/lib/project/share-return-onboarding";
import type { ProjectWithScope } from "@/types";

export function ProjectDetailClientFallback({
  projectId,
  autoGenerate,
  openShareOnLoad,
  guestToken,
}: {
  projectId: string;
  autoGenerate: boolean;
  openShareOnLoad: boolean;
  guestToken?: string | null;
}) {
  const { isLoaded, getToken } = useAuth();
  const started = useRef(false);
  const [project, setProject] = useState<ProjectWithScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading your project…");

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    if (guestToken) {
      persistGuestProjectToken(projectId, guestToken);
    }

    void (async () => {
      try {
        setStatus("Finishing account setup…");
        await ensureGuestProjectClaimed(projectId, getToken, guestToken);

        setStatus("Loading your project…");
        const loadedProject = await fetchProjectWithScopeClient(
          projectId,
          getToken
        );
        setProject(loadedProject);

        if (openShareOnLoad) {
          persistPendingShareDialog(projectId);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your project."
        );
      }
    })();
  }, [getToken, guestToken, isLoaded, openShareOnLoad, projectId]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ProjectSetupLoadingCard
          title="Could not load project"
          description={error}
        />
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/projects">My projects</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <ProjectSetupLoadingCard
        title="Loading your project"
        description={status}
      />
    );
  }

  return (
    <ProjectDetailView
      project={project}
      autoGenerate={autoGenerate}
      isGuestProject={project.homeowner_id === null}
    />
  );
}
