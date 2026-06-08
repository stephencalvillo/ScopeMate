"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Link2 } from "lucide-react";
import { ContractorProjectAccountDialog } from "@/components/project/contractor-project-account-dialog";
import { HomeownerAccountCreateDialog } from "@/components/project/homeowner-account-create-dialog";
import { ShareLinkDialog } from "@/components/project/share-link-dialog-content";
import { SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { getProjectShareCopy } from "@/lib/project/share-copy";
import { cn, mobileFullWidthCtaClassName } from "@/lib/utils";
import type { Project } from "@/types";

type DockMode = "header" | "float" | "inline";
type DockAnimation = "float" | "inline" | null;

type ProjectShareContextValue = {
  mode: DockMode;
  animation: DockAnimation;
  shareSectionTitle: string;
  shareDescription: string;
  openShareDialog: () => void;
  headerSentinelRef: (node: HTMLDivElement | null) => void;
  setSectionInView: (inView: boolean) => void;
  setSectionObserved: () => void;
};

const ProjectShareContext = createContext<ProjectShareContextValue | null>(null);

function useProjectShare() {
  const context = useContext(ProjectShareContext);
  if (!context) {
    throw new Error("useProjectShare must be used within ProjectShareProvider");
  }
  return context;
}

export function ShareLinkTriggerButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button type="button" onClick={onClick} className={className}>
      <Link2 className="h-4 w-4" aria-hidden />
      Create share link
    </Button>
  );
}

function ProjectShareReturnHandler({
  projectId,
  isGuestProject,
  onOpenShare,
}: {
  projectId: string;
  isGuestProject: boolean;
  onOpenShare: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    if (searchParams.get("share") !== "1") return;
    if (!isSignedIn || isGuestProject) return;

    opened.current = true;
    onOpenShare();
    router.replace(`/projects/${projectId}`);
  }, [
    isGuestProject,
    isSignedIn,
    onOpenShare,
    projectId,
    router,
    searchParams,
  ]);

  return null;
}

export function ProjectShareProvider({
  project,
  onActivityChange,
  children,
}: {
  project: Project;
  onActivityChange?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const isGuestProject = project.homeowner_id === null;
  const isContractorProject = project.creator_role === "contractor";
  const shareCopy = getProjectShareCopy(isContractorProject);
  const headerObserverRef = useRef<IntersectionObserver | null>(null);
  const [headerInView, setHeaderInView] = useState(true);
  const [headerObserved, setHeaderObserved] = useState(false);
  const [sectionInView, setSectionInView] = useState(false);
  const [sectionObserved, setSectionObserved] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [animation, setAnimation] = useState<DockAnimation>(null);

  const hasObserved = headerObserved || sectionObserved;
  const mode: DockMode = sectionInView
    ? "inline"
    : hasObserved && !headerInView
      ? "float"
      : "header";

  const claimProject = useCallback(async () => {
    const response = await fetch(`/api/projects/${project.id}/claim`, {
      method: "POST",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Could not save this project to your account.");
    }

    router.refresh();
  }, [project.id, router]);

  const openShareLinkDialog = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  const openShareDialog = useCallback(async () => {
    if (isGuestProject) {
      if (!isSignedIn) {
        setAccountDialogOpen(true);
        return;
      }

      try {
        await claimProject();
      } catch (error) {
        console.error(error);
        return;
      }
    }

    openShareLinkDialog();
  }, [
    claimProject,
    isGuestProject,
    isSignedIn,
    openShareLinkDialog,
  ]);

  const handleAccountReady = useCallback(async () => {
    if (isGuestProject) {
      try {
        await claimProject();
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Could not save this project to your account.");
      }
    }

    openShareLinkDialog();
  }, [claimProject, isGuestProject, openShareLinkDialog]);

  const openShareDialogRef = useCallback(() => {
    void openShareDialog();
  }, [openShareDialog]);

  const headerSentinelRef = useCallback((node: HTMLDivElement | null) => {
    headerObserverRef.current?.disconnect();
    headerObserverRef.current = null;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderObserved(true);
        setHeaderInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(node);
    headerObserverRef.current = observer;
  }, []);

  useEffect(() => {
    return () => headerObserverRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!hasObserved) return;

    setAnimation(null);

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (mode === "float") setAnimation("float");
        if (mode === "inline") setAnimation("inline");
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [hasObserved, mode]);

  const markSectionObserved = useCallback(() => {
    setSectionObserved(true);
  }, []);

  return (
    <ProjectShareContext.Provider
      value={{
        mode,
        animation,
        shareSectionTitle: shareCopy.sectionTitle,
        shareDescription: shareCopy.description,
        openShareDialog: openShareDialogRef,
        headerSentinelRef,
        setSectionInView,
        setSectionObserved: markSectionObserved,
      }}
    >
      {children}

      <Suspense fallback={null}>
        <ProjectShareReturnHandler
          projectId={project.id}
          isGuestProject={isGuestProject}
          onOpenShare={openShareLinkDialog}
        />
      </Suspense>

      {mode === "float" ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-4 z-40 px-[var(--page-padding-x)]",
            animation === "float" && "share-dock-float-enter"
          )}
        >
          <div className="mx-auto max-w-5xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <SectionSurface className="bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-display text-lg text-neutral-900">
                    {shareCopy.sectionTitle}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {shareCopy.description}
                  </p>
                </div>
                <ShareLinkTriggerButton
                  onClick={openShareDialogRef}
                  className={mobileFullWidthCtaClassName}
                />
              </div>
            </SectionSurface>
          </div>
        </div>
      ) : null}

      {isContractorProject ? (
        <ContractorProjectAccountDialog
          projectId={project.id}
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          onAccountReady={() => {
            void handleAccountReady();
          }}
        />
      ) : (
        <HomeownerAccountCreateDialog
          projectId={project.id}
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          onAccountReady={() => {
            void handleAccountReady();
          }}
        />
      )}

      <ShareLinkDialog
        project={project}
        open={shareDialogOpen}
        autoCreate
        onOpenChange={(open) => {
          setShareDialogOpen(open);
          if (!open) onActivityChange?.();
        }}
      />
    </ProjectShareContext.Provider>
  );
}

export function ProjectShareHeaderRow({ children }: { children: ReactNode }) {
  const { headerSentinelRef } = useProjectShare();

  return (
    <div
      ref={headerSentinelRef}
      className="flex flex-wrap items-start justify-between gap-4"
    >
      {children}
    </div>
  );
}

export function ProjectShareHeaderActions({
  children,
}: {
  children?: ReactNode;
}) {
  const { mode, openShareDialog } = useProjectShare();

  return (
    <div className="flex items-center gap-2">
      {mode === "header" ? (
        <ShareLinkTriggerButton onClick={openShareDialog} />
      ) : null}
      {children}
    </div>
  );
}

export function ProjectShareInlineDock() {
  const { mode, animation, openShareDialog } = useProjectShare();

  if (mode !== "inline") return null;

  return (
    <div className={cn(animation === "inline" && "share-dock-inline-enter")}>
      <ShareLinkTriggerButton
        onClick={openShareDialog}
        className={mobileFullWidthCtaClassName}
      />
    </div>
  );
}

export function useProjectShareCopy() {
  const { shareSectionTitle, shareDescription } = useProjectShare();
  return { shareSectionTitle, shareDescription };
}

export function useProjectShareSectionVisibility(
  sentinelRef: RefObject<HTMLDivElement | null>
) {
  const { setSectionInView, setSectionObserved } = useProjectShare();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionObserved();
        setSectionInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      setSectionInView(false);
    };
  }, [sentinelRef, setSectionInView, setSectionObserved]);
}
