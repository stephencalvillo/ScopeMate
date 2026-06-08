import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { ProjectList } from "@/components/project/project-list";
import { Button } from "@/components/ui/button";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { listProjectsForUser } from "@/lib/db/projects";
import { cn } from "@/lib/utils";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/homeowners/signup");
  }

  const user = await ensureUserRecord();
  const projects = await listProjectsForUser(user.id);
  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div
          className={cn(
            "space-y-3",
            hasProjects ? "w-full md:max-w-2xl" : "max-w-2xl"
          )}
        >
          <div
            className={cn(
              hasProjects && "flex items-center justify-between gap-4 md:block"
            )}
          >
            <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
              Your projects
            </h1>
            {hasProjects ? (
              <Button asChild size="icon" className="shrink-0 md:hidden">
                <Link href="/projects/new" aria-label="New project">
                  <Plus className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>
          <p className="text-base text-[var(--muted)]">
            Describe what you want in plain language. ScopeMate turns it into a
            clear scope you can share with contractors.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className={hasProjects ? "hidden md:inline-flex" : undefined}
        >
          <Link href="/projects/new">New project</Link>
        </Button>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}
