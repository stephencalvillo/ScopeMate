"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";

export function HomeownerReviewEntryPrompt({ token }: { token: string }) {
  const returnUrl = `/review/${token}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`;

  return (
    <SectionSurface className="mb-6 space-y-3 border-sky-200 bg-sky-50/80">
      <div className="space-y-1">
        <h2 className="font-display text-xl tracking-tight text-neutral-900">
          Are you the homeowner?
        </h2>
        <p className="text-sm text-[var(--muted)]">
          This link is for contractors to review your project. Sign in to open
          your project dashboard instead.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" asChild>
          <Link href={signInHref}>Sign in to your project</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={signUpHref}>Create account</Link>
        </Button>
      </div>
    </SectionSurface>
  );
}
