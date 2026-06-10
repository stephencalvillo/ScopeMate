"use client";

import { useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { ClerkCaptcha } from "@/components/auth/clerk-captcha";
import { getClerkAppearance } from "@/lib/clerk/appearance";
import { persistSignupShareIntent } from "@/lib/project/share-return-onboarding";

function normalizeSignupRedirectUrl(redirectUrl: string) {
  const path = redirectUrl.split("?")[0]?.trim() || "/projects";
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/projects";
  }
  return path;
}

function projectIdFromSetupRedirect(redirectPath: string): string | null {
  const match = redirectPath.match(/^\/projects\/([^/]+)\/setup$/);
  return match?.[1] ?? null;
}

export function AuthSignUpForm({ redirectUrl }: { redirectUrl: string }) {
  const redirectPath = normalizeSignupRedirectUrl(redirectUrl);

  useEffect(() => {
    const projectId = projectIdFromSetupRedirect(redirectPath);
    if (projectId) {
      persistSignupShareIntent(projectId);
    }
  }, [redirectPath]);

  return (
    <div className="flex w-full flex-col gap-4">
      <ClerkCaptcha />
      <SignUp
        routing="hash"
        signInUrl="/sign-in"
        appearance={{
          ...getClerkAppearance(),
          captcha: {
            theme: "light",
            size: "flexible",
          },
        }}
        fallbackRedirectUrl={redirectPath}
        forceRedirectUrl={redirectPath}
      />
    </div>
  );
}
