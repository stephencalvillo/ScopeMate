"use client";

import { useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { getClerkAppearance } from "@/lib/clerk/appearance";
import { normalizeAuthRedirectUrlClient } from "@/lib/auth/normalize-redirect-url";
import { readShareLinkReturn } from "@/lib/contractor/share-link-onboarding";

function resolveSignedInRedirect(fallbackRedirect: string) {
  const shareReturn = readShareLinkReturn();
  if (shareReturn?.startsWith("/review/")) {
    return "/contractor/complete-setup";
  }
  return fallbackRedirect;
}

export function AuthSignInForm({ redirectUrl }: { redirectUrl: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const safeRedirect = normalizeAuthRedirectUrlClient(redirectUrl);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    window.location.assign(resolveSignedInRedirect(safeRedirect));
  }, [isLoaded, isSignedIn, safeRedirect]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="w-full rounded-[8px] border border-[#e8e8e4] bg-white px-6 py-10 text-center shadow-none">
        <p className="text-sm text-neutral-600">Redirecting…</p>
      </div>
    );
  }

  return (
    <SignIn
      routing="hash"
      signUpUrl="/sign-up"
      appearance={getClerkAppearance()}
      fallbackRedirectUrl={safeRedirect}
      forceRedirectUrl={safeRedirect}
    />
  );
}
