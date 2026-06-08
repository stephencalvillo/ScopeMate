"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";

export function HomeownerReviewEntryPrompt({
  token,
  variant = "homeowner-project",
}: {
  token: string;
  variant?: "homeowner-project" | "contractor-shared";
}) {
  const returnUrl = `/review/${token}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`;
  const isContractorShared = variant === "contractor-shared";

  return (
    <SectionSurface className="mb-6 space-y-3 border-sky-200 bg-sky-50/80">
      <div className="space-y-1">
        <h2 className="font-display text-xl tracking-tight text-neutral-900">
          {isContractorShared
            ? "Your contractor shared a project with you"
            : "Are you the homeowner?"}
        </h2>
        <p className="text-sm text-[var(--muted)]">
          {isContractorShared
            ? "Create a free homeowner account to save this scope, suggest changes, and keep everything in one place."
            : "This link is for contractors to review your project. Sign in to open your project dashboard instead."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" asChild>
          <Link href={signUpHref}>
            {isContractorShared ? "Create homeowner account" : "Create account"}
          </Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={signInHref}>Sign in</Link>
        </Button>
      </div>
    </SectionSurface>
  );
}
