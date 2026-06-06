import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white",
        secondary: "bg-neutral-100 text-neutral-700",
        warning: "bg-[var(--accent)] text-[var(--accent-foreground)]",
        success: "bg-emerald-50 text-emerald-800 border border-emerald-100",
        info: "bg-blue-50 text-blue-800 border border-blue-100",
        pending: "bg-amber-50 text-amber-900 border border-amber-200",
        outline: "border border-[var(--border)] text-neutral-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
