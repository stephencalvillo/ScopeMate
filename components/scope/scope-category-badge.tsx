import { ScopeCategoryLabel } from "@/components/scope/scope-category-label";
import { Badge } from "@/components/ui/badge";

export function ScopeCategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline">
      <ScopeCategoryLabel category={category} />
    </Badge>
  );
}
