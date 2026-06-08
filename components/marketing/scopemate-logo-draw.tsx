import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import {
  FOOTER_LOGO_PATHS,
  FOOTER_LOGO_VIEWBOX,
} from "@/lib/marketing/footer-logo-paths";

export const FOOTER_LOGO_STROKE_DURATION_MS = 450;
export const FOOTER_LOGO_STROKE_STAGGER_MS = 100;
export const FOOTER_LOGO_FILL_DURATION_MS = 500;

export function getFooterLogoStrokeTotalMs() {
  return (
    FOOTER_LOGO_STROKE_STAGGER_MS * (FOOTER_LOGO_PATHS.length - 1) +
    FOOTER_LOGO_STROKE_DURATION_MS
  );
}

type ScopeMateLogoDrawProps = SVGProps<SVGSVGElement> & {
  strokeActive?: boolean;
  fillVisible?: boolean;
  fullWidth?: boolean;
};

export function ScopeMateLogoDraw({
  className,
  strokeActive = false,
  fillVisible = false,
  fullWidth = false,
  ...props
}: ScopeMateLogoDrawProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={FOOTER_LOGO_VIEWBOX}
      fill="none"
      aria-hidden={fullWidth ? undefined : true}
      aria-label={fullWidth ? "ScopeMate" : undefined}
      role={fullWidth ? "img" : undefined}
      className={cn(
        fullWidth ? "h-auto w-full max-w-none" : "h-6 w-auto",
        className
      )}
      {...props}
    >
      <g
        className={cn(
          "scopemate-logo-draw-stroke",
          strokeActive && "scopemate-logo-draw-stroke--active",
          fillVisible && "scopemate-logo-draw-stroke--complete"
        )}
      >
        {FOOTER_LOGO_PATHS.map((path, index) => (
          <path key={index} d={path} pathLength={1} />
        ))}
      </g>

      <g
        className={cn(
          "scopemate-logo-draw-fill",
          fillVisible && "scopemate-logo-draw-fill--visible"
        )}
      >
        {FOOTER_LOGO_PATHS.map((path, index) => (
          <path key={`fill-${index}`} d={path} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}
