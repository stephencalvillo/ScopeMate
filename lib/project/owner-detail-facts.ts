import { isTimelineQuestion } from "@/lib/follow-up/timeline";
import {
  isExactDimensionAnswer,
  parseExactDimensionAnswer,
} from "@/lib/follow-up/dimension-answer";
import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import type { FollowUpQuestion } from "@/types";
import { Calendar, Paintbrush, Pencil, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function roomLabelFromQuestion(question: string) {
  if (/kitchen/i.test(question)) return "Kitchen";
  if (/bath/i.test(question)) return "Bathroom";
  return null;
}

export function formatOwnerDetailFact(
  question: FollowUpQuestion,
  projectType?: string
) {
  const answer = formatFollowUpAnswer(question, projectType);
  if (!answer) return "";

  if (isTimelineQuestion(question)) {
    return /looking to start/i.test(answer)
      ? answer
      : `Looking to start ${answer}`;
  }

  if (
    question.question_type === "dimension_estimate" &&
    question.answer &&
    isExactDimensionAnswer(question.answer)
  ) {
    const parsed = parseExactDimensionAnswer(question.answer);
    const room = roomLabelFromQuestion(question.question);
    if (parsed && room) {
      return `${room} : ~${parsed.sqFt.toLocaleString()} sq ft`;
    }
  }

  return answer;
}

export function ownerDetailIcon(
  question: FollowUpQuestion
): LucideIcon {
  if (isTimelineQuestion(question)) return Calendar;
  if (question.question_type === "dimension_estimate") {
    return /kitchen/i.test(question.question) ? Pencil : Ruler;
  }
  if (question.category === "materials") return Paintbrush;
  return Pencil;
}
