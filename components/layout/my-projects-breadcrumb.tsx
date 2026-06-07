import Link from "next/link";

export function MyProjectsBreadcrumb({
  href,
}: {
  href: "/projects" | "/contractor";
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href={href}
            className="text-[var(--muted)] transition-colors hover:text-neutral-900"
          >
            My projects
          </Link>
        </li>
      </ol>
    </nav>
  );
}
