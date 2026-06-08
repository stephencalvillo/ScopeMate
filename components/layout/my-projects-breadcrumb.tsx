import { BreadcrumbLink, BreadcrumbNav } from "@/components/layout/breadcrumb-link";

export function MyProjectsBreadcrumb({
  href,
}: {
  href: "/projects" | "/contractor";
}) {
  return (
    <BreadcrumbNav>
      <BreadcrumbLink href={href}>Your projects</BreadcrumbLink>
    </BreadcrumbNav>
  );
}
