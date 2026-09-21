"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { FollowUpQuestionCard } from "@/components/follow-up/follow-up-question-card";
import { FollowUpScopeAddedConfirmation } from "@/components/follow-up/follow-up-scope-added-confirmation";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { dedupeFollowUpQuestionsForDisplay } from "@/lib/follow-up/dedupe-questions";
import {
  fetchFollowUpQuestions,
  syncFollowUpAnswersToScope,
} from "@/lib/phase2/client";
import type { FollowUpQuestion } from "@/types";

const SCOPE_ADDED_VISIBLE_MS = 1500;
const SCOPE_ADDED_EXIT_MS = 250;

function isUnanswered(question: FollowUpQuestion) {
  return question.answer === null || question.answer === "";
}

function isPending(question: FollowUpQuestion) {
  return !question.skipped && isUnanswered(question);
}

function asReopenable(question: FollowUpQuestion): FollowUpQuestion {
  return question.skipped && isUnanswered(question)
    ? { ...question, skipped: false }
    : question;
}

function toDisplayQuestions(
  list: FollowUpQuestion[],
  reopenSkipped: boolean
) {
  const deduped = dedupeFollowUpQuestionsForDisplay(list);
  return reopenSkipped ? deduped.map(asReopenable) : deduped;
}

type FollowUpQuestionsState = {
  loading: boolean;
  questions: FollowUpQuestion[];
  pendingCount: number;
  allDone: boolean;
  activeIndex: number;
  setActiveIndex: (value: number | ((current: number) => number)) => void;
  activeQuestion: FollowUpQuestion | undefined;
  canGoPrev: boolean;
  canGoNext: boolean;
  showScopeAdded: boolean;
  scopeAddedExiting: boolean;
  handleUpdated: (updated: FollowUpQuestion) => void;
};

function useFollowUpQuestions(
  projectId: string,
  { reopenSkipped = false }: { reopenSkipped?: boolean } = {}
): FollowUpQuestionsState {
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

        if (!cancelled) {
          setQuestions(toDisplayQuestions(result, reopenSkipped));
        }
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
  }, [projectId, reopenSkipped]);

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
      const next = toDisplayQuestions(
        current.map((q) => (q.id === updated.id ? updated : q)),
        reopenSkipped
      );

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

  const pendingCount = questions.filter(isPending).length;
  const allDone = pendingCount === 0;
  const activeQuestion = questions[activeIndex];
  const canGoPrev = activeIndex > 0 && !showScopeAdded;
  const canGoNext = activeIndex < questions.length - 1 && !showScopeAdded;

  return {
    loading,
    questions,
    pendingCount,
    allDone,
    activeIndex,
    setActiveIndex,
    activeQuestion,
    canGoPrev,
    canGoNext,
    showScopeAdded,
    scopeAddedExiting,
    handleUpdated,
  };
}

function FollowUpQuestionsNav({
  pendingCount,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  showCount = true,
}: {
  pendingCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  showCount?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {showCount ? (
        <span className="text-sm tabular-nums text-[var(--muted)]">
          {pendingCount} left
        </span>
      ) : (
        <span className="hidden text-sm tabular-nums text-[var(--muted)] sm:inline">
          {pendingCount} left
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!canGoPrev}
        aria-label="Previous question"
        onClick={onPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!canGoNext}
        aria-label="Next question"
        onClick={onNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FollowUpQuestionsBody({
  projectId,
  projectType,
  followUp,
  inlineNav,
  showMobileCount,
  showSkip = true,
  showCompletionState = true,
  scopeAddedMessage,
}: {
  projectId: string;
  projectType?: string;
  followUp: FollowUpQuestionsState;
  inlineNav?: ReactNode;
  showMobileCount?: boolean;
  showSkip?: boolean;
  showCompletionState?: boolean;
  scopeAddedMessage?: string;
}) {
  const {
    loading,
    questions,
    pendingCount,
    allDone,
    activeQuestion,
    showScopeAdded,
    scopeAddedExiting,
    handleUpdated,
  } = followUp;

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking what might help contractors quote...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No extra questions for this project.
      </p>
    );
  }

  return (
    <>
      {inlineNav ? <div className="mb-4 flex justify-end">{inlineNav}</div> : null}
      {allDone && showCompletionState ? (
        showSkip &&
        questions.some(
          (question) => !question.skipped && Boolean(question.answer)
        ) ? (
          <SectionSurface>
            <p className="text-sm font-medium text-neutral-900">
              Well done. All questions answered. Your answers are in your scope
              items.
            </p>
          </SectionSurface>
        ) : null
      ) : showScopeAdded ? (
        <FollowUpScopeAddedConfirmation
          exiting={scopeAddedExiting}
          message={scopeAddedMessage}
        />
      ) : activeQuestion ? (
        <FollowUpQuestionCard
          key={activeQuestion.id}
          projectId={projectId}
          projectType={projectType}
          question={activeQuestion}
          onUpdated={handleUpdated}
          showSkip={showSkip}
        />
      ) : null}

      {showMobileCount && !allDone && !showScopeAdded ? (
        <p className="text-right text-sm tabular-nums text-[var(--muted)] sm:hidden">
          {pendingCount} left
        </p>
      ) : null}
    </>
  );
}

function followUpNav(followUp: FollowUpQuestionsState, showCount: boolean) {
  if (followUp.loading || followUp.allDone || followUp.questions.length === 0) {
    return null;
  }

  return (
    <FollowUpQuestionsNav
      pendingCount={followUp.pendingCount}
      canGoPrev={followUp.canGoPrev}
      canGoNext={followUp.canGoNext}
      showCount={showCount}
      onPrev={() => followUp.setActiveIndex((current) => current - 1)}
      onNext={() => followUp.setActiveIndex((current) => current + 1)}
    />
  );
}

export function useFollowUpConfirmStep(
  projectId: string,
  projectType?: string
) {
  const followUp = useFollowUpQuestions(projectId, { reopenSkipped: true });
  const canSkipAll =
    !followUp.loading &&
    !followUp.allDone &&
    followUp.questions.length > 0;

  return {
    confirmStart: canSkipAll
      ? ({ confirm }: { confirm: () => void }) => (
          <button
            type="button"
            className="text-sm text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-neutral-900"
            onClick={() => confirm()}
          >
            Skip all questions
          </button>
        )
      : null,
    content: (
      <FollowUpQuestionsBody
        projectId={projectId}
        projectType={projectType}
        followUp={followUp}
        showSkip={false}
        showCompletionState={false}
        scopeAddedMessage="Saved to your project snapshot"
      />
    ),
    answeredQuestions: followUp.questions.filter(
      (question) => !question.skipped && Boolean(question.answer)
    ),
  };
}

export function FollowUpQuestionsPanel({
  projectId,
  projectType,
  embedded = false,
}: {
  projectId: string;
  projectType?: string;
  embedded?: boolean;
}) {
  const followUp = useFollowUpQuestions(projectId);
  const nav = followUpNav(followUp, embedded);

  if (followUp.loading) {
    return (
      <FollowUpQuestionsBody
        projectId={projectId}
        projectType={projectType}
        followUp={followUp}
      />
    );
  }

  if (followUp.questions.length === 0) {
    if (embedded) {
      return (
        <FollowUpQuestionsBody
          projectId={projectId}
          projectType={projectType}
          followUp={followUp}
        />
      );
    }
    return null;
  }

  const body = (
    <FollowUpQuestionsBody
      projectId={projectId}
      projectType={projectType}
      followUp={followUp}
      inlineNav={embedded ? nav : undefined}
      showMobileCount={!embedded || Boolean(nav)}
    />
  );

  if (embedded) {
    return body;
  }

  return (
    <PageSection
      title="Follow-up questions"
      description={
        followUp.allDone
          ? undefined
          : "Optional - answer what you can, skip the rest. You can share your scope anytime."
      }
      action={nav}
    >
      {body}
    </PageSection>
  );
}
