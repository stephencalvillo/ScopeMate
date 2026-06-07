"use client";

import { useContractorEstimate } from "@/components/estimate/contractor-estimate-context";
import { Button } from "@/components/ui/button";
import { mobileFullWidthCtaClassName } from "@/lib/utils";

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
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        className={mobileFullWidthCtaClassName}
        disabled={completing || saving}
        onClick={onSubmitReview}
      >
        {completing ? "Submitting..." : "Submit review"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={mobileFullWidthCtaClassName}
        disabled={saving || completing || !dirty}
        onClick={saveDraft}
      >
        {saving ? "Saving..." : "Save as draft"}
      </Button>
    </div>
  );
}
