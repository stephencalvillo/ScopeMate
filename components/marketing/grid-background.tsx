"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  fade?: "hero" | "bottom-reveal" | "footer";
  layers?: "full" | "minimal";
};

function GridLayers({
  layers,
  strong = false,
}: {
  layers: "full" | "minimal";
  strong?: boolean;
}) {
  const layerClass = strong ? "marketing-hero-grid-layer--strong" : undefined;

  return (
    <>
      <div
        className={cn(
          "marketing-hero-grid-layer marketing-hero-grid-h-fwd",
          layerClass
        )}
      />
      {layers === "full" ? (
        <div
          className={cn(
            "marketing-hero-grid-layer marketing-hero-grid-h-rev",
            layerClass
          )}
        />
      ) : null}
      <div
        className={cn(
          "marketing-hero-grid-layer marketing-hero-grid-v-fwd",
          layerClass
        )}
      />
      {layers === "full" ? (
        <div
          className={cn(
            "marketing-hero-grid-layer marketing-hero-grid-v-rev",
            layerClass
          )}
        />
      ) : null}
    </>
  );
}

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

  useEffect(() => {
    const grid = gridRef.current;
    const section = grid?.parentElement;
    if (!grid || !section) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !prefersFinePointer) {
      return;
    }

    const gridEl = grid;
    const sectionEl = section;
    let frameId = 0;

    function updateHoverPosition(clientX: number, clientY: number) {
      const rect = sectionEl.getBoundingClientRect();
      gridEl.style.setProperty("--grid-hover-x", `${clientX - rect.left}px`);
      gridEl.style.setProperty("--grid-hover-y", `${clientY - rect.top}px`);
    }

    function handleMouseMove(event: MouseEvent) {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        updateHoverPosition(event.clientX, event.clientY);
        gridEl.classList.add("marketing-hero-grid--hovering");
      });
    }

    function handleMouseLeave() {
      cancelAnimationFrame(frameId);
      gridEl.classList.remove("marketing-hero-grid--hovering");
    }

    sectionEl.addEventListener("mousemove", handleMouseMove);
    sectionEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(frameId);
      sectionEl.removeEventListener("mousemove", handleMouseMove);
      sectionEl.removeEventListener("mouseleave", handleMouseLeave);
      gridEl.classList.remove("marketing-hero-grid--hovering");
    };
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
      <GridLayers layers={layers} />
      <div className="marketing-hero-grid-spotlight" aria-hidden>
        <GridLayers layers={layers} strong />
      </div>
      {fade === "hero" ? (
        <div className="marketing-hero-grid-fade pointer-events-none absolute inset-0" />
      ) : null}
    </div>
  );
}
