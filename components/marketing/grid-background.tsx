import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  fade?: "hero" | "bottom-reveal";
};

export function GridBackground({ fade = "hero" }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "marketing-hero-grid pointer-events-none absolute inset-0",
        fade === "bottom-reveal" && "marketing-hero-grid--bottom-reveal"
      )}
      aria-hidden
    >
      <div className="marketing-hero-grid-layer marketing-hero-grid-h-fwd" />
      <div className="marketing-hero-grid-layer marketing-hero-grid-v-fwd" />
      {fade === "hero" ? (
        <div className="marketing-hero-grid-fade pointer-events-none absolute inset-0" />
      ) : null}
    </div>
  );
}
