import { ForbiddenError } from "@/lib/auth/clerk";
import { isMissingTableError } from "@/lib/db/errors";
import { createServiceClient } from "@/lib/db/supabase";
import { lineItemTotal, normalizeEstimateRangeStorage, sumLineItems } from "@/lib/estimates/money";
import type {
  ContractorEstimate,
  ContractorReview,
  EstimateLineItem,
  EstimateStatus,
} from "@/types";

export type EstimateLineItemInput = {
  id?: string;
  scope_item_id?: string | null;
  description: string;
  labor_cost: number;
  material_cost: number;
};

function normalizeLineItem(row: EstimateLineItem): EstimateLineItem {
  return {
    ...row,
    labor_cost: Number(row.labor_cost),
    material_cost: Number(row.material_cost),
    total: Number(row.total),
  };
}

function normalizeEstimate(
  estimate: ContractorEstimate,
  lineItems: EstimateLineItem[] = []
): ContractorEstimate {
  return {
    ...estimate,
    total: Number(estimate.total),
    line_items: lineItems.map(normalizeLineItem),
  };
}

export function estimateIsEditable(estimate: ContractorEstimate): boolean {
  return estimate.status === "draft";
}

export function estimateAwaitingDecision(estimate: ContractorEstimate): boolean {
  return estimate.status === "submitted";
}

export async function getEstimateForReview(reviewId: string) {
  const supabase = createServiceClient();

  try {
    const { data: estimate, error } = await supabase
      .from("contractor_estimates")
      .select("*")
      .eq("review_id", reviewId)
      .maybeSingle();

    if (error) throw error;
    if (!estimate) return null;

    const { data: lineItems, error: lineItemsError } = await supabase
      .from("estimate_line_items")
      .select("*")
      .eq("estimate_id", estimate.id)
      .order("sort_order", { ascending: true });

    if (lineItemsError) throw lineItemsError;

    return normalizeEstimate(
      estimate as ContractorEstimate,
      (lineItems ?? []) as EstimateLineItem[]
    );
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
}

export async function getSubmittedEstimateForInvitation({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}) {
  return getProposalEstimateForInvitation({ projectId, invitationId });
}

export async function getProposalEstimateForInvitation({
  projectId,
  invitationId,
}: {
  projectId: string;
  invitationId: string;
}) {
  const supabase = createServiceClient();

  try {
    const { data: estimate, error } = await supabase
      .from("contractor_estimates")
      .select("*")
      .eq("project_id", projectId)
      .eq("invitation_id", invitationId)
      .in("status", ["submitted", "accepted", "declined"])
      .maybeSingle();

    if (error) throw error;
    if (!estimate) return null;

    const { data: lineItems, error: lineItemsError } = await supabase
      .from("estimate_line_items")
      .select("*")
      .eq("estimate_id", estimate.id)
      .order("sort_order", { ascending: true });

    if (lineItemsError) throw lineItemsError;

    return normalizeEstimate(
      estimate as ContractorEstimate,
      (lineItems ?? []) as EstimateLineItem[]
    );
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
}

async function ensureEstimateRecord({
  projectId,
  reviewId,
  invitationId,
}: {
  projectId: string;
  reviewId: string;
  invitationId: string;
}) {
  const existing = await getEstimateForReview(reviewId);
  if (existing) return existing;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_estimates")
    .insert({
      project_id: projectId,
      review_id: reviewId,
      invitation_id: invitationId,
      status: "draft",
      total: 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  return normalizeEstimate(data as ContractorEstimate, []);
}

export async function saveEstimateLineItems({
  review,
  lineItems,
}: {
  review: ContractorReview;
  lineItems: EstimateLineItemInput[];
}) {
  const estimate = await ensureEstimateRecord({
    projectId: review.project_id,
    reviewId: review.id,
    invitationId: review.invitation_id,
  });

  if (!estimateIsEditable(estimate)) {
    throw new ForbiddenError("This proposal has already been submitted.");
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const normalizedRows = lineItems.map((item, index) => {
    const { labor_cost: laborCost, material_cost: materialCost } =
      normalizeEstimateRangeStorage(item.labor_cost, item.material_cost);

    return {
      scope_item_id: item.scope_item_id ?? null,
      description: item.description.trim(),
      labor_cost: laborCost,
      material_cost: materialCost,
      total: lineItemTotal(laborCost, materialCost),
      sort_order: index,
      updated_at: now,
    };
  });
  const total = sumLineItems(normalizedRows);

  const { error: deleteError } = await supabase
    .from("estimate_line_items")
    .delete()
    .eq("estimate_id", estimate.id);

  if (deleteError) throw deleteError;

  let inserted: EstimateLineItem[] = [];

  if (normalizedRows.length > 0) {
    const { data, error } = await supabase
      .from("estimate_line_items")
      .insert(
        normalizedRows.map((row) => ({
          estimate_id: estimate.id,
          ...row,
        }))
      )
      .select("*");

    if (error) throw error;
    inserted = (data ?? []) as EstimateLineItem[];
  }

  const { data: updatedEstimate, error: updateError } = await supabase
    .from("contractor_estimates")
    .update({
      total,
      updated_at: now,
    })
    .eq("id", estimate.id)
    .select("*")
    .single();

  if (updateError) throw updateError;

  return normalizeEstimate(updatedEstimate as ContractorEstimate, inserted);
}

export async function replaceEstimateLineItems({
  review,
  lineItems,
}: {
  review: ContractorReview;
  lineItems: EstimateLineItemInput[];
}) {
  return saveEstimateLineItems({ review, lineItems });
}

export async function submitDraftEstimateIfPresent(review: ContractorReview) {
  const estimate = await getEstimateForReview(review.id);

  if (!estimate || !estimateIsEditable(estimate)) {
    return estimate;
  }

  if ((estimate.line_items ?? []).length === 0) {
    return null;
  }

  return submitEstimateForReview(review);
}

export async function submitEstimateForReview(review: ContractorReview) {
  const estimate = await getEstimateForReview(review.id);

  if (!estimate) {
    throw new ForbiddenError("Add line items before submitting a proposal.");
  }

  if (!estimateIsEditable(estimate)) {
    return estimate;
  }

  if ((estimate.line_items ?? []).length === 0) {
    throw new ForbiddenError("Add line items before submitting a proposal.");
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("contractor_estimates")
    .update({
      status: "submitted" satisfies EstimateStatus,
      submitted_at: now,
      updated_at: now,
    })
    .eq("id", estimate.id)
    .select("*")
    .single();

  if (error) throw error;

  return normalizeEstimate(
    data as ContractorEstimate,
    estimate.line_items ?? []
  );
}
