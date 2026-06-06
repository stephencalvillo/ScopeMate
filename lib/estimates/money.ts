export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function estimateRangeBounds(laborCost: number, materialCost: number) {
  const low = roundMoney(Math.min(laborCost, materialCost));
  const high = roundMoney(Math.max(laborCost, materialCost));
  return { low, high };
}

export function normalizeEstimateRangeStorage(
  laborCost: number,
  materialCost: number
) {
  const { low, high } = estimateRangeBounds(laborCost, materialCost);
  return { labor_cost: low, material_cost: high };
}

export function lineItemTotal(laborCost: number, materialCost: number): number {
  return estimateRangeBounds(laborCost, materialCost).high;
}

export function sumLineItems(
  items: Array<Pick<{ total: number }, "total">>
): number {
  return roundMoney(items.reduce((sum, item) => sum + item.total, 0));
}

export function proposalRangeFromLineItems(
  items: Array<Pick<EstimateLineItemLike, "labor_cost" | "material_cost">>
) {
  let minTotal = 0;
  let maxTotal = 0;

  for (const item of items) {
    const { low, high } = estimateRangeBounds(
      Number(item.labor_cost) || 0,
      Number(item.material_cost) || 0
    );
    minTotal += low;
    maxTotal += high;
  }

  return {
    minTotal: roundMoney(minTotal),
    maxTotal: roundMoney(maxTotal),
  };
}

type EstimateLineItemLike = {
  labor_cost: number;
  material_cost: number;
};

export function formatProposalRange(minTotal: number, maxTotal: number): string {
  if (minTotal <= 0 && maxTotal <= 0) {
    return "";
  }

  if (minTotal === maxTotal) {
    return formatCurrency(maxTotal);
  }

  return `${formatCurrency(minTotal)} – ${formatCurrency(maxTotal)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ESTIMATE_DISCLAIMER =
  "Draft pricing only. Final costs must be verified on site by the contractor.";

export const PROPOSAL_DISCLAIMER =
  "Proposal for planning purposes. Final pricing is subject to on-site verification.";
