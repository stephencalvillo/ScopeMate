import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";

export function ScopeSummary({
  summary,
  action,
}: {
  summary: string | null;
  action?: React.ReactNode;
}) {
  if (!summary && !action) return null;

  return (
    <PageSection title="Project summary">
      <SectionSurface className="space-y-4">
        {summary ? (
          <p className="text-sm leading-6 text-neutral-800">{summary}</p>
        ) : null}
        {action}
      </SectionSurface>
    </PageSection>
  );
}
