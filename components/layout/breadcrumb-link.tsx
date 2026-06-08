import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export const breadcrumbLinkClassName =
  "inline-flex items-center gap-1.5 text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-neutral-900";

export function BreadcrumbNav({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>{children}</li>
      </ol>
    </nav>
  );
}

export function BreadcrumbLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={breadcrumbLinkClassName}>
      <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
