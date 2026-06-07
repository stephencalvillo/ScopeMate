import type { ReactNode } from "react";

export function PageBreadcrumbHeader({
  breadcrumb,
  children,
}: {
  breadcrumb: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {breadcrumb}
      {children}
    </div>
  );
}
