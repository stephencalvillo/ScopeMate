"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ProjectDetailFactList } from "@/components/project/project-detail-fact-list";
import { listProjectDetailFacts } from "@/lib/project/project-detail-facts";
import { fetchFollowUpQuestions } from "@/lib/phase2/client";
import type { FollowUpQuestion } from "@/types";

export function OwnerProjectDetails({
  projectId,
  projectType,
  previewApiBase,
  followUpQuestions,
}: {
  projectId: string;
  projectType?: string;
  previewApiBase?: string;
  followUpQuestions?: FollowUpQuestion[];
}) {
  const { getToken, isSignedIn } = useAuth();
  const hasProvidedQuestions = followUpQuestions != null;
  const [questions, setQuestions] = useState<FollowUpQuestion[]>(
    followUpQuestions ?? []
  );
  const [loading, setLoading] = useState(!hasProvidedQuestions);

  useEffect(() => {
    if (!hasProvidedQuestions) return;
    setQuestions(followUpQuestions ?? []);
    setLoading(false);
  }, [followUpQuestions, hasProvidedQuestions]);

  useEffect(() => {
    if (hasProvidedQuestions) return;

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
          const result = await fetchFollowUpQuestions(
            projectId,
            isSignedIn ? getToken : undefined
          );
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
  }, [getToken, hasProvidedQuestions, isSignedIn, previewApiBase, projectId]);

  const facts = listProjectDetailFacts(questions, projectType);

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

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-neutral-900">Details</h2>
      {facts.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No extra details yet.</p>
      ) : (
        <ProjectDetailFactList facts={facts} />
      )}
    </section>
  );
}
