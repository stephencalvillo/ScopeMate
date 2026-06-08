"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { howItWorksIcons } from "@/components/marketing/how-it-works-icons";
import { HowItWorksStepPreview } from "@/components/marketing/how-it-works-step-preview";
import { FeatureCard } from "@/components/marketing/feature-card";
import { cn } from "@/lib/utils";

type HowItWorksStep = {
  title: string;
  description: string;
};

type HowItWorksScrollSectionProps = {
  title: string;
  steps: readonly HowItWorksStep[];
};

const STEP_SCROLL_VH = 55;
const MARKETING_HEADER_HEIGHT_PX = 64;
const PEEK_TOP_PADDING_PX = 32;
const CENTER_TRANSITION_MS = 500;

function getScrollSectionHeight(stepCount: number) {
  return 100 + Math.max(stepCount - 1, 0) * STEP_SCROLL_VH;
}

function getStepFromProgress(progress: number, stepCount: number) {
  if (stepCount <= 1) {
    return 0;
  }

  const slice = 1 / stepCount;
  return Math.min(
    stepCount - 1,
    Math.floor((progress + slice / 2) / slice)
  );
}

export function HowItWorksScrollSection({
  title,
  steps,
}: HowItWorksScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef(0);
  const isPinnedRef = useRef(false);
  const isSettledRef = useRef(false);
  const settleBaselineRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [centerOffset, setCenterOffset] = useState(0);

  const measureCenterOffset = useCallback(() => {
    const sticky = stickyRef.current;
    const content = contentRef.current;
    if (!sticky || !content) {
      return 0;
    }

    return Math.max(
      0,
      (sticky.clientHeight - content.offsetHeight) / 2 - PEEK_TOP_PADDING_PX
    );
  }, []);

  useLayoutEffect(() => {
    function updateCenterOffset() {
      setCenterOffset(measureCenterOffset());
    }

    updateCenterOffset();

    const sticky = stickyRef.current;
    const content = contentRef.current;
    const resizeObserver = new ResizeObserver(updateCenterOffset);

    if (sticky) {
      resizeObserver.observe(sticky);
    }
    if (content) {
      resizeObserver.observe(content);
    }

    window.addEventListener("resize", updateCenterOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCenterOffset);
    };
  }, [measureCenterOffset, steps.length]);

  const recordSettleBaseline = useCallback(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    settleBaselineRef.current = Math.max(
      MARKETING_HEADER_HEIGHT_PX - rect.top,
      0
    );
  }, []);

  const handleCenterTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || !isPinnedRef.current) {
        return;
      }

      isSettledRef.current = true;
      recordSettleBaseline();
    },
    [recordSettleBaseline]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let frameId = 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function updateScrollState() {
      const element = containerRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const stickyViewportHeight = viewportHeight - MARKETING_HEADER_HEIGHT_PX;
      const scrollableDistance = element.offsetHeight - stickyViewportHeight;
      const nextPinned = rect.top <= MARKETING_HEADER_HEIGHT_PX;
      const rawScrolled = Math.max(MARKETING_HEADER_HEIGHT_PX - rect.top, 0);

      if (nextPinned !== isPinnedRef.current) {
        isPinnedRef.current = nextPinned;
        setIsPinned(nextPinned);

        if (nextPinned) {
          isSettledRef.current = prefersReducedMotion;
          settleBaselineRef.current = prefersReducedMotion ? rawScrolled : 0;

          if (prefersReducedMotion) {
            recordSettleBaseline();
          }
        } else {
          isSettledRef.current = false;
          settleBaselineRef.current = 0;
        }
      }

      if (scrollableDistance <= 0) {
        if (activeStepRef.current !== 0) {
          activeStepRef.current = 0;
          setActiveStep(0);
        }
        return;
      }

      let nextStep = 0;

      if (nextPinned && isSettledRef.current) {
        const stepScrollRange = Math.max(
          scrollableDistance - settleBaselineRef.current,
          1
        );
        const scrolled = Math.min(
          Math.max(rawScrolled - settleBaselineRef.current, 0),
          stepScrollRange
        );
        const progress = scrolled / stepScrollRange;
        nextStep = getStepFromProgress(progress, steps.length);
      }

      if (nextStep !== activeStepRef.current) {
        activeStepRef.current = nextStep;
        setActiveStep(nextStep);
      }
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateScrollState);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [recordSettleBaseline, steps.length]);

  const wasPinnedRef = useRef(false);

  useEffect(() => {
    const justPinned = isPinned && !wasPinnedRef.current;
    wasPinnedRef.current = isPinned;

    if (!justPinned) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || centerOffset === 0) {
      isSettledRef.current = true;
      recordSettleBaseline();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (isPinnedRef.current && !isSettledRef.current) {
        isSettledRef.current = true;
        recordSettleBaseline();
      }
    }, CENTER_TRANSITION_MS + 50);

    return () => window.clearTimeout(timeoutId);
  }, [centerOffset, isPinned, recordSettleBaseline]);

  return (
    <>
      <section className="relative bg-[var(--accent)]/30 py-14 md:hidden">
        <div
          className="marketing-section-bottom-glow pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-6xl px-[var(--page-padding-x)]">
          <h2 className="mb-10 text-center font-display text-3xl tracking-tight text-neutral-900 text-balance">
            {title}
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="space-y-4">
                <FeatureCard
                  icon={howItWorksIcons[index]}
                  title={step.title}
                  description={step.description}
                />
                <HowItWorksStepPreview step={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={title} className="relative hidden md:block">
        <div
          ref={containerRef}
          style={{ height: `${getScrollSectionHeight(steps.length)}vh` }}
        >
          <div
            ref={stickyRef}
            className="sticky top-16 h-[calc(100dvh-4rem)] bg-[var(--accent)]/30"
          >
            <div
              className="marketing-section-bottom-glow pointer-events-none absolute inset-0"
              aria-hidden
            />
            <div className="relative z-10 flex h-full flex-col justify-start pb-10 pt-8">
              <div
                ref={contentRef}
                onTransitionEnd={handleCenterTransitionEnd}
                className="mx-auto w-full max-w-6xl px-[var(--page-padding-x)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-in-out"
                style={{
                  transform: isPinned
                    ? `translateY(${centerOffset}px)`
                    : "translateY(0)",
                }}
              >
                <h2 className="mb-12 shrink-0 text-center font-display text-3xl tracking-tight text-neutral-900">
                  {title}
                </h2>

                <div className="mx-auto grid w-full max-w-5xl shrink-0 grid-cols-2 items-start gap-8 lg:gap-12">
                  <div className="relative min-h-[25rem] space-y-4">
                    <div
                      className="absolute bottom-4 left-4 top-4 w-px bg-[var(--border)]"
                      aria-hidden
                    />

                    {steps.map((step, index) => {
                      const isActive = index === activeStep;
                      const isComplete = index < activeStep;

                      return (
                        <div
                          key={step.title}
                          className={cn(
                            "relative min-h-[5.5rem] transition-opacity duration-300 ease-out",
                            isActive
                              ? "opacity-100"
                              : isComplete
                                ? "opacity-55"
                                : "opacity-35"
                          )}
                        >
                          <div className="flex items-start gap-3 pl-10">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
                              {howItWorksIcons[index]}
                            </span>
                            <div className="space-y-1.5 text-left">
                              <h3 className="font-display text-xl tracking-tight text-neutral-900">
                                {step.title}
                              </h3>
                              <p
                                className={cn(
                                  "text-sm leading-relaxed text-[var(--muted)]",
                                  !isActive && "invisible"
                                )}
                                aria-hidden={!isActive}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative h-[24rem] w-full">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "absolute inset-0 motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out",
                          index === activeStep
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                        )}
                      >
                        <HowItWorksStepPreview step={index} />
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="mx-auto mt-12 flex w-full max-w-5xl shrink-0 items-center gap-2"
                  aria-hidden
                >
                  {steps.map((step, index) => (
                    <div
                      key={step.title}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300 ease-out",
                        index <= activeStep
                          ? "bg-neutral-900"
                          : "bg-[var(--border)]"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
