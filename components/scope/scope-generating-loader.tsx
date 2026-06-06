"use client";

import { useEffect, useRef, useState } from "react";
import { GridLoadingCard } from "@/components/marketing/grid-loading-card";
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
    <GridLoadingCard
      title={steps[stepIndex] ?? steps[steps.length - 1]}
      helperText={helperText}
      steps={steps}
      stepIndex={stepIndex}
    />
  );
}

export { ADD_MORE_STEPS, DEFAULT_STEPS };
