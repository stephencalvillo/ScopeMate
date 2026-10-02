"use client";

import { useEffect, useState } from "react";
import { GridBackground } from "@/components/marketing/grid-background";
import { ScreenFlowMap } from "@/components/admin/screen-flow-map";
import { ScreenPreviewPanel } from "@/components/admin/screen-preview-panel";
import type {
  ScreenAudience,
  ScreenCatalogEntry,
} from "@/lib/admin/screen-catalog";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!selectedScreen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedScreen(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedScreen]);

  function handleSelect(screen: ScreenCatalogEntry) {
    setSelectedScreen((current) => (current?.id === screen.id ? null : screen));
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <section
        className={cn(
          "relative min-h-0 min-w-0",
          selectedScreen ? "h-1/2 w-full lg:h-full lg:w-1/2" : "h-full w-full"
        )}
      >
        <GridBackground fade="none" layers="minimal" />
        <div className="relative z-10 h-full overflow-auto p-6 sm:p-8">
          {screens.length > 0 ? (
            <ScreenFlowMap
              audience={audience}
              screens={screens}
              selectedId={selectedScreen?.id ?? null}
              onSelect={handleSelect}
            />
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No screens configured for this audience yet.
            </p>
          )}
        </div>
      </section>

      {selectedScreen ? (
        <ScreenPreviewPanel
          screen={selectedScreen}
          onClose={() => setSelectedScreen(null)}
        />
      ) : null}
    </div>
  );
}
