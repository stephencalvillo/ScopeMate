"use client";

import { usePathname } from "next/navigation";
import { resolveProjectDetailPath } from "@/lib/project/project-detail-path";

export function useProjectDetailPath(projectId: string): string {
  const pathname = usePathname();
  return resolveProjectDetailPath(pathname, projectId);
}
