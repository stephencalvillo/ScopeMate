import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PathCardProps = {
  audience: "homeowners" | "contractors";
  headline: string;
  description: string;
  cta: string;
  href: string;
  className?: string;
};

export function PathCard({
  audience,
  headline,
  description,
  cta,
  href,
  className,
}: PathCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block h-full rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        className
      )}
    >
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 ease-out group-hover:border-neutral-300 group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        )}
      >
        <CardContent className="flex flex-1 flex-col gap-6 p-6 md:p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--gold-text)]">
              {audience === "homeowners" ? "For homeowners" : "For contractors"}
            </p>
            <h3 className="font-display text-2xl tracking-tight text-neutral-900 text-balance">
              {headline}
            </h3>
            <p className="text-base leading-relaxed text-[var(--muted)]">
              {description}
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
            {cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-2"
              aria-hidden
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
