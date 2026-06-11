"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { reviewAuthenticatedFetch } from "@/lib/review/authenticated-review-fetch-client";
import { Button } from "@/components/ui/button";

export function ReviewSubmitActions({
  token,
  notes,
  onSubmitted,
}: {
  token: string;
  notes: string;
  onSubmitted: () => void | Promise<void>;
}) {
  const { getToken } = useAuth();
  const {
    canEdit,
    saving,
    dirty,
    hasPricing,
    saveDraft,
    persistDraftForReview,
    submitProposal,
  } = useContractorEstimate();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canEdit) {
    return null;
  }

  async function handleSubmitReview() {
    setCompleting(true);
    setError(null);

    try {
      const notesResponse = await reviewAuthenticatedFetch(getToken, token, "/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!notesResponse.ok) {
        const data = await notesResponse.json();
        throw new Error(data.error ?? "Could not save your notes.");
      }

      if (hasPricing) {
        await persistDraftForReview();
        await submitProposal();
      }

      const response = await reviewAuthenticatedFetch(getToken, token, "/complete", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Could not submit review.");
      }

      await onSubmitted();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit review."
      );
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={completing || saving}
          onClick={handleSubmitReview}
        >
          {completing ? "Submitting..." : "Submit review"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={saving || completing || !dirty}
          onClick={saveDraft}
        >
          {saving ? "Saving..." : "Save as draft"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
