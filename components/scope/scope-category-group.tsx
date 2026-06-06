import { SectionSurface } from "@/components/layout/page-section";
import { ScopeCategoryBadge } from "@/components/scope/scope-category-badge";

export function ScopeCategoryGroup({
  category,
  children,
}: {
  category: string;
  children: React.ReactNode;
}) {
  return (
    <SectionSurface className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-3">
        <ScopeCategoryBadge category={category} />
      </div>
      <div className="divide-y divide-[var(--border)] px-5 pt-2 pb-2">{children}</div>
    </SectionSurface>
  );
}
