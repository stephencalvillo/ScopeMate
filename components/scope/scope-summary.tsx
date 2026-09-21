import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";

export function ScopeSummary({
  summary,
  headerAction,
  embedded = false,
}: {
  summary: string | null;
  headerAction?: React.ReactNode;
  embedded?: boolean;
}) {
  if (!summary && !headerAction) return null;

  const body = summary ? (
    <p className="text-sm leading-6 text-neutral-800">{summary}</p>
  ) : null;

  if (embedded) {
    return body;
  }

  return (
    <PageSection title="Project summary" action={headerAction}>
      <SectionSurface>{body}</SectionSurface>
    </PageSection>
  );
}
