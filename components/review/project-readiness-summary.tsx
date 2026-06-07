import { SectionSurface } from "@/components/layout/page-section";
import type { ProjectReadinessSummary as ProjectReadinessSummaryData } from "@/lib/project/readiness-summary";

function ReadinessCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <SectionSurface className="space-y-1">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </SectionSurface>
  );
}

export function ProjectReadinessSummary({
  readiness,
}: {
  readiness: ProjectReadinessSummaryData;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <ReadinessCard
        label="Hoping to start"
        value={readiness.target_start ?? "—"}
      />
      <ReadinessCard
        label="Finish level"
        value={readiness.finish_level ?? "—"}
      />
      <ReadinessCard label="Location" value={readiness.location} />
    </div>
  );
}
