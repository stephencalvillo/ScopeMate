"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectActivitySection } from "@/components/project/project-activity-section";
import { ShareLinkDialog } from "@/components/project/share-link-dialog-content";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

type DockAnimation = "float" | "inline" | null;

export function ContractorShareAndActivity({ project }: { project: Project }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [isAnchored, setIsAnchored] = useState(true);
  const [hasObserved, setHasObserved] = useState(false);
  const [animation, setAnimation] = useState<DockAnimation>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasObserved(true);
        setIsAnchored(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasObserved) return;

    setAnimation(null);

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setAnimation(isAnchored ? "inline" : "float");
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [hasObserved, isAnchored]);

  const isFloating = hasObserved && !isAnchored;

  function notifyActivityChange() {
    setActivityRefreshKey((current) => current + 1);
  }

  const shareButton = (
    <Button type="button" onClick={() => setShareDialogOpen(true)}>
      Create share link
    </Button>
  );

  return (
    <>
      <div className="relative">
        <div
          ref={sentinelRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden
        />

        <PageSection
          title="Share with a contractor"
          description="Create a review link to copy or email. Contractors can review your scope and suggest changes without signing in."
        >
          {isAnchored ? (
            <div
              className={cn(
                "space-y-3",
                animation === "inline" && "share-dock-inline-enter"
              )}
            >
              {shareButton}
              {message ? (
                <p className="text-sm text-[var(--muted)]">{message}</p>
              ) : null}
            </div>
          ) : null}
        </PageSection>
      </div>

      <ProjectActivitySection
        projectId={project.id}
        refreshKey={activityRefreshKey}
      />

      {isFloating ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-4 z-40 px-[var(--page-padding-x)]",
            animation === "float" && "share-dock-float-enter"
          )}
        >
          <div className="mx-auto max-w-5xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <SectionSurface className="bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--muted)]">
                  Send a read-only link or email invitation so a contractor can
                  review your scope.
                </p>
                <div className="flex shrink-0 justify-end">{shareButton}</div>
              </div>
            </SectionSurface>
          </div>
        </div>
      ) : null}

      <ShareLinkDialog
        project={project}
        open={shareDialogOpen}
        autoCreate
        onOpenChange={(open) => {
          setShareDialogOpen(open);
          if (!open) notifyActivityChange();
        }}
      />
    </>
  );
}
