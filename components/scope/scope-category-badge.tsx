import { Badge } from "@/components/ui/badge";
import { formatCategoryLabel } from "@/lib/utils";

export function ScopeCategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline">{formatCategoryLabel(category)}</Badge>
  );
}
