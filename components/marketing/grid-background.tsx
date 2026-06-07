import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  fade?: "hero" | "bottom-reveal" | "footer";
  layers?: "full" | "minimal";
};

export function GridBackground({
  fade = "hero",
  layers = "full",
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "marketing-hero-grid pointer-events-none absolute inset-0",
        fade === "bottom-reveal" && "marketing-hero-grid--bottom-reveal",
        fade === "footer" && "marketing-hero-grid--footer-fade"
      )}
      aria-hidden
    >
      <div className="marketing-hero-grid-layer marketing-hero-grid-h-fwd" />
      {layers === "full" ? (
        <div className="marketing-hero-grid-layer marketing-hero-grid-h-rev" />
      ) : null}
      <div className="marketing-hero-grid-layer marketing-hero-grid-v-fwd" />
      {layers === "full" ? (
        <div className="marketing-hero-grid-layer marketing-hero-grid-v-rev" />
      ) : null}
      {fade === "hero" ? (
        <div className="marketing-hero-grid-fade pointer-events-none absolute inset-0" />
      ) : null}
    </div>
  );
}
