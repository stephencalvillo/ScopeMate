"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ScreenPreviewModal } from "@/components/admin/screen-preview-modal";
import {
  type ScreenAudience,
  type ScreenCatalogEntry,
} from "@/lib/admin/screen-catalog";
import { cn } from "@/lib/utils";

const audienceLabels: Record<ScreenAudience, string> = {
  homeowner: "Homeowner",
  contractor: "Contractor",
};

export function ScreenCatalogGallery({
  audience,
  screens,
}: {
  audience: ScreenAudience;
  screens: ScreenCatalogEntry[];
}) {
  const [selectedScreen, setSelectedScreen] = useState<ScreenCatalogEntry | null>(
    null
  );

  const groupedScreens = useMemo(() => {
    const groups = new Map<string, ScreenCatalogEntry[]>();

    for (const screen of screens) {
      const items = groups.get(screen.category) ?? [];
      items.push(screen);
      groups.set(screen.category, items);
    }

    return Array.from(groups.entries());
  }, [screens]);

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Screen catalog
            </p>
            <h1 className="font-display text-3xl tracking-tight text-neutral-900">
              {audienceLabels[audience]} screens
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Click a screen to open an interactive preview with mock data. Tabs
              and in-page navigation work inside the modal.
            </p>
          </div>
          <Link
            href="/adminpanel/screens"
            className="text-sm text-neutral-700 underline-offset-4 hover:underline"
          >
            Back to catalog
          </Link>
        </div>

        {groupedScreens.length > 0 ? (
          <div className="space-y-10">
            {groupedScreens.map(([category, items]) => (
              <section key={category} className="space-y-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  {category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((screen) => (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => setSelectedScreen(screen)}
                      className={cn(
                        "rounded-[var(--radius-card)] border border-[var(--border)] bg-white p-4 text-left transition",
                        "hover:border-neutral-300 hover:shadow-sm",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                      )}
                    >
                      <ScreenThumbnailCard screen={screen} />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No screens configured for this audience yet.
          </p>
        )}
      </div>

      <ScreenPreviewModal
        screen={selectedScreen}
        onClose={() => setSelectedScreen(null)}
      />
    </>
  );
}

function ScreenThumbnailCard({ screen }: { screen: ScreenCatalogEntry }) {
  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[linear-gradient(180deg,#fafaf9_0%,#f0f0ec_100%)]">
        <div className="flex h-full flex-col p-3">
          <div className="mb-3 h-2 w-16 rounded-full bg-neutral-300" />
          <div className="mb-2 h-2 w-24 rounded-full bg-neutral-200" />
          <div className="mt-auto grid grid-cols-3 gap-2">
            <div className="h-8 rounded-[4px] bg-white" />
            <div className="col-span-2 h-8 rounded-[4px] bg-white" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900">{screen.title}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{screen.productionPath}</p>
      </div>
    </div>
  );
}
