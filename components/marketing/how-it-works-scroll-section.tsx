"use client";

import { useEffect, useRef, useState } from "react";
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
  const activeStepRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let frameId = 0;

    function updateActiveStep() {
      const element = containerRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = element.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        if (activeStepRef.current !== 0) {
          activeStepRef.current = 0;
          setActiveStep(0);
        }
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollableDistance);
      const progress = scrolled / scrollableDistance;
      const nextStep = getStepFromProgress(progress, steps.length);

      if (nextStep !== activeStepRef.current) {
        activeStepRef.current = nextStep;
        setActiveStep(nextStep);
      }
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveStep);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [steps.length]);

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
          <div className="sticky top-0 h-screen bg-[var(--accent)]/30">
            <div
              className="marketing-section-bottom-glow pointer-events-none absolute inset-0"
              aria-hidden
            />
            <div className="relative z-10 flex h-full items-center py-12">
              <div className="mx-auto w-full max-w-6xl px-[var(--page-padding-x)]">
                <h2 className="mb-4 text-center font-display text-3xl tracking-tight text-neutral-900">
                  {title}
                </h2>

                <div className="mx-auto grid w-full max-w-5xl grid-cols-2 items-center gap-8 lg:gap-12">
                  <div className="relative space-y-4">
                    <div
                      className="absolute bottom-2 left-4 top-2 w-px bg-[var(--border)]"
                      aria-hidden
                    />

                    {steps.map((step, index) => {
                      const isActive = index === activeStep;
                      const isComplete = index < activeStep;

                      return (
                        <div
                          key={step.title}
                          className={cn(
                            "relative transition-opacity duration-300 ease-out",
                            isActive
                              ? "opacity-100"
                              : isComplete
                                ? "opacity-55"
                                : "opacity-35"
                          )}
                        >
                          <div className="flex items-start gap-3 pl-10">
                            <span
                              className={cn(
                                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] transition-transform duration-300 ease-out",
                                isActive && "scale-105"
                              )}
                            >
                              {howItWorksIcons[index]}
                            </span>
                            <div className="space-y-1.5 text-left">
                              <h3
                                className={cn(
                                  "font-display tracking-tight text-neutral-900",
                                  isActive ? "text-xl" : "text-base"
                                )}
                              >
                                {step.title}
                              </h3>
                              {isActive ? (
                                <p className="text-sm leading-relaxed text-[var(--muted)]">
                                  {step.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative min-h-[260px] w-full md:min-h-[280px]">
                    <div
                      key={activeStep}
                      className="motion-safe:animate-[how-it-works-preview-in_220ms_ease-out]"
                    >
                      <HowItWorksStepPreview step={activeStep} />
                    </div>
                  </div>
                </div>

                <div
                  className="mx-auto mt-6 flex w-full max-w-5xl items-center gap-2"
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
