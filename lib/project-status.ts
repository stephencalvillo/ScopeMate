import type { ProjectStatus } from "@/types";

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
