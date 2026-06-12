"use client";

import { memo, useEffect, useState } from "react";
import { Check, Copy, Link2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
        "h-full overflow-hidden border-white/50 bg-white/75 shadow-sm backdrop-blur-md",
        className
      )}
    >
      <CardContent className="h-full p-4 md:p-5">{children}</CardContent>
    </Card>
  );
}

const DESCRIBE_PREVIEW_TEXT =
  "We want to remodel our kitchen — new cabinets, quartz countertops, and better lighting. The layout feels cramped and we'd love a bigger island.";

const TYPEWRITER_INTERVAL_MS = 32;

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

function DescribePreview({ isActive = true }: { isActive?: boolean }) {
  const displayedText = useTypewriter(DESCRIBE_PREVIEW_TEXT, isActive);

  return (
    <PreviewShell>
      <div className="flex h-full min-h-0 flex-col">
        <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          New project
        </p>
        <Textarea
          readOnly
          value={displayedText}
          className="min-h-36 flex-1 resize-none text-sm leading-relaxed md:min-h-0"
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
    </PreviewShell>
  );
}

const SCOPE_PREVIEW_CHOICES = ["Quartz", "Granite", "Butcher block"] as const;
const SCOPE_PREVIEW_SELECTED_CHOICE = SCOPE_PREVIEW_CHOICES[0];
const SCOPE_PREVIEW_ITEMS = [
  "Remove existing cabinets and countertops",
  "Install new shaker-style cabinets",
  "Install quartz countertops with undermount sink",
] as const;
const SCOPE_CHOICE_SELECT_DELAY_MS = 700;
const SCOPE_ITEMS_START_DELAY_MS = 1100;
const SCOPE_ITEM_STAGGER_MS = 350;

function useScopePreviewAnimation(isActive: boolean) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [visibleScopeCount, setVisibleScopeCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setSelectedChoice(null);
      setVisibleScopeCount(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setSelectedChoice(SCOPE_PREVIEW_SELECTED_CHOICE);
      setVisibleScopeCount(SCOPE_PREVIEW_ITEMS.length);
      return;
    }

    setSelectedChoice(null);
    setVisibleScopeCount(0);

    const choiceTimeoutId = window.setTimeout(() => {
      setSelectedChoice(SCOPE_PREVIEW_SELECTED_CHOICE);
    }, SCOPE_CHOICE_SELECT_DELAY_MS);

    const itemTimeoutIds = SCOPE_PREVIEW_ITEMS.map((_, index) =>
      window.setTimeout(() => {
        setVisibleScopeCount(index + 1);
      }, SCOPE_ITEMS_START_DELAY_MS + index * SCOPE_ITEM_STAGGER_MS)
    );

    return () => {
      window.clearTimeout(choiceTimeoutId);
      itemTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [isActive]);

  return { selectedChoice, visibleScopeCount };
}

function ScopePreview({ isActive = true }: { isActive?: boolean }) {
  const { selectedChoice, visibleScopeCount } =
    useScopePreviewAnimation(isActive);

  return (
    <PreviewShell>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-900">
            What countertop material are you considering?
          </p>
          <div className="flex flex-wrap gap-2">
            {SCOPE_PREVIEW_CHOICES.map((choice) => {
              const isSelected = selectedChoice === choice;

              return (
                <button
                  key={choice}
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors duration-300 ease-out",
                    "pointer-events-none",
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-700"
                  )}
                  tabIndex={-1}
                  aria-hidden
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
              ✦
            </span>
            Scope of work
          </div>
          {SCOPE_PREVIEW_ITEMS.map((item, index) => (
            <div
              key={item}
              className={cn(
                "flex items-center gap-2 rounded-[4px] bg-neutral-50 px-3 py-2 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
                index < visibleScopeCount
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              )}
              aria-hidden={index >= visibleScopeCount}
            >
              <span className="min-w-0 flex-1 text-sm text-neutral-800">
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
      </div>
    </PreviewShell>
  );
}

const SHARE_CARD_SCALE_DELAY_MS = 50;
const SHARE_COPY_TAP_DELAY_MS = 900;
const SHARE_COPY_TAP_DURATION_MS = 180;
const SHARE_TOAST_DELAY_MS = 1050;

function useSharePreviewAnimation(isActive: boolean) {
  const [cardScaledIn, setCardScaledIn] = useState(false);
  const [copyPressed, setCopyPressed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCardScaledIn(false);
      setCopyPressed(false);
      setToastVisible(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCardScaledIn(true);
      setToastVisible(true);
      return;
    }

    setCardScaledIn(false);
    setCopyPressed(false);
    setToastVisible(false);

    const cardTimeoutId = window.setTimeout(() => {
      setCardScaledIn(true);
    }, SHARE_CARD_SCALE_DELAY_MS);

    const copyPressStartId = window.setTimeout(() => {
      setCopyPressed(true);
    }, SHARE_COPY_TAP_DELAY_MS);

    const copyPressEndId = window.setTimeout(() => {
      setCopyPressed(false);
    }, SHARE_COPY_TAP_DELAY_MS + SHARE_COPY_TAP_DURATION_MS);

    const toastTimeoutId = window.setTimeout(() => {
      setToastVisible(true);
    }, SHARE_TOAST_DELAY_MS);

    return () => {
      window.clearTimeout(cardTimeoutId);
      window.clearTimeout(copyPressStartId);
      window.clearTimeout(copyPressEndId);
      window.clearTimeout(toastTimeoutId);
    };
  }, [isActive]);

  return { cardScaledIn, copyPressed, toastVisible };
}

function SharePreview({ isActive = true }: { isActive?: boolean }) {
  const { cardScaledIn, copyPressed, toastVisible } =
    useSharePreviewAnimation(isActive);

  return (
    <PreviewShell className="overflow-visible">
      <div className="relative h-full min-h-0">
        <div
          className={cn(
            "origin-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out",
            cardScaledIn ? "scale-100" : "scale-90"
          )}
        >
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-neutral-600" aria-hidden />
            <p className="font-display text-lg text-neutral-900">
              Share project scope
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Share link</p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value="scopebuddy.ai/share/kitchen-remodel"
                className="text-xs"
                aria-hidden
              />
              <Button
                type="button"
                size="icon"
                className={cn(
                  "h-11 w-11 shrink-0 pointer-events-none motion-safe:transition-transform motion-safe:duration-150",
                  copyPressed && "scale-90 translate-y-px"
                )}
                tabIndex={-1}
                aria-hidden
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-neutral-700">
              Send to contractor
            </p>
            <Input
              readOnly
              value="contractor@example.com"
              className="text-sm"
              aria-hidden
            />
          </div>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            toastVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          )}
          aria-hidden={!toastVisible}
        >
          <div className="rounded-[4px] border border-[var(--border)] bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            Link copied
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

const COMPARE_PREVIEW_BIDS = [
  { name: "Riverview Builders", amount: "$42,800", aligned: true },
  { name: "Oak & Stone Co.", amount: "$44,200", aligned: true },
  { name: "Quick Fix LLC", amount: "$31,500", aligned: false },
] as const;
const COMPARE_BID_STAGGER_MS = 400;
const COMPARE_BIDS_START_DELAY_MS = 300;

function useComparePreviewAnimation(isActive: boolean) {
  const [visibleBidCount, setVisibleBidCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleBidCount(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisibleBidCount(COMPARE_PREVIEW_BIDS.length);
      return;
    }

    setVisibleBidCount(0);

    const timeoutIds = COMPARE_PREVIEW_BIDS.map((_, index) =>
      window.setTimeout(() => {
        setVisibleBidCount(index + 1);
      }, COMPARE_BIDS_START_DELAY_MS + index * COMPARE_BID_STAGGER_MS)
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [isActive]);

  return visibleBidCount;
}

function ComparePreview({ isActive = true }: { isActive?: boolean }) {
  const visibleBidCount = useComparePreviewAnimation(isActive);

  return (
    <PreviewShell>
      <p className="mb-4 text-sm font-medium text-neutral-900">
        Bids on the same scope
      </p>
      <div className="space-y-3">
        {COMPARE_PREVIEW_BIDS.map((bid, index) => (
          <div
            key={bid.name}
            className={cn(
              "flex items-center justify-between rounded-[4px] border px-3 py-3 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
              bid.aligned
                ? "border-[var(--border)] bg-white"
                : "border-amber-200/80 bg-amber-50/50",
              index < visibleBidCount
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            )}
            aria-hidden={index >= visibleBidCount}
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{bid.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {bid.aligned ? "Matches your scope" : "Missing key items"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900">
                {bid.amount}
              </span>
              {bid.aligned ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

const previews = [
  DescribePreview,
  ScopePreview,
  SharePreview,
  ComparePreview,
] as const;

export const HowItWorksStepPreview = memo(function HowItWorksStepPreview({
  step,
  isActive = true,
}: {
  step: number;
  isActive?: boolean;
}) {
  if (step === 0) {
    return <DescribePreview isActive={isActive} />;
  }

  if (step === 1) {
    return <ScopePreview isActive={isActive} />;
  }

  if (step === 2) {
    return <SharePreview isActive={isActive} />;
  }

  if (step === 3) {
    return <ComparePreview isActive={isActive} />;
  }

  const Preview = previews[step] ?? DescribePreview;
  return <Preview />;
});
