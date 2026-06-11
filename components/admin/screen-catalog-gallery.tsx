"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScreenPreviewFrame } from "@/components/admin/screen-preview-frame";
import {
  getPreviewPath,
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
  const [selectedId, setSelectedId] = useState(screens[0]?.id ?? null);
  const selectedScreen = useMemo(
    () => screens.find((screen) => screen.id === selectedId) ?? screens[0] ?? null,
    [screens, selectedId]
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
            One preview per page. Tabs and in-page navigation stay interactive
            inside the preview frame.
          </p>
        </div>
        <Link
          href="/adminpanel/screens"
          className="text-sm text-neutral-700 underline-offset-4 hover:underline"
        >
          Back to catalog
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-6">
          {groupedScreens.map(([category, items]) => (
            <div key={category} className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {category}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {items.map((screen) => {
                  const isSelected = selectedScreen?.id === screen.id;

                  return (
                    <button
                      key={screen.id}
                      type="button"
                      onClick={() => setSelectedId(screen.id)}
                      className={cn(
                        "rounded-[var(--radius-card)] border p-4 text-left transition",
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-[var(--border)] bg-white hover:border-neutral-300"
                      )}
                    >
                      <ScreenThumbnailCard
                        screen={screen}
                        inverted={isSelected}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {selectedScreen ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{selectedScreen.title}</CardTitle>
                  <CardDescription>
                    Production path:{" "}
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-800">
                      {selectedScreen.productionPath}
                    </code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--muted)]">
                    {selectedScreen.description}
                  </p>
                </CardContent>
              </Card>

              <ScreenPreviewFrame
                previewPath={getPreviewPath(selectedScreen.id)}
                title={selectedScreen.title}
              />
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-sm text-[var(--muted)]">
                No screens configured for this audience yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ScreenThumbnailCard({
  screen,
  inverted = false,
}: {
  screen: ScreenCatalogEntry;
  inverted?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "aspect-[16/10] overflow-hidden rounded-[6px] border",
          inverted
            ? "border-white/20 bg-white/10"
            : "border-[var(--border)] bg-[linear-gradient(180deg,#fafaf9_0%,#f0f0ec_100%)]"
        )}
      >
        <div className="flex h-full flex-col p-3">
          <div
            className={cn(
              "mb-3 h-2 w-16 rounded-full",
              inverted ? "bg-white/30" : "bg-neutral-300"
            )}
          />
          <div
            className={cn(
              "mb-2 h-2 w-24 rounded-full",
              inverted ? "bg-white/20" : "bg-neutral-200"
            )}
          />
          <div className="mt-auto grid grid-cols-3 gap-2">
            <div
              className={cn(
                "h-8 rounded-[4px]",
                inverted ? "bg-white/15" : "bg-white"
              )}
            />
            <div
              className={cn(
                "col-span-2 h-8 rounded-[4px]",
                inverted ? "bg-white/15" : "bg-white"
              )}
            />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">{screen.title}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            inverted ? "text-white/70" : "text-[var(--muted)]"
          )}
        >
          {screen.productionPath}
        </p>
      </div>
    </div>
  );
}
