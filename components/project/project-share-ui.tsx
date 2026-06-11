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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Link2 } from "lucide-react";
import { ContractorProjectAccountDialog } from "@/components/project/contractor-project-account-dialog";
import { HomeownerAccountCreateDialog } from "@/components/project/homeowner-account-create-dialog";
import { ShareLinkDialog } from "@/components/project/share-link-dialog-content";
import { SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { getProjectShareCopy } from "@/lib/project/share-copy";
import { claimGuestProjectClient } from "@/lib/project/claim-guest-project-client";
import {
  clearPendingShareDialog,
  persistPendingShareDialog,
  readPendingShareDialog,
} from "@/lib/project/share-return-onboarding";
import { resolveProjectDetailPath } from "@/lib/project/project-detail-path";
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
  onCompleteShareReturn,
}: {
  onCompleteShareReturn: () => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (searchParams.get("share") !== "1") return;
    if (!isLoaded || !isSignedIn) return;

    started.current = true;

    void onCompleteShareReturn().catch((error) => {
      started.current = false;
      console.error(error);
    });
  }, [isLoaded, isSignedIn, onCompleteShareReturn, searchParams]);

  return null;
}

function ProjectSharePendingHandler({
  projectId,
  onOpenShareLink,
}: {
  projectId: string;
  onOpenShareLink: () => void;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    if (!isLoaded || !isSignedIn) return;
    if (!readPendingShareDialog(projectId)) return;

    opened.current = true;
    clearPendingShareDialog();
    onOpenShareLink();
  }, [isLoaded, isSignedIn, onOpenShareLink, projectId]);

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
  const pathname = usePathname();
  const { isLoaded, isSignedIn, getToken } = useAuth();
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
  const [shareError, setShareError] = useState<string | null>(null);
  const [isClaimingProject, setIsClaimingProject] = useState(false);
  const [animation, setAnimation] = useState<DockAnimation>(null);

  const hasObserved = headerObserved || sectionObserved;
  const mode: DockMode = sectionInView
    ? "inline"
    : hasObserved && !headerInView
      ? "float"
      : "header";

  const claimProject = useCallback(async () => {
    setIsClaimingProject(true);
    try {
      await claimGuestProjectClient(project.id, getToken);
    } finally {
      setIsClaimingProject(false);
    }
  }, [getToken, project.id]);

  const cleanShareReturnUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (
      !params.has("share") &&
      !params.has("claim") &&
      !params.has("guest_token")
    ) {
      return;
    }
    router.replace(resolveProjectDetailPath(pathname, project.id), {
      scroll: false,
    });
  }, [pathname, project.id, router]);

  const openShareLinkDialog = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  const finishGuestShareOnboarding = useCallback(() => {
    persistPendingShareDialog(project.id);
    cleanShareReturnUrl();
    openShareLinkDialog();
  }, [cleanShareReturnUrl, openShareLinkDialog, project.id]);

  const completeShareReturn = useCallback(async () => {
    setShareError(null);

    if (isGuestProject) {
      await claimProject();
      finishGuestShareOnboarding();
      return;
    }

    cleanShareReturnUrl();
    openShareLinkDialog();
  }, [
    claimProject,
    cleanShareReturnUrl,
    finishGuestShareOnboarding,
    isGuestProject,
    openShareLinkDialog,
  ]);

  const openShareDialog = useCallback(async () => {
    setShareError(null);

    if (isGuestProject) {
      if (!isLoaded || !isSignedIn) {
        if (!isLoaded) return;
        setAccountDialogOpen(true);
        return;
      }

      await claimProject();
      finishGuestShareOnboarding();
      return;
    }

    cleanShareReturnUrl();
    openShareLinkDialog();
  }, [
    claimProject,
    cleanShareReturnUrl,
    finishGuestShareOnboarding,
    isGuestProject,
    isLoaded,
    isSignedIn,
    openShareLinkDialog,
  ]);

  const handleAccountReady = useCallback(async () => {
    if (isGuestProject) {
      await claimProject();
      finishGuestShareOnboarding();
      return;
    }

    openShareLinkDialog();
  }, [claimProject, finishGuestShareOnboarding, isGuestProject, openShareLinkDialog]);

  const completeShareReturnRef = useCallback((): Promise<void> => {
    return completeShareReturn().catch((error) => {
      setShareError(
        error instanceof Error
          ? error.message
          : "Could not open the share link."
      );
      throw error;
    });
  }, [completeShareReturn]);

  const openShareDialogRef = useCallback(() => {
    return openShareDialog().catch((error) => {
      setShareError(
        error instanceof Error
          ? error.message
          : "Could not open the share link."
      );
      throw error;
    });
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
      {shareError ? (
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {shareError}
        </div>
      ) : null}

      {isClaimingProject ? (
        <div className="rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm text-[var(--muted)]">
          Saving this project to your account...
        </div>
      ) : null}

      {children}

      <Suspense fallback={null}>
        <ProjectShareReturnHandler onCompleteShareReturn={completeShareReturnRef} />
        <ProjectSharePendingHandler
          projectId={project.id}
          onOpenShareLink={openShareLinkDialog}
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
