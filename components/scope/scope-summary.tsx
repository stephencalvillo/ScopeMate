import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";

export function ScopeSummary({
  summary,
  headerAction,
}: {
  summary: string | null;
  headerAction?: React.ReactNode;
}) {
  if (!summary && !headerAction) return null;

  return (
    <PageSection title="Project summary" action={headerAction}>
      <SectionSurface>
        {summary ? (
          <p className="text-sm leading-6 text-neutral-800">{summary}</p>
        ) : null}
      </SectionSurface>
    </PageSection>
  );
}
