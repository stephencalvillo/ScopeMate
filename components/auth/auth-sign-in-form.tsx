"use client";

import { SignIn } from "@clerk/nextjs";
import { getClerkAppearance } from "@/lib/clerk/appearance";

export function AuthSignInForm({ redirectUrl }: { redirectUrl: string }) {
  return (
    <SignIn
      routing="hash"
      signUpUrl="/sign-up"
      appearance={getClerkAppearance()}
      fallbackRedirectUrl={redirectUrl}
      forceRedirectUrl={redirectUrl}
    />
  );
}
