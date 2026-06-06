"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FollowUpQuestionCard } from "@/components/follow-up/follow-up-question-card";
import { FollowUpScopeAddedConfirmation } from "@/components/follow-up/follow-up-scope-added-confirmation";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import {
  fetchFollowUpQuestions,
  syncFollowUpAnswersToScope,
} from "@/lib/phase2/client";
import type { FollowUpQuestion } from "@/types";

const SCOPE_ADDED_VISIBLE_MS = 1500;
const SCOPE_ADDED_EXIT_MS = 250;

function isPending(question: FollowUpQuestion) {
  return !question.skipped && (question.answer === null || question.answer === "");
}

export function FollowUpQuestionsPanel({
  projectId,
  projectType,
}: {
  projectId: string;
  projectType?: string;
}) {
  const router = useRouter();
  const backfillStarted = useRef(false);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [showScopeAdded, setShowScopeAdded] = useState(false);
  const [scopeAddedExiting, setScopeAddedExiting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchFollowUpQuestions(projectId);
        if (!cancelled) setQuestions(result);
      } catch {
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (loading || backfillStarted.current) return;

    backfillStarted.current = true;

    syncFollowUpAnswersToScope(projectId)
      .then(() => router.refresh())
      .catch(() => {});
  }, [loading, projectId, router]);

  useEffect(() => {
    if (loading || initialized || questions.length === 0) return;

    const firstPending = questions.findIndex(isPending);
    setActiveIndex(firstPending >= 0 ? firstPending : 0);
    setInitialized(true);
  }, [loading, initialized, questions]);

  useEffect(() => {
    setActiveIndex((current) =>
      questions.length === 0 ? 0 : Math.min(current, questions.length - 1)
    );
  }, [questions.length]);

  useEffect(() => {
    if (!showScopeAdded) return;

    const exitTimer = window.setTimeout(() => {
      setScopeAddedExiting(true);
    }, SCOPE_ADDED_VISIBLE_MS);

    const hideTimer = window.setTimeout(() => {
      setShowScopeAdded(false);
      setScopeAddedExiting(false);
      setActiveIndex((current) =>
        current < questions.length - 1 ? current + 1 : current
      );
    }, SCOPE_ADDED_VISIBLE_MS + SCOPE_ADDED_EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showScopeAdded, questions.length]);

  function handleUpdated(updated: FollowUpQuestion) {
    setQuestions((current) => {
      const previous = current.find((q) => q.id === updated.id);
      const next = current.map((q) => (q.id === updated.id ? updated : q));

      if (previous && isPending(previous) && !isPending(updated)) {
        const hasAnswer = !updated.skipped && Boolean(updated.answer);

        if (hasAnswer) {
          setShowScopeAdded(true);
        } else if (activeIndex < next.length - 1) {
          setActiveIndex(activeIndex + 1);
        }
      }

      return next;
    });

    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking what might help contractors quote...
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const pendingCount = questions.filter(isPending).length;
  const allDone = pendingCount === 0;
  const activeQuestion = questions[activeIndex];
  const canGoPrev = activeIndex > 0 && !showScopeAdded;
  const canGoNext = activeIndex < questions.length - 1 && !showScopeAdded;

  return (
    <PageSection
      title="Follow-up questions"
      description={
        allDone
          ? undefined
          : "Optional - answer what you can, skip the rest. You can share your scope anytime."
      }
      action={
        !allDone ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm tabular-nums text-[var(--muted)] sm:inline">
              {pendingCount} left
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canGoPrev}
              aria-label="Previous question"
              onClick={() => setActiveIndex((current) => current - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canGoNext}
              aria-label="Next question"
              onClick={() => setActiveIndex((current) => current + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      }
    >
      {allDone ? (
        <SectionSurface>
          <p className="text-sm font-medium text-neutral-900">
            Well done. All questions answered. Your answers are in your scope
            items.
          </p>
        </SectionSurface>
      ) : showScopeAdded ? (
        <FollowUpScopeAddedConfirmation exiting={scopeAddedExiting} />
      ) : activeQuestion ? (
        <FollowUpQuestionCard
          key={activeQuestion.id}
          projectId={projectId}
          projectType={projectType}
          question={activeQuestion}
          onUpdated={handleUpdated}
        />
      ) : null}

      {!allDone && !showScopeAdded ? (
        <p className="text-right text-sm tabular-nums text-[var(--muted)] sm:hidden">
          {pendingCount} left
        </p>
      ) : null}
    </PageSection>
  );
}
