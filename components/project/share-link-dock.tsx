"use client";

import { useEffect, useRef, useState } from "react";
import { ShareLinkPanel } from "@/components/project/share-link-panel";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

type DockAnimation = "float" | "inline" | null;

export function ShareLinkDock({ project }: { project: Project }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isAnchored, setIsAnchored] = useState(true);
  const [hasObserved, setHasObserved] = useState(false);
  const [animation, setAnimation] = useState<DockAnimation>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasObserved(true);
        setIsAnchored(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasObserved) return;

    setAnimation(null);

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setAnimation(isAnchored ? "inline" : "float");
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [hasObserved, isAnchored]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new ResizeObserver(([entry]) => {
      setPanelHeight(entry.contentRect.height);
    });

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const isFloating = hasObserved && !isAnchored;

  return (
    <div className="relative">
      <div
        ref={sentinelRef}
        className="pointer-events-none h-px w-full"
        aria-hidden
      />

      <div
        style={{
          minHeight: isFloating && panelHeight ? panelHeight : undefined,
        }}
      >
        <div
          ref={panelRef}
          className={cn(
            isFloating && "fixed inset-x-0 bottom-4 z-40 px-6",
            animation === "float" && "share-dock-float-enter",
            animation === "inline" && "share-dock-inline-enter"
          )}
        >
          <div
            className={cn(
              "mx-auto max-w-5xl",
              isFloating &&
                "drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            )}
          >
            <ShareLinkPanel project={project} docked={isFloating} />
          </div>
        </div>
      </div>
    </div>
  );
}
