"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  fade?: "hero" | "bottom-reveal" | "footer";
  layers?: "full" | "minimal";
};

export function GridBackground({
  fade = "hero",
  layers = "full",
}: GridBackgroundProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const grid = gridRef.current;
    const section = grid?.parentElement;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry?.isIntersecting ?? false);
      },
      { rootMargin: "120px 0px" }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className={cn(
        "marketing-hero-grid pointer-events-none absolute inset-0",
        fade === "bottom-reveal" && "marketing-hero-grid--bottom-reveal",
        fade === "footer" && "marketing-hero-grid--footer-fade",
        !isActive && "marketing-hero-grid--paused"
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
