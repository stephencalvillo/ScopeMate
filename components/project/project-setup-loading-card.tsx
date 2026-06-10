import { Loader2 } from "lucide-react";
import { ScopeBuddyLogo } from "@/components/layout/scopemate-logo";

export function ProjectSetupLoadingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <ScopeBuddyLogo className="mb-8 h-7 text-neutral-900" />
      <div className="flex w-full flex-col items-center gap-4 rounded-[8px] border border-[#e8e8e4] bg-white px-6 py-10 shadow-none">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" aria-hidden />
        <div className="space-y-2">
          <p className="font-display text-xl tracking-tight text-neutral-900">
            {title}
          </p>
          <p className="text-sm text-[var(--muted)]">{description}</p>
        </div>
      </div>
    </div>
  );
}
