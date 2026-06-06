"use client";

import { useRef } from "react";
import {
  ProjectShareInlineDock,
  useProjectShareSectionVisibility,
} from "@/components/project/project-share-ui";
import { PageSection } from "@/components/layout/page-section";

export function ContractorShareSection() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  useProjectShareSectionVisibility(sentinelRef);

  return (
    <div className="relative">
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden
      />

      <PageSection
        title="Share with a contractor"
        description="Create a review link to copy or email. Contractors can review your scope and suggest changes without signing in."
      >
        <ProjectShareInlineDock />
      </PageSection>
    </div>
  );
}
