"use client";

import { FollowUpAnswerButton } from "@/components/follow-up/follow-up-answer-button";
import { Label } from "@/components/ui/label";
import {
  TIMELINE_CHOICES,
  TIMELINE_QUESTION,
} from "@/lib/follow-up/timeline";

export function TimelineStartChoices({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{TIMELINE_QUESTION}</Label>
        <p className="text-sm text-[var(--muted)]">
          Optional — helps contractors understand your timeline.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TIMELINE_CHOICES.map((choice) => (
          <FollowUpAnswerButton
            key={choice}
            type="button"
            selected={value === choice}
            onClick={() => onChange(value === choice ? null : choice)}
          >
            {choice}
          </FollowUpAnswerButton>
        ))}
      </div>
    </div>
  );
}
