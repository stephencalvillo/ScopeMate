"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export function ProjectClaimHandler({
  projectId,
  isGuestProject,
}: {
  projectId: string;
  isGuestProject: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const claimStarted = useRef(false);

  useEffect(() => {
    if (!isGuestProject || !isSignedIn || searchParams.get("claim") !== "1") {
      return;
    }

    if (claimStarted.current) return;
    claimStarted.current = true;

    void (async () => {
      const response = await fetch(`/api/projects/${projectId}/claim`, {
        method: "POST",
      });

      if (response.ok) {
        router.replace(`/projects/${projectId}?share=1`);
        router.refresh();
      }
    })();
  }, [isGuestProject, isSignedIn, projectId, router, searchParams]);

  return null;
}
