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

const STEP_SCROLL_VH = 100;

export function HowItWorksScrollSection({
  title,
  steps,
}: HowItWorksScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateActiveStep() {
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = element.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) {
        setActiveStep(0);
        return;
      }

      const scrolled = Math.min(
        Math.max(-rect.top, 0),
        scrollableDistance
      );
      const progress = scrolled / scrollableDistance;
      const nextStep = Math.min(
        steps.length - 1,
        Math.floor(progress * steps.length)
      );

      setActiveStep(nextStep);
    }

    updateActiveStep();
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);

    return () => {
      window.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
    };
  }, [steps.length]);

  return (
    <section className="-mt-8 pb-16 pt-0 md:-mt-12 md:pb-20">
      <div className="mx-auto max-w-6xl px-[var(--page-padding-x)] md:hidden">
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

      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${steps.length * STEP_SCROLL_VH}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-6xl px-[var(--page-padding-x)]">
            <h2 className="mb-6 text-center font-display text-3xl tracking-tight text-neutral-900">
              {title}
            </h2>

            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="relative space-y-8">
                <div
                  className="absolute bottom-4 left-4 top-4 hidden w-px bg-[var(--border)] lg:block"
                  aria-hidden
                />

                {steps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isComplete = index < activeStep;

                  return (
                    <div
                      key={step.title}
                      className={cn(
                        "relative transition-all duration-500",
                        isActive
                          ? "opacity-100"
                          : isComplete
                            ? "opacity-55"
                            : "opacity-35"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] transition-transform duration-500",
                            isActive && "scale-110"
                          )}
                        >
                          {howItWorksIcons[index]}
                        </span>
                        <div className="space-y-2">
                          <h3
                            className={cn(
                              "font-display tracking-tight text-neutral-900 transition-all duration-500",
                              isActive ? "text-2xl" : "text-lg"
                            )}
                          >
                            {step.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm leading-relaxed text-[var(--muted)] transition-all duration-500",
                              isActive
                                ? "max-h-24 opacity-100"
                                : "max-h-0 overflow-hidden opacity-0"
                            )}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative min-h-[420px]">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className={cn(
                      "absolute inset-0 transition-all duration-700 ease-out",
                      index === activeStep
                        ? "translate-y-0 opacity-100"
                        : index < activeStep
                          ? "-translate-y-4 opacity-0"
                          : "translate-y-4 opacity-0"
                    )}
                    aria-hidden={index !== activeStep}
                  >
                    <HowItWorksStepPreview step={index} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-500",
                    index <= activeStep
                      ? "bg-neutral-900"
                      : "bg-[var(--border)]"
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
