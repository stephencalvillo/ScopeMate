"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProjectSetupLoadingCard } from "@/components/project/project-setup-loading-card";
import { persistGuestProjectToken } from "@/lib/auth/guest-project-session";
import {
  ensureGuestProjectClaimed,
  fetchProjectWithScopeClient,
} from "@/lib/project/load-project-client";
import {
  clearSignupShareIntent,
  persistPendingShareDialog,
  persistSignupShareIntent,
  readSignupShareIntent,
} from "@/lib/project/share-return-onboarding";

type SetupStep = "session" | "claim" | "load" | "redirect" | "error";

const STEP_COPY: Record<
  Exclude<SetupStep, "error">,
  { title: string; description: string }
> = {
  session: {
    title: "Welcome to ScopeBuddy",
    description: "Finishing your account setup…",
  },
  claim: {
    title: "Saving your project",
    description: "Connecting this project to your new account…",
  },
  load: {
    title: "Loading your project",
    description: "Getting your scope ready…",
  },
  redirect: {
    title: "Almost there",
    description: "Opening your project page…",
  },
};

export function PostSignupProjectSetup({
  projectId,
  openShare,
  guestToken,
}: {
  projectId: string;
  openShare: boolean;
  guestToken?: string | null;
}) {
  const router = useRouter();
  const { isLoaded, getToken } = useAuth();
  const started = useRef(false);
  const [step, setStep] = useState<SetupStep>("session");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || started.current) return;
    started.current = true;

    const shouldOpenShare =
      openShare || readSignupShareIntent(projectId);

    if (guestToken) {
      persistGuestProjectToken(projectId, guestToken);
    }

    void (async () => {
      try {
        setStep("session");
        setStep("claim");
        await ensureGuestProjectClaimed(projectId, getToken, guestToken);

        setStep("load");
        await fetchProjectWithScopeClient(projectId, getToken);

        if (shouldOpenShare) {
          persistPendingShareDialog(projectId);
          clearSignupShareIntent();
        }

        setStep("redirect");
        router.replace(`/projects/${projectId}`);
      } catch (setupError) {
        setStep("error");
        setError(
          setupError instanceof Error
            ? setupError.message
            : "Could not finish setting up your project."
        );
      }
    })();
  }, [getToken, guestToken, isLoaded, openShare, projectId, router]);

  if (step === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ProjectSetupLoadingCard
          title="Something went wrong"
          description={error ?? "Could not finish setting up your project."}
        />
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace(`/projects/${projectId}`)}
          >
            Go to project
          </Button>
        </div>
      </div>
    );
  }

  const copy = STEP_COPY[step];
  return (
    <ProjectSetupLoadingCard
      title={copy.title}
      description={copy.description}
    />
  );
}
