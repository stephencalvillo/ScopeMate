"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { claimGuestProjectClient } from "@/lib/project/claim-guest-project-client";

export function ProjectClaimHandler({
  projectId,
  isGuestProject,
  onClaimed,
}: {
  projectId: string;
  isGuestProject: boolean;
  onClaimed?: () => void | Promise<void>;
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
        await onClaimed?.();
        router.replace(`/projects/${projectId}`);
        return;
      }

      router.replace(`/projects/${projectId}`);
      router.refresh();
    })();
  }, [
    getToken,
    isGuestProject,
    isLoaded,
    isSignedIn,
    onClaimed,
    projectId,
    router,
    searchParams,
  ]);

  return null;
}
