"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { GridBackground } from "@/components/marketing/grid-background";
import {
  generateScopeClient,
  sleep,
} from "@/lib/scope/generate-scope-client";
import type { GenerateScopeResult } from "@/types";

const DEFAULT_STEPS = [
  "Reading your description...",
  "Organizing into a clear list of to-dos",
  "Finishing touches...",
] as const;

const ADD_MORE_STEPS = [
  "Reading what you added...",
  "Updating your scope list",
  "Finishing touches...",
] as const;

const STEP_DURATION_MS = 2000;

export function ScopeGeneratingLoader({
  projectId,
  onComplete,
  onError,
  additionalNotes,
  steps = DEFAULT_STEPS,
  helperText = "ScopeMate is turning your notes into contractor-ready work items.",
}: {
  projectId: string;
  onComplete: (result: GenerateScopeResult) => void;
  onError: (message: string) => void;
  additionalNotes?: string;
  steps?: readonly string[];
  helperText?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const generationPromise = generateScopeClient(projectId, {
        additional_notes: additionalNotes,
      }).catch((error) => {
        throw error instanceof Error
          ? error
          : new Error("Could not generate scope. Please try again.");
      });

      try {
        setStepIndex(0);
        await sleep(STEP_DURATION_MS);
        if (cancelled) return;

        setStepIndex(1);
        await sleep(STEP_DURATION_MS);
        if (cancelled) return;

        setStepIndex(2);
        const result = await generationPromise;
        if (cancelled) return;

        await sleep(400);
        if (cancelled) return;

        onCompleteRef.current(result);
      } catch (error) {
        if (cancelled) return;
        onErrorRef.current(
          error instanceof Error
            ? error.message
            : "Could not generate scope. Please try again."
        );
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [projectId, additionalNotes]);

  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--background)]">
      <GridBackground />
      <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center">
        <Loader2
          className="mb-6 h-10 w-10 animate-spin text-neutral-900"
          aria-hidden
        />
        <p className="font-display text-2xl tracking-tight text-neutral-900 text-balance">
          {steps[stepIndex] ?? steps[steps.length - 1]}
        </p>
        <p className="mt-3 max-w-md text-sm text-[var(--muted)]">{helperText}</p>
        <div className="mt-8 flex gap-2" aria-hidden>
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                index <= stepIndex ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { ADD_MORE_STEPS, DEFAULT_STEPS };
