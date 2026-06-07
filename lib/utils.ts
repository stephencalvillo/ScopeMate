import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Show on mobile; reveal on hover/focus from md breakpoint up (scope rows, icon actions). */
export const hoverRevealOnDesktopClassName =
  "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 focus-visible:opacity-100";

/** Horizontally scrollable tab strip aligned to page padding. */
export const horizontalScrollTabsClassName =
  "-mx-[var(--page-padding-x)] overflow-x-auto overscroll-x-contain px-[var(--page-padding-x)]";

/** Full-width CTA on mobile, auto width from sm up. */
export const mobileFullWidthCtaClassName = "w-full sm:w-auto";

export function formatCategoryLabel(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
