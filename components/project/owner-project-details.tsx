"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  formatOwnerDetailFact,
  ownerDetailIcon,
} from "@/lib/project/owner-detail-facts";
import { fetchFollowUpQuestions } from "@/lib/phase2/client";
import type { FollowUpQuestion } from "@/types";

export function OwnerProjectDetails({
  projectId,
  projectType,
  previewApiBase,
}: {
  projectId: string;
  projectType?: string;
  previewApiBase?: string;
}) {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (previewApiBase) {
          const response = await fetch(`${previewApiBase}/follow-up-questions`);
          const data = await response.json();
          if (!cancelled) {
            setQuestions(response.ok ? (data.questions ?? []) : []);
          }
        } else {
          const result = await fetchFollowUpQuestions(projectId);
          if (!cancelled) setQuestions(result);
        }
      } catch {
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [previewApiBase, projectId]);

  const facts = questions.filter(
    (question) => !question.skipped && Boolean(question.answer)
  );

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="font-display text-lg text-neutral-900">Details</h2>
        <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading details
        </p>
      </section>
    );
  }

  if (facts.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="font-display text-lg text-neutral-900">Details</h2>
        <p className="text-sm text-[var(--muted)]">No extra details yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-neutral-900">Details</h2>
      <ul className="space-y-3">
        {facts.map((question) => {
          const Icon = ownerDetailIcon(question);
          const label = formatOwnerDetailFact(question, projectType);
          if (!label) return null;

          return (
            <li key={question.id} className="flex items-start gap-2.5">
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
                aria-hidden
              />
              <p className="text-sm leading-5 text-neutral-900">{label}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
