import {
  PageSection,
  SectionSurface,
} from "@/components/layout/page-section";

export function ScopeSummary({ summary }: { summary: string | null }) {
  if (!summary) return null;

  return (
    <PageSection title="Project summary">
      <SectionSurface>
        <p className="text-sm leading-6 text-neutral-800">{summary}</p>
      </SectionSurface>
    </PageSection>
  );
}
