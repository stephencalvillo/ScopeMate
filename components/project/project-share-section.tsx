"use client";

import { useRef } from "react";
import {
  ProjectShareInlineDock,
  useProjectShareCopy,
  useProjectShareSectionVisibility,
} from "@/components/project/project-share-ui";
import { PageSection } from "@/components/layout/page-section";

export function ProjectShareSection() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { shareSectionTitle, shareDescription } = useProjectShareCopy();
  useProjectShareSectionVisibility(sentinelRef);

  return (
    <div className="relative">
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden
      />

      <PageSection title={shareSectionTitle} description={shareDescription}>
        <ProjectShareInlineDock />
      </PageSection>
    </div>
  );
}
