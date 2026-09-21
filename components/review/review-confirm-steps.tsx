"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, mobileFullWidthCtaClassName } from "@/lib/utils";

export type ReviewConfirmStart =
  | ReactNode
  | ((helpers: { confirm: () => void }) => ReactNode);

export type ReviewConfirmStepItem = {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  confirmStart?: ReviewConfirmStart;
  confirmLabel?: string;
  headerAction?: ReactNode;
};

function renderConfirmStart(
  confirmStart: ReviewConfirmStart | undefined,
  confirm: () => void
) {
  if (!confirmStart) {
    return null;
  }

  return typeof confirmStart === "function"
    ? confirmStart({ confirm })
    : confirmStart;
}

function CollapsiblePanel({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      return;
    }

    setMounted(true);
    let innerFrame = 0;
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        setExpanded(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-out",
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div
        className={cn(
          "min-h-0 overflow-hidden motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out",
          expanded ? "opacity-100" : "opacity-0"
        )}
        inert={expanded ? undefined : true}
        aria-hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
}

export function ReviewConfirmSteps({
  steps,
  confirmLabel = "Next",
  completeFooter,
  onConfirmedIdsChange,
}: {
  steps: ReviewConfirmStepItem[];
  confirmLabel?: string;
  completeFooter?: ReactNode;
  onConfirmedIdsChange?: (ids: string[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(steps[0]?.id ?? null);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const completeFooterRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToCompleteRef = useRef(false);

  const stepIds = steps.map((step) => step.id).join("|");

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const ids = new Set(steps.map((step) => step.id));
    const validConfirmed = confirmedIds.filter((id) => ids.has(id));

    if (validConfirmed.length !== confirmedIds.length) {
      setConfirmedIds(validConfirmed);
    }

    const firstUnconfirmed = steps.find(
      (step) => !validConfirmed.includes(step.id)
    );
    const openIndex = openId
      ? steps.findIndex((step) => step.id === openId)
      : -1;
    const firstUnconfirmedIndex = firstUnconfirmed
      ? steps.findIndex((step) => step.id === firstUnconfirmed.id)
      : -1;

    if (openId == null) {
      if (firstUnconfirmed) {
        setOpenId(firstUnconfirmed.id);
      }
      return;
    }

    if (!ids.has(openId)) {
      setOpenId(firstUnconfirmed?.id ?? steps[0].id);
      return;
    }

    if (
      firstUnconfirmed &&
      openIndex > firstUnconfirmedIndex &&
      !validConfirmed.includes(openId)
    ) {
      setOpenId(firstUnconfirmed.id);
    }
  }, [confirmedIds, openId, stepIds, steps]);

  useEffect(() => {
    onConfirmedIdsChange?.(confirmedIds);
  }, [confirmedIds, onConfirmedIdsChange]);

  const allConfirmed =
    steps.length > 0 && steps.every((step) => confirmedIds.includes(step.id));

  useEffect(() => {
    if (!shouldScrollToCompleteRef.current || !allConfirmed) {
      return;
    }

    shouldScrollToCompleteRef.current = false;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        completeFooterRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, [allConfirmed]);

  const firstUnconfirmedIndex = steps.findIndex(
    (step) => !confirmedIds.includes(step.id)
  );

  function canOpen(id: string) {
    const index = steps.findIndex((step) => step.id === id);
    if (index === -1) {
      return false;
    }
    if (confirmedIds.includes(id)) {
      return true;
    }
    return firstUnconfirmedIndex === index;
  }

  function scrollTo(node: HTMLElement | null) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        node?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  function openStep(id: string) {
    if (!canOpen(id)) {
      return;
    }
    if (id === openId) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
  }

  function confirmStep(id: string) {
    const index = steps.findIndex((step) => step.id === id);
    if (index === -1) {
      return;
    }

    setConfirmedIds((current) =>
      current.includes(id) ? current : [...current, id]
    );

    const next = steps[index + 1];
    if (next) {
      setOpenId(next.id);
      scrollTo(cardRefs.current[next.id]);
      return;
    }

    setOpenId(null);
    shouldScrollToCompleteRef.current = true;
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isOpen = step.id === openId;
          const isConfirmed = confirmedIds.includes(step.id);
          const isLast = index === steps.length - 1;
          const canToggleCollapsed = !isOpen && canOpen(step.id);
          const headerClickable = canToggleCollapsed || (isOpen && isConfirmed);
          const showConfirm = isOpen && !step.footer && !(isLast && isConfirmed);
          const headerClassName = cn(
            "flex min-w-0 flex-1 items-center gap-3 text-left",
            !headerClickable && "cursor-default"
          );

          const header = (
            <>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg tracking-tight text-neutral-900">
                  {step.title}
                </h2>
              </div>
              {headerClickable ? (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300 ease-out",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              ) : null}
            </>
          );

          return (
            <div
              key={step.id}
              ref={(node) => {
                cardRefs.current[step.id] = node;
              }}
              className="scroll-mt-4"
            >
              <Card
                className={cn(
                  "transition-[border-color,box-shadow] duration-200 ease-out",
                  canToggleCollapsed &&
                    "hover:border-neutral-300 hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
                )}
              >
                <div className="flex items-center gap-3 p-[var(--card-padding)]">
                  {headerClickable ? (
                    <button
                      type="button"
                      className={cn(
                        headerClassName,
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                      )}
                      aria-expanded={isOpen}
                      onClick={() => openStep(step.id)}
                    >
                      {header}
                    </button>
                  ) : (
                    <div className={headerClassName} aria-expanded={isOpen}>
                      {header}
                    </div>
                  )}
                  {isOpen && step.headerAction ? (
                    <div className="shrink-0">{step.headerAction}</div>
                  ) : null}
                </div>
                <CollapsiblePanel open={isOpen}>
                  <div className="space-y-6 px-[var(--card-padding)] pb-[var(--card-padding)]">
                    {step.description ? (
                      <p className="text-sm text-[var(--muted)]">
                        {step.description}
                      </p>
                    ) : null}
                    {step.content}
                    {step.footer ? (
                      step.footer
                    ) : showConfirm ? (
                      <div
                        className={cn(
                          "flex items-center",
                          step.confirmStart
                            ? "justify-between gap-3"
                            : "sm:justify-end"
                        )}
                      >
                        {step.confirmStart ? (
                          <div className="min-w-0">
                            {renderConfirmStart(step.confirmStart, () =>
                              confirmStep(step.id)
                            )}
                          </div>
                        ) : null}
                        <Button
                          type="button"
                          className={cn(
                            "px-4",
                            step.confirmStart
                              ? "w-auto"
                              : mobileFullWidthCtaClassName
                          )}
                          onClick={() => confirmStep(step.id)}
                        >
                          {step.confirmLabel ?? confirmLabel}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CollapsiblePanel>
              </Card>
            </div>
          );
        })}
      </div>

      {allConfirmed && completeFooter ? (
        <div ref={completeFooterRef} className="scroll-mt-4">
          {completeFooter}
        </div>
      ) : null}
    </div>
  );
}
