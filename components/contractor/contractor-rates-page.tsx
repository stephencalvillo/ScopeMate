"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EstimateRangeInputs } from "@/components/estimate/estimate-range-inputs";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCategoryLabel } from "@/lib/utils";
import { SCOPE_CATEGORIES, type ContractorRateItem } from "@/types";

type RateDraft = {
  category: (typeof SCOPE_CATEGORIES)[number];
  label: string;
  labor_cost: string;
  material_cost: string;
};

function emptyDraft(
  category: (typeof SCOPE_CATEGORIES)[number]
): RateDraft {
  return {
    category,
    label: formatCategoryLabel(category),
    labor_cost: "",
    material_cost: "",
  };
}

function draftFromRate(rate: ContractorRateItem): RateDraft {
  return {
    category: rate.category as RateDraft["category"],
    label: rate.label,
    labor_cost: String(rate.labor_cost),
    material_cost: String(rate.material_cost),
  };
}

function buildInitialDrafts(rates: ContractorRateItem[]) {
  const byCategory = new Map(rates.map((rate) => [rate.category, rate]));

  return SCOPE_CATEGORIES.map((category) => {
    const existing = byCategory.get(category);
    return existing ? draftFromRate(existing) : emptyDraft(category);
  });
}

function parseDraftValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function ContractorRatesPage() {
  const [drafts, setDrafts] = useState<RateDraft[]>(() =>
    SCOPE_CATEGORIES.map(emptyDraft)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contractor/rates");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load saved rates.");
      }

      setDrafts(buildInitialDrafts(data.rates ?? []));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load saved rates."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const configuredCount = useMemo(
    () =>
      drafts.filter(
        (draft) =>
          parseDraftValue(draft.labor_cost) > 0 ||
          parseDraftValue(draft.material_cost) > 0
      ).length,
    [drafts]
  );

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const rates = drafts
        .map((draft) => ({
          category: draft.category,
          label: draft.label.trim() || formatCategoryLabel(draft.category),
          labor_cost: parseDraftValue(draft.labor_cost),
          material_cost: parseDraftValue(draft.material_cost),
        }))
        .filter((rate) => rate.labor_cost > 0 || rate.material_cost > 0);

      const response = await fetch("/api/contractor/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save rates.");
      }

      setDrafts(buildInitialDrafts(data.rates ?? []));
      setMessage("Saved rates updated.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save rates."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateDraft(
    category: RateDraft["category"],
    patch: Partial<Pick<RateDraft, "label" | "labor_cost" | "material_cost">>
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.category === category ? { ...draft, ...patch } : draft
      )
    );
  }

  return (
    <div className="space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/contractor" />}>
        <div className="space-y-2">
          <h1 className="font-display text-4xl tracking-tight text-neutral-900">
            Saved rates
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Set default price ranges by trade. Use{" "}
            <span className="font-medium text-neutral-900">Apply my rates</span>{" "}
            in a review to prefill matching categories.
          </p>
        </div>
      </PageBreadcrumbHeader>

      <PageSection
        title="Default rates by category"
        description={`${configuredCount} of ${SCOPE_CATEGORIES.length} categories configured.`}
      >
        {loading ? (
          <SectionSurface>
            <p className="text-sm text-[var(--muted)]">Loading saved rates...</p>
          </SectionSurface>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <SectionSurface
                key={draft.category}
                className="grid gap-4 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,15rem)] md:items-end"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {formatCategoryLabel(draft.category)}
                  </p>
                  <Input
                    value={draft.label}
                    onChange={(event) =>
                      updateDraft(draft.category, { label: event.target.value })
                    }
                    placeholder="Optional label"
                    className="text-sm"
                  />
                </div>
                <p className="hidden text-sm text-[var(--muted)] md:block">
                  Applies to scope items in this category when you apply saved
                  rates on a review.
                </p>
                <EstimateRangeInputs
                  minValue={draft.labor_cost}
                  maxValue={draft.material_cost}
                  onMinChange={(value) =>
                    updateDraft(draft.category, { labor_cost: value })
                  }
                  onMaxChange={(value) =>
                    updateDraft(draft.category, { material_cost: value })
                  }
                />
              </SectionSurface>
            ))}
          </div>
        )}
      </PageSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {message ? (
            <p className="text-sm text-[var(--muted)]">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            disabled={loading || saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : "Save rates"}
          </Button>
        </div>
      </div>
    </div>
  );
}
