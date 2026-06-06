export function GridBackground() {
  return (
    <div className="marketing-hero-grid pointer-events-none absolute inset-0" aria-hidden>
      <div className="marketing-hero-grid-layer marketing-hero-grid-h-fwd" />
      <div className="marketing-hero-grid-layer marketing-hero-grid-h-rev" />
      <div className="marketing-hero-grid-layer marketing-hero-grid-v-fwd" />
      <div className="marketing-hero-grid-layer marketing-hero-grid-v-rev" />
      <div className="marketing-hero-grid-fade pointer-events-none absolute inset-0" />
    </div>
  );
}
