import { cn } from "@/lib/utils";

type FollowUpAnswerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function FollowUpAnswerButton({
  selected = false,
  className,
  children,
  ...props
}: FollowUpAnswerButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
        selected
          ? "border-neutral-900 bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border-neutral-900/50 bg-white text-neutral-900 hover:bg-neutral-50",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
