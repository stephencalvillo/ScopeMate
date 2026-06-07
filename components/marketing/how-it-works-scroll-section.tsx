"use client";

import { useState } from "react";
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

export function HowItWorksScrollSection({
  title,
  steps,
}: HowItWorksScrollSectionProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[var(--accent)]/30 py-14 md:py-20">
      <div
        className="marketing-section-bottom-glow pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-[var(--page-padding-x)]">
        <h2 className="mb-10 text-center font-display text-3xl tracking-tight text-neutral-900 text-balance md:mb-8">
          {title}
        </h2>

        <div className="md:hidden">
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

        <div className="hidden md:grid md:grid-cols-2 md:items-start md:gap-10 lg:gap-14">
          <div className="relative space-y-3">
            <div
              className="absolute bottom-2 left-4 top-2 w-px bg-[var(--border)]"
              aria-hidden
            />

            {steps.map((step, index) => {
              const isActive = index === activeStep;

              return (
                <button
                  key={step.title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "relative w-full rounded-[4px] pl-10 text-left transition-opacity duration-300 ease-in-out",
                    isActive ? "opacity-100" : "opacity-45 hover:opacity-70"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] transition-transform duration-300 ease-in-out",
                        isActive && "scale-105"
                      )}
                    >
                      {howItWorksIcons[index]}
                    </span>
                    <div className="space-y-1.5">
                      <h3
                        className={cn(
                          "font-display tracking-tight text-neutral-900 transition-[font-size] duration-300 ease-in-out",
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
                </button>
              );
            })}
          </div>

          <div className="min-h-[280px] w-full">
            <HowItWorksStepPreview step={activeStep} />
          </div>
        </div>

        <div
          className="mx-auto mt-8 flex max-w-5xl items-center gap-2 md:mt-10"
          aria-hidden
        >
          {steps.map((step, index) => (
            <button
              key={step.title}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setActiveStep(index)}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300 ease-in-out",
                index <= activeStep ? "bg-neutral-900" : "bg-[var(--border)]"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
