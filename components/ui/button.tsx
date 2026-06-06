import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-neutral-950/70 bg-linear-to-b from-neutral-600 via-neutral-900 to-neutral-950 text-white shadow-[var(--button-shadow-primary)] hover:from-neutral-500 hover:via-neutral-800 hover:to-neutral-900 hover:shadow-[var(--button-shadow-primary-hover)] active:border-neutral-950 active:from-neutral-800 active:via-neutral-950 active:to-black active:shadow-[var(--button-shadow-primary-active)]",
        secondary:
          "border-[var(--border)] bg-linear-to-b from-white via-neutral-50 to-neutral-100 text-neutral-900 shadow-[var(--button-shadow-surface)] hover:from-neutral-50 hover:via-white hover:to-neutral-50 hover:shadow-[var(--button-shadow-surface-hover)] active:border-neutral-200 active:from-neutral-100 active:via-neutral-100 active:to-neutral-200 active:shadow-[var(--button-shadow-surface-active)]",
        outline:
          "border-neutral-300/80 bg-linear-to-b from-white via-neutral-50 to-neutral-100 text-neutral-900 shadow-[var(--button-shadow-surface)] hover:from-neutral-50 hover:via-white hover:to-neutral-50 hover:shadow-[var(--button-shadow-surface-hover)] active:border-neutral-300 active:from-neutral-100 active:via-neutral-100 active:to-neutral-200 active:shadow-[var(--button-shadow-surface-active)]",
        ghost:
          "border-transparent bg-transparent text-neutral-700 shadow-none hover:bg-neutral-900/10 hover:text-neutral-900 active:border-transparent active:bg-neutral-900/15 active:shadow-none active:translate-y-0",
        destructive:
          "border-red-900/40 bg-linear-to-b from-red-500 via-red-600 to-red-700 text-white shadow-[var(--button-shadow-destructive)] hover:from-red-400 hover:via-red-600 hover:to-red-700 hover:shadow-[var(--button-shadow-destructive)] active:border-red-950 active:from-red-600 active:via-red-700 active:to-red-800 active:shadow-[var(--button-shadow-destructive-active)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
