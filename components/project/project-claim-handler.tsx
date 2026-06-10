"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { claimGuestProjectClient } from "@/lib/project/claim-guest-project-client";
import { persistPendingShareDialog } from "@/lib/project/share-return-onboarding";

export function ProjectClaimHandler({
  projectId,
  isGuestProject,
}: {
  projectId: string;
  isGuestProject: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const claimStarted = useRef(false);

  useEffect(() => {
    if (
      !isGuestProject ||
      !isLoaded ||
      !isSignedIn ||
      searchParams.get("claim") !== "1"
    ) {
      return;
    }

    if (claimStarted.current) return;
    claimStarted.current = true;

    void (async () => {
      try {
        await claimGuestProjectClient(projectId, getToken);
      } catch {
        claimStarted.current = false;
        return;
      }

      if (searchParams.get("share") === "1") {
        persistPendingShareDialog(projectId);
      }

      router.replace(`/projects/${projectId}`);
    })();
  }, [getToken, isGuestProject, isLoaded, isSignedIn, projectId, router, searchParams]);

  return null;
}
