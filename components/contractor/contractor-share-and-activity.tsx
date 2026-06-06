"use client";

import { useState } from "react";
import { ContractorShareSection } from "@/components/contractor/contractor-share-section";
import { ProjectActivitySection } from "@/components/project/project-activity-section";
import type { Project } from "@/types";

export function ContractorShareAndActivity({ project }: { project: Project }) {
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  return (
    <>
      <ContractorShareSection
        project={project}
        onActivityChange={() =>
          setActivityRefreshKey((current) => current + 1)
        }
      />
      <ProjectActivitySection
        projectId={project.id}
        refreshKey={activityRefreshKey}
      />
    </>
  );
}
