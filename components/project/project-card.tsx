import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProjectLocation } from "@/lib/location/parse";
import { projectStatusBadgeProps } from "@/lib/project-status";
import { formatProjectTypeLabel, type Project } from "@/types";

export function ProjectCard({
  project,
  href,
  showProjectType = true,
  aiSummaryOnly = false,
  proposalRange,
}: {
  project: Pick<
    Project,
    | "id"
    | "title"
    | "project_type"
    | "city"
    | "zip"
    | "location"
    | "ai_summary"
    | "original_description"
    | "accepted_estimate_id"
  >;
  href?: string;
  showProjectType?: boolean;
  aiSummaryOnly?: boolean;
  proposalRange?: string | null;
}) {
  const statusBadge = projectStatusBadgeProps(project);
  const summary = aiSummaryOnly
    ? project.ai_summary
    : (project.ai_summary ?? project.original_description);

  return (
    <Link href={href ?? `/projects/${project.id}`}>
      <Card className="transition hover:border-neutral-300 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>{project.title}</CardTitle>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--muted)]">
          {showProjectType ? (
            <p>{formatProjectTypeLabel(project.project_type)}</p>
          ) : null}
          <p>{formatProjectLocation(project)}</p>
          {proposalRange ? (
            <p className="font-medium text-neutral-900">{proposalRange}</p>
          ) : null}
          {summary ? (
            <p className="line-clamp-2 text-neutral-500">{summary}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
