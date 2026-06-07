"use client";

import { useMemo } from "react";
import { SubmittedScopeEstimateRange } from "@/components/estimate/submitted-scope-estimate-range";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemWithEstimateRange } from "@/components/scope/scope-item-with-estimate-range";
import { PageSection } from "@/components/layout/page-section";
import { buildSubmittedEstimateDisplay } from "@/lib/estimates/submitted-estimate-display";
import { groupScopeItemsByCategory } from "@/lib/scope/group-by-category";
import type { ContractorEstimate, ScopeItem } from "@/types";

export function ReadOnlyProposalEstimate({
  scopeItems,
  estimate,
}: {
  scopeItems: ScopeItem[];
  estimate: ContractorEstimate;
}) {
  const lineItems = estimate.line_items ?? [];
  const estimateDisplay = useMemo(
    () =>
      lineItems.length > 0
        ? buildSubmittedEstimateDisplay({ scopeItems, lineItems })
        : null,
    [lineItems, scopeItems]
  );
  const groups = useMemo(
    () => groupScopeItemsByCategory(scopeItems),
    [scopeItems]
  );

  const usesItemPricing = estimateDisplay?.pricingMode === "item";
  const usesSectionPricing = estimateDisplay?.pricingMode === "section";

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        This project does not have any scope items yet.
      </p>
    );
  }

  return (
    <PageSection title="Scope of work">
      <div className="space-y-3">
        {groups.map((group) => {
          const sectionRange = estimateDisplay?.sectionRanges.get(group.category);

          return (
            <ScopeCategoryGroup
              key={group.category}
              category={group.category}
              itemCount={group.items.length}
              chevronAfterAside={usesSectionPricing && Boolean(sectionRange)}
              headerAside={
                usesSectionPricing && sectionRange ? (
                  <SubmittedScopeEstimateRange
                    laborCost={sectionRange.labor_cost}
                    materialCost={sectionRange.material_cost}
                  />
                ) : null
              }
            >
              {group.items.map((item) => {
                const itemRange = estimateDisplay?.scopeItemRanges.get(item.id);

                return (
                  <ScopeItemWithEstimateRange
                    key={item.id}
                    item={item}
                    range={usesItemPricing ? itemRange : null}
                  />
                );
              })}
            </ScopeCategoryGroup>
          );
        })}
      </div>
    </PageSection>
  );
}
