import Link from "next/link";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { Button } from "@/components/ui/button";

export default function ContractorProjectNotFound() {
  return (
    <div className="space-y-8">
      <MyProjectsBreadcrumb href="/contractor" />

      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="font-display text-2xl tracking-tight text-neutral-900">
          Project not found
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This client project may have been removed, or you may not have access to
          it. Try creating a new one from your contractor portal.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/contractor/projects/new">Start a client project</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
