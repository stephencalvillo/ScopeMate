"use client";

import { useMemo, useState } from "react";
import { FollowUpAnswerButton } from "@/components/follow-up/follow-up-answer-button";
import { Input } from "@/components/ui/input";
import { DimensionEstimateButtons } from "@/components/follow-up/dimension-estimate-buttons";
import { DimensionCustomInput } from "@/components/follow-up/dimension-custom-input";
import { FollowUpOtherInput } from "@/components/follow-up/follow-up-other-input";
import { SectionSurface } from "@/components/layout/page-section";
import {
  FOLLOW_UP_OTHER_LABEL,
  isOtherChoice,
} from "@/lib/follow-up/constants";
import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import {
  FINISH_LEVEL_PLANNING_NOTE,
  isFinishLevelMaterialsQuestion,
} from "@/lib/follow-up/finish-level";
import { answerFollowUpQuestion } from "@/lib/phase2/client";
import type { FollowUpQuestion } from "@/types";

function withOtherChoice(choices: string[]): string[] {
  if (choices.some((choice) => isOtherChoice(choice))) {
    return choices;
  }

  return [...choices, FOLLOW_UP_OTHER_LABEL];
}

export function FollowUpQuestionCard({
  projectId,
  projectType,
  question,
  onUpdated,
}: {
  projectId: string;
  projectType?: string;
  question: FollowUpQuestion;
  onUpdated: (question: FollowUpQuestion) => void;
}) {
  const [textAnswer, setTextAnswer] = useState(question.answer ?? "");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showCustomDimensions, setShowCustomDimensions] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnswered = question.skipped || Boolean(question.answer);
  const isPending =
    !question.skipped && (question.answer === null || question.answer === "");

  const choiceOptions = useMemo(() => {
    if (question.question_type !== "choice" || !question.choices) {
      return [];
    }

    if (isFinishLevelMaterialsQuestion(question)) {
      return question.choices;
    }

    return withOtherChoice(question.choices);
  }, [question.choices, question.question_type, question.category, question.question]);

  async function saveAnswer(answer: string) {
    setSaving(true);
    setError(null);
    try {
      const result = await answerFollowUpQuestion(projectId, question.id, {
        answer,
      });
      setPendingChoice(null);
      setShowOtherInput(false);
      setShowCustomDimensions(false);
      onUpdated(result.question);
    } catch (err) {
      setPendingChoice(null);
      setError(
        err instanceof Error ? err.message : "Could not save your answer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function skip() {
    setSaving(true);
    setError(null);
    try {
      const result = await answerFollowUpQuestion(projectId, question.id, {
        skipped: true,
      });
      setShowOtherInput(false);
      setShowCustomDimensions(false);
      onUpdated(result.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not skip question.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionSurface className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-900">{question.question}</p>
        {isPending && isFinishLevelMaterialsQuestion(question) ? (
          <p className="text-sm text-[var(--muted)]">{FINISH_LEVEL_PLANNING_NOTE}</p>
        ) : null}
        {isAnswered && question.answer ? (
          <p className="text-sm text-[var(--muted)]">
            Your answer: {formatFollowUpAnswer(question, projectType)}
          </p>
        ) : question.skipped ? (
          <p className="text-sm text-[var(--muted)]">Skipped for now</p>
        ) : null}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {showOtherInput ? (
            <FollowUpOtherInput
              disabled={saving}
              placeholder="Type your answer"
              onSave={saveAnswer}
              onCancel={() => setShowOtherInput(false)}
            />
          ) : null}

          {!showOtherInput && question.question_type === "text" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Your answer"
                disabled={saving}
                className="max-w-md"
              />
              <FollowUpAnswerButton
                disabled={saving || !textAnswer.trim()}
                onClick={() => saveAnswer(textAnswer.trim())}
              >
                Save
              </FollowUpAnswerButton>
              <button
                type="button"
                disabled={saving}
                onClick={skip}
                className="ml-auto shrink-0 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          ) : null}

          {!showOtherInput && question.question_type === "choice" ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {choiceOptions.map((choice) => (
                  <FollowUpAnswerButton
                    key={choice}
                    selected={pendingChoice === choice}
                    disabled={saving}
                    onClick={() => {
                      if (isOtherChoice(choice)) {
                        setShowOtherInput(true);
                        return;
                      }

                      setPendingChoice(choice);
                      void saveAnswer(choice);
                    }}
                  >
                    {choice}
                  </FollowUpAnswerButton>
                ))}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={skip}
                className="ml-auto shrink-0 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          ) : null}

          {!showOtherInput && !showCustomDimensions && question.question_type === "dimension_estimate" ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                <DimensionEstimateButtons
                  value={textAnswer}
                  disabled={saving}
                  projectType={projectType}
                  onChange={(value) => {
                    setTextAnswer(value);
                    void saveAnswer(value);
                  }}
                  onCustomDimensions={() => setShowCustomDimensions(true)}
                />
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={skip}
                className="ml-auto shrink-0 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          ) : null}

          {showCustomDimensions ? (
            <DimensionCustomInput
              disabled={saving}
              onSave={saveAnswer}
              onCancel={() => setShowCustomDimensions(false)}
            />
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </SectionSurface>
  );
}
