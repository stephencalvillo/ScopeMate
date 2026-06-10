"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  clearGuestProjectToken,
  readGuestProjectToken,
} from "@/lib/auth/guest-project-session";

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
  const { isSignedIn } = useAuth();
  const claimStarted = useRef(false);

  useEffect(() => {
    if (!isGuestProject || !isSignedIn || searchParams.get("claim") !== "1") {
      return;
    }

    if (claimStarted.current) return;
    claimStarted.current = true;

    void (async () => {
      const guestToken = readGuestProjectToken(projectId);
      const response = await fetch(`/api/projects/${projectId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(guestToken ? { guest_token: guestToken } : {}),
        }),
      });

      if (!response.ok) {
        claimStarted.current = false;
        return;
      }

      clearGuestProjectToken(projectId);

      if (searchParams.get("share") === "1") {
        await onClaimed?.();
        router.replace(`/projects/${projectId}`);
        return;
      }

      router.replace(`/projects/${projectId}`);
      router.refresh();
    })();
  }, [
    isGuestProject,
    isSignedIn,
    onClaimed,
    projectId,
    router,
    searchParams,
  ]);

  return null;
}
