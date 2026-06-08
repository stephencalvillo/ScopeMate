"use client";

import { FollowUpAnswerButton } from "@/components/follow-up/follow-up-answer-button";
import {
  DIMENSION_OPTIONS,
  getDimensionLabels,
} from "@/lib/follow-up/dimension-labels";
import { DIMENSION_CUSTOM_LABEL } from "@/lib/follow-up/dimension-answer";

export function DimensionEstimateButtons({
  value,
  onChange,
  onCustomDimensions,
  disabled,
  projectType,
  questionText,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  onCustomDimensions?: () => void;
  disabled?: boolean;
  projectType?: string;
  questionText?: string;
}) {
  const labels = getDimensionLabels(projectType, questionText);

  return (
    <>
      {DIMENSION_OPTIONS.map((option) => (
        <FollowUpAnswerButton
          key={option}
          selected={value === option}
          disabled={disabled}
          onClick={() => onChange(option)}
        >
          {labels[option]}
        </FollowUpAnswerButton>
      ))}
      {onCustomDimensions ? (
        <FollowUpAnswerButton disabled={disabled} onClick={onCustomDimensions}>
          {DIMENSION_CUSTOM_LABEL}
        </FollowUpAnswerButton>
      ) : null}
    </>
  );
}
