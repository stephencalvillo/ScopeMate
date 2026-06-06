import { ProjectForm } from "@/components/project/project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
          Tell us about your project
        </h1>
        <p className="text-base text-[var(--muted)]">
          Describe your project in your own words and ScopeMate will organize
          the details on the next screen.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
