"use client";

import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { Button } from "@/components/ui/button";

export function ReviewFooterActions({
  completing,
  onSubmitReview,
}: {
  completing: boolean;
  onSubmitReview: () => void;
}) {
  const { canEdit, saving, dirty, saveDraft } = useContractorEstimate();

  if (!canEdit) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={completing || saving} onClick={onSubmitReview}>
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
  );
}
