import type { ProjectDetailFact } from "@/lib/project/project-detail-facts";

export function ProjectDetailFactList({
  facts,
}: {
  facts: ProjectDetailFact[];
}) {
  if (facts.length === 0) return null;

  return (
    <ul className="space-y-3">
      {facts.map((fact) => (
        <li key={fact.id} className="space-y-0.5">
          <p className="text-sm text-[var(--muted)]">{fact.label}</p>
          <p className="text-sm leading-6 text-neutral-800">{fact.value}</p>
        </li>
      ))}
    </ul>
  );
}
