import Link from "next/link";
import { ProjectCard } from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-6 py-16">
          <div className="max-w-lg space-y-3">
            <h2 className="font-display text-3xl tracking-tight text-neutral-900">
              Your first project starts here
            </h2>
            <p className="text-base text-[var(--muted)]">
              Describe what you want to build in your own words. ScopeMate turns
              your notes into a clear scope you can share with contractors.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/projects/new">Create a project</Link>
          </Button>
        </CardContent>
      </Card>
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
