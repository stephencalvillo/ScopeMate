"use client";

import { Loader2 } from "lucide-react";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";

const STEPS = [
  "Confirming your account",
  "Saving your business details",
  "Linking this project to you",
  "Opening your review workspace",
] as const;

export type ContractorShareLinkTransitionStep =
  | "session"
  | "profile"
  | "claim"
  | "load";

const STEP_INDEX: Record<ContractorShareLinkTransitionStep, number> = {
  session: 0,
  profile: 1,
  claim: 2,
  load: 3,
};

export function ContractorShareLinkTransitionScreen({
  projectTitle,
  step = "session",
}: {
  projectTitle?: string;
  step?: ContractorShareLinkTransitionStep;
}) {
  const stepIndex = STEP_INDEX[step];
  const activeStep = STEPS[stepIndex];

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <ScopeBuddyLogo className="mb-8 h-7 text-neutral-900" />

      <div className="w-full space-y-6 rounded-[8px] border border-[#e8e8e4] bg-white px-6 py-10 shadow-none">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-9 w-9 animate-spin text-neutral-900"
            aria-hidden
          />
          <div className="space-y-2">
            <p className="font-display text-2xl tracking-tight text-balance text-neutral-900">
              Setting up your project review
            </p>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {projectTitle
                ? `Getting ${projectTitle} ready for estimating. This usually takes a few seconds.`
                : "Getting this project ready for estimating. This usually takes a few seconds."}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-left">
          {STEPS.map((label, index) => {
            const isComplete = index < stepIndex;
            const isActive = index === stepIndex;

            return (
              <div
                key={label}
                className={`flex items-center gap-3 text-sm transition-colors ${
                  isActive
                    ? "font-medium text-neutral-900"
                    : isComplete
                      ? "text-neutral-600"
                      : "text-neutral-400"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                    isComplete
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : isActive
                        ? "border-neutral-900 text-neutral-900"
                        : "border-neutral-300 text-neutral-400"
                  }`}
                  aria-hidden
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span aria-current={isActive ? "step" : undefined}>{label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[var(--muted)]" aria-live="polite">
          {activeStep}…
        </p>
      </div>
    </div>
  );
}
