import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeVariant } from "@/lib/project-status";
import {
  formatProjectTypeLabel,
  PROJECT_STATUS_LABELS,
  type Project,
} from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition hover:border-neutral-300 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>{project.title}</CardTitle>
            <Badge variant={projectStatusBadgeVariant(project.status)}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--muted)]">
          <p>{formatProjectTypeLabel(project.project_type)}</p>
          <p>{formatProjectLocation(project)}</p>
          <p className="line-clamp-2 text-neutral-500">
            {project.ai_summary ?? project.original_description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
