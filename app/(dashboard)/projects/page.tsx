import Link from "next/link";
import { ProjectList } from "@/components/project/project-list";
import { Button } from "@/components/ui/button";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { listProjectsForUser } from "@/lib/db/projects";

export default async function ProjectsPage() {
  const user = await ensureUserRecord();
  const projects = await listProjectsForUser(user.id);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
            Your projects
          </h1>
          <p className="text-base text-[var(--muted)]">
            Describe what you want in plain language. ScopeMate turns it into a
            clear scope you can share with contractors.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/projects/new">New project</Link>
        </Button>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
