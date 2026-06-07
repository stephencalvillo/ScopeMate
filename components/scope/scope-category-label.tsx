import { getScopeCategoryIcon } from "@/lib/scope/category-icons";
import { cn, formatCategoryLabel } from "@/lib/utils";

export function ScopeCategoryLabel({
  category,
  className,
  iconClassName,
  labelClassName,
}: {
  category: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}) {
  const Icon = getScopeCategoryIcon(category);
  const label = formatCategoryLabel(category);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Icon
        className={cn("h-4 w-4 shrink-0 text-neutral-500", iconClassName)}
        aria-hidden
      />
      <span className={labelClassName}>{label}</span>
    </span>
  );
}
