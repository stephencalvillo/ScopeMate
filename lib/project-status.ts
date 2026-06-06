import {
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectStatus,
} from "@/types";

export function projectStatusBadgeVariant(status: ProjectStatus) {
  switch (status) {
    case "shared":
      return "success" as const;
    case "scope_ready":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function projectHasAcceptedProposal(
  project: Pick<Project, "accepted_estimate_id">
) {
  return Boolean(project.accepted_estimate_id);
}

export function projectStatusBadgeProps(
  project: Pick<Project, "accepted_estimate_id"> &
    Partial<Pick<Project, "status">>
) {
  if (projectHasAcceptedProposal(project)) {
    return { label: "Accepted", variant: "success" as const };
  }

  const status = project.status ?? "draft";

  return {
    label: PROJECT_STATUS_LABELS[status],
    variant: projectStatusBadgeVariant(status),
  };
}
