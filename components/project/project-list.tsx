import Link from "next/link";
import { ProjectCard } from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import { SectionSurface } from "@/components/layout/page-section";
import type { Project } from "@/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <SectionSurface className="space-y-2">
        <p className="text-sm font-medium text-neutral-900">No projects yet</p>
        <p className="text-sm text-[var(--muted)]">
          Describe what you want in plain language. ScopeMate turns it into a
          clear scope you can share with contractors.
        </p>
        <Button asChild>
          <Link href="/projects/new">New project</Link>
        </Button>
      </SectionSurface>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
