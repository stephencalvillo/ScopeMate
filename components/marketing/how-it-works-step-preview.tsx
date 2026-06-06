import { Check, Copy, Link2 } from "lucide-react";
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
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      <CardContent className="p-4 md:p-5">{children}</CardContent>
    </Card>
  );
}

function DescribePreview() {
  return (
    <PreviewShell>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        New project
      </p>
      <Textarea
        readOnly
        value="We want to remodel our kitchen — new cabinets, quartz countertops, and better lighting. The layout feels cramped and we'd love a bigger island."
        className="min-h-36 resize-none text-sm leading-relaxed"
        aria-hidden
      />
      <p className="mt-3 text-xs text-[var(--muted)]">
        Describe your project in your own words
      </p>
    </PreviewShell>
  );
}

function ScopePreview() {
  return (
    <PreviewShell>
      <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-900">
          What countertop material are you considering?
        </p>
        <div className="flex flex-wrap gap-2">
          {["Quartz", "Granite", "Butcher block"].map((choice, index) => (
            <Button
              key={choice}
              type="button"
              variant={index === 0 ? "default" : "secondary"}
              size="sm"
              className="pointer-events-none"
              tabIndex={-1}
              aria-hidden
            >
              {choice}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
            ✦
          </span>
          Scope of work
        </div>
        {[
          "Remove existing cabinets and countertops",
          "Install new shaker-style cabinets",
          "Install quartz countertops with undermount sink",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[4px] bg-neutral-50 px-3 py-2 text-sm text-neutral-800"
          >
            {item}
          </div>
        ))}
      </div>
      </div>
    </PreviewShell>
  );
}

function SharePreview() {
  return (
    <PreviewShell>
      <div className="mb-4 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-neutral-600" aria-hidden />
        <p className="font-display text-lg text-neutral-900">Share project scope</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Share link</p>
        <div className="flex gap-2">
          <Input
            readOnly
            value="scopemate.app/share/kitchen-remodel"
            className="text-xs"
            aria-hidden
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="shrink-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-neutral-700">Send to contractor</p>
        <Input
          readOnly
          value="contractor@example.com"
          className="text-sm"
          aria-hidden
        />
      </div>
    </PreviewShell>
  );
}

function ComparePreview() {
  const bids = [
    { name: "Riverview Builders", amount: "$42,800", aligned: true },
    { name: "Oak & Stone Co.", amount: "$44,200", aligned: true },
    { name: "Quick Fix LLC", amount: "$31,500", aligned: false },
  ];

  return (
    <PreviewShell>
      <p className="mb-4 text-sm font-medium text-neutral-900">
        Bids on the same scope
      </p>
      <div className="space-y-3">
        {bids.map((bid) => (
          <div
            key={bid.name}
            className={cn(
              "flex items-center justify-between rounded-[4px] border px-3 py-3",
              bid.aligned
                ? "border-[var(--border)] bg-white"
                : "border-amber-200/80 bg-amber-50/50"
            )}
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

export function HowItWorksStepPreview({ step }: { step: number }) {
  const Preview = previews[step] ?? DescribePreview;
  return <Preview />;
}
