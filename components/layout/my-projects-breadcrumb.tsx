import type { MouseEvent } from "react";
import { BreadcrumbLink, BreadcrumbNav } from "@/components/layout/breadcrumb-link";

export function MyProjectsBreadcrumb({
  href,
  onClick,
}: {
  href: "/projects" | "/contractor";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <BreadcrumbNav>
      <BreadcrumbLink href={href} onClick={onClick}>
        Your projects
      </BreadcrumbLink>
    </BreadcrumbNav>
  );
}
