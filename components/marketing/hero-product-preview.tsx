"use client";

import { useEffect, useState } from "react";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const HERO_DESCRIBE_TEXT =
  "We want to remodel our kitchen — new cabinets, quartz countertops, and better lighting. The layout feels cramped and we'd love a bigger island.";

const HERO_SCOPE_ITEMS = [
  "Remove existing cabinets and countertops",
  "Install new shaker-style cabinets",
  "Install quartz countertops with undermount sink",
] as const;

const HERO_PHASE_DURATIONS_MS = [6200, 4200, 4200] as const;
const TYPEWRITER_INTERVAL_MS = 32;
const SCOPE_ITEM_STAGGER_MS = 350;
const SCOPE_ITEMS_START_DELAY_MS = 250;

function PreviewShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "relative h-full overflow-hidden border border-[var(--border)] bg-transparent shadow-sm",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-md"
        aria-hidden
      />
      <CardContent className="relative h-full p-4 md:p-5">{children}</CardContent>
    </Card>
  );
}

function useTypewriter(text: string, isActive: boolean) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(intervalId);
      }
    }, TYPEWRITER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isActive, text]);

  return displayedText;
}

function useStaggeredReveal(
  itemCount: number,
  isActive: boolean,
  startDelayMs: number,
  staggerMs: number
) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleCount(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisibleCount(itemCount);
      return;
    }

    setVisibleCount(0);

    const timeoutIds = Array.from({ length: itemCount }, (_, index) =>
      window.setTimeout(() => {
        setVisibleCount(index + 1);
      }, startDelayMs + index * staggerMs)
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [isActive, itemCount, startDelayMs, staggerMs]);

  return visibleCount;
}

function SceneContentLayer({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out",
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}

function HeroDescribeContent({ isActive }: { isActive: boolean }) {
  const displayedText = useTypewriter(HERO_DESCRIBE_TEXT, isActive);

  return (
    <SceneContentLayer isActive={isActive}>
      <div className="flex h-full min-h-0 flex-col">
        <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          New project
        </p>
        <Textarea
          readOnly
          value={displayedText}
          className={cn(
            "min-h-32 flex-1 resize-none bg-white text-sm leading-relaxed transition-colors duration-300",
            displayedText.length > 0
              ? "border-[var(--gold-text)]"
              : "border-[var(--border)]"
          )}
          aria-hidden
        />
        <Button
          type="button"
          className="mt-4 w-full shrink-0 pointer-events-none"
          tabIndex={-1}
          aria-hidden
        >
          <Sparkles className="h-4 w-4" />
          Create your scope
        </Button>
      </div>
    </SceneContentLayer>
  );
}

function HeroScopeContent({ isActive }: { isActive: boolean }) {
  const visibleCount = useStaggeredReveal(
    HERO_SCOPE_ITEMS.length,
    isActive,
    SCOPE_ITEMS_START_DELAY_MS,
    SCOPE_ITEM_STAGGER_MS
  );

  return (
    <SceneContentLayer isActive={isActive}>
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-start gap-2 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
            ✦
          </span>
          Scope of work
        </div>
        {HERO_SCOPE_ITEMS.map((item, index) => (
          <div
            key={item}
            className={cn(
              "flex items-center gap-2 rounded-[4px] bg-neutral-50 px-3 py-2 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
              index < visibleCount
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            )}
            aria-hidden={index >= visibleCount}
          >
            <span className="min-w-0 flex-1 text-left text-sm text-neutral-800">
              {item}
            </span>
            <div
              className="flex shrink-0 items-center gap-1.5 text-neutral-400"
              aria-hidden
            >
              <Pencil className="h-3.5 w-3.5" />
              <Trash2 className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </SceneContentLayer>
  );
}

function HeroEstimateContent({ isActive }: { isActive: boolean }) {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setContentVisible(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setContentVisible(true);
      return;
    }

    setContentVisible(false);
    const timeoutId = window.setTimeout(() => {
      setContentVisible(true);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [isActive]);

  return (
    <SceneContentLayer isActive={isActive}>
      <div
        className={cn(
          "flex h-full flex-col items-center justify-start pt-2 text-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out md:pt-4",
          contentVisible ? "scale-100" : "scale-90"
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Contractor proposal
        </p>
        <p className="mt-2 font-display text-xl tracking-tight text-neutral-900">
          Riverview Builders
        </p>
        <p className="mt-2 font-display text-5xl tracking-tight text-neutral-900 md:text-[3.25rem] md:leading-none">
          $42,800
        </p>
        <Button
          type="button"
          className="mt-4 pointer-events-none"
          tabIndex={-1}
          aria-hidden
        >
          Accept estimate
        </Button>
        <p className="mt-3 text-sm text-[var(--muted)]">Kitchen remodel</p>
      </div>
    </SceneContentLayer>
  );
}

export function HeroProductPreview() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const intervalId = window.setInterval(() => {
        setPhase((current) => (current + 1) % 3);
      }, 5000);

      return () => window.clearInterval(intervalId);
    }

    const timeoutId = window.setTimeout(() => {
      setPhase((current) => (current + 1) % 3);
    }, HERO_PHASE_DURATIONS_MS[phase]);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  return (
    <div
      className="mx-auto w-full max-w-lg origin-bottom scale-[1.08] md:max-w-2xl md:scale-110"
      aria-hidden
    >
      <div className="relative h-[24rem] translate-y-[16%] md:h-[27rem] md:translate-y-[18%]">
        <PreviewShell>
          <div className="relative h-full">
            <HeroDescribeContent isActive={phase === 0} />
            <HeroScopeContent isActive={phase === 1} />
            <HeroEstimateContent isActive={phase === 2} />
          </div>
        </PreviewShell>
      </div>
    </div>
  );
}
