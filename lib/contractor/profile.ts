import { ForbiddenError } from "@/lib/auth/clerk";
import { isMissingColumnError } from "@/lib/db/errors";
import { buildReviewUrl } from "@/lib/contractor/urls";
import {
  isShareLinkPlaceholder,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import { createServiceClient } from "@/lib/db/supabase";
import {
  formatProposalRange,
  proposalRangeFromLineItems,
} from "@/lib/estimates/money";
import type {
  ContractorInvitationWithReview,
  ContractorProfile,
  ContractorReview,
  EstimateStatus,
  User,
} from "@/types";
import { type ContractorReviewListItem } from "@/lib/contractor/review-list-item";

export type { ContractorReviewListItem };
export {
  filterActiveContractorReviews,
  isAcceptedContractorReview,
  isActiveContractorReview,
  isHistoryContractorReview,
  isInReviewContractorReview,
  partitionContractorReviews,
} from "@/lib/contractor/review-list-item";

export type UpsertContractorProfileInput = {
  company_name: string;
  contact_name: string;
  service_area?: string | null;
  phone?: string | null;
  complete_onboarding?: boolean;
};

export function isContractorProfileReady(profile: ContractorProfile | null) {
  return Boolean(
    profile?.onboarding_completed_at &&
      profile.company_name.trim() &&
      profile.contact_name.trim() &&
      profile.service_area?.trim()
  );
}

export function hasShareLinkClaimProfile(profile: ContractorProfile | null) {
  return Boolean(profile?.company_name.trim() && profile.contact_name.trim());
}

function normalizeReview(
  review: ContractorReview | ContractorReview[] | null | undefined
): ContractorReview | null {
  if (!review) return null;
  return Array.isArray(review) ? review[0] ?? null : review;
}

export async function getContractorProfile(
  userId: string
): Promise<ContractorProfile | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as ContractorProfile | null) ?? null;
}

export async function linkInvitationsToContractor(user: Pick<User, "id" | "email">) {
  const supabase = createServiceClient();
  const normalizedEmail = user.email.trim().toLowerCase();

  const { error } = await supabase
    .from("contractor_invitations")
    .update({
      contractor_user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .is("contractor_user_id", null)
    .ilike("contractor_email", normalizedEmail);

  if (error) throw error;
}

export async function upsertContractorProfile(
  user: User,
  input: UpsertContractorProfileInput
): Promise<ContractorProfile> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const companyName = input.company_name.trim();
  const contactName = input.contact_name.trim() || user.name || "";
  const serviceArea = input.service_area?.trim() || null;

  if (!companyName) {
    throw new ForbiddenError("Company name is required.");
  }

  if (!contactName) {
    throw new ForbiddenError("Contact name is required.");
  }

  if (input.complete_onboarding && !serviceArea) {
    throw new ForbiddenError("Service area is required.");
  }

  const existing = await getContractorProfile(user.id);

  const profilePayload = {
    user_id: user.id,
    company_name: companyName,
    contact_name: contactName,
    service_area: serviceArea ?? existing?.service_area ?? null,
    phone: input.phone?.trim() || null,
    onboarding_completed_at: input.complete_onboarding
      ? existing?.onboarding_completed_at ?? now
      : existing?.onboarding_completed_at ?? null,
    updated_at: now,
  };

  let { data: profile, error: profileError } = await supabase
    .from("contractor_profiles")
    .upsert(profilePayload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (profileError && isMissingColumnError(profileError)) {
    const { service_area: _serviceArea, ...legacyPayload } = profilePayload;
    ({ data: profile, error: profileError } = await supabase
      .from("contractor_profiles")
      .upsert(legacyPayload, { onConflict: "user_id" })
      .select("*")
      .single());
  }

  if (profileError) throw profileError;

  await linkInvitationsToContractor(user);

  return profile as ContractorProfile;
}

export async function listContractorReviews(
  userId: string
): Promise<ContractorReviewListItem[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("contractor_invitations")
    .select(
      `
        *,
        contractor_reviews(*),
        projects(id, title, city, zip, location, project_type, accepted_estimate_id, ai_summary, original_description),
        contractor_estimates(
          id,
          status,
          submitted_at,
          accepted_at,
          declined_at,
          estimate_line_items(labor_cost, material_cost)
        )
      `
    )
    .eq("contractor_user_id", userId)
    .neq("status", "revoked")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const items: ContractorReviewListItem[] = [];

  for (const row of data ?? []) {
    const record = row as ContractorInvitationWithReview & {
      projects: ContractorReviewListItem["project"] | null;
      contractor_reviews: ContractorReview | ContractorReview[] | null;
      contractor_estimates:
        | {
            id: string;
            status: EstimateStatus;
            submitted_at: string | null;
            estimate_line_items: Array<{
              labor_cost: number;
              material_cost: number;
            }>;
          }
        | Array<{
            id: string;
            status: EstimateStatus;
            submitted_at: string | null;
            estimate_line_items: Array<{
              labor_cost: number;
              material_cost: number;
            }>;
          }>
        | null;
    };

    const project = record.projects;
    if (!project) continue;

    const invitationBase = { ...record };
    delete (invitationBase as { projects?: unknown }).projects;
    delete (invitationBase as { contractor_reviews?: unknown }).contractor_reviews;
    delete (invitationBase as { contractor_estimates?: unknown }).contractor_estimates;

    const invitation = invitationBase as ContractorInvitationWithReview;

    if (
      isShareLinkPlaceholder(invitation) &&
      !invitation.accepted_at &&
      invitation.status === "pending"
    ) {
      continue;
    }

    const review = normalizeReview(record.contractor_reviews);
    const estimateRaw = record.contractor_estimates;
    const estimate = Array.isArray(estimateRaw)
      ? estimateRaw[0] ?? null
      : estimateRaw;

    const lineItems = estimate?.estimate_line_items ?? [];
    const { minTotal, maxTotal } = proposalRangeFromLineItems(lineItems);
    const proposalRange = formatProposalRange(minTotal, maxTotal);

    const projectHasSelectedProposal = Boolean(project.accepted_estimate_id);
    const isSelectedProposal = Boolean(
      estimate?.id && project.accepted_estimate_id === estimate.id
    );

    items.push({
      invitation: {
        ...invitation,
        review,
        review_url: buildReviewUrl(invitation.invitation_token),
      },
      project,
      review_url: buildReviewUrl(invitation.invitation_token),
      proposal_range: proposalRange || null,
      estimate_status: estimate?.status ?? null,
      estimate_id: estimate?.id ?? null,
      estimate_submitted_at: estimate?.submitted_at ?? null,
      is_selected_proposal: isSelectedProposal,
      project_has_selected_proposal: projectHasSelectedProposal,
    });
  }

  return items;
}

export function contractorNeedsOnboarding(profile: ContractorProfile | null) {
  return !isContractorProfileReady(profile);
}

function isRealContractorName(name: string | null | undefined) {
  const trimmed = name?.trim() ?? "";
  return trimmed.length > 0 && trimmed !== SHARE_LINK_PLACEHOLDER_NAME;
}

export function canAutoCompleteContractorProfile(input: {
  contact_name?: string | null;
  company_name?: string | null;
}) {
  return (
    isRealContractorName(input.contact_name) &&
    Boolean(input.company_name?.trim())
  );
}

type InvitationIdentityRow = {
  contractor_name: string;
  contractor_company: string | null;
  updated_at: string;
};

async function listInvitationIdentityForUser(user: Pick<User, "id" | "email">) {
  const supabase = createServiceClient();
  const [byUserId, byEmail] = await Promise.all([
    supabase
      .from("contractor_invitations")
      .select("contractor_name, contractor_company, updated_at")
      .eq("contractor_user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contractor_invitations")
      .select("contractor_name, contractor_company, updated_at")
      .ilike("contractor_email", user.email.trim())
      .order("updated_at", { ascending: false }),
  ]);

  if (byUserId.error) throw byUserId.error;
  if (byEmail.error) throw byEmail.error;

  const seen = new Set<string>();
  const rows: InvitationIdentityRow[] = [];

  for (const row of [...(byUserId.data ?? []), ...(byEmail.data ?? [])]) {
    const key = `${row.contractor_name}::${row.contractor_company ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row as InvitationIdentityRow);
  }

  return rows.sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
  );
}

function profileInputFromPrefill(prefill?: {
  contactName?: string;
  companyName?: string;
  serviceArea?: string;
}) {
  if (!prefill) return null;

  const contactName = prefill.contactName?.trim() ?? "";
  const companyName = prefill.companyName?.trim() ?? "";
  const serviceArea = prefill.serviceArea?.trim() ?? "";

  if (
    !canAutoCompleteContractorProfile({
      contact_name: contactName,
      company_name: companyName,
    })
  ) {
    return null;
  }

  if (serviceArea) {
    return {
      company_name: companyName,
      contact_name: contactName,
      service_area: serviceArea,
      complete_onboarding: true,
    };
  }

  return {
    company_name: companyName,
    contact_name: contactName,
  };
}

export async function completeContractorSetupIfReady(
  user: User,
  options?: {
    prefill?: {
      contactName?: string;
      companyName?: string;
      serviceArea?: string;
    };
  }
): Promise<{ profile: ContractorProfile | null; ready: boolean }> {
  const existing = await getContractorProfile(user.id);
  if (isContractorProfileReady(existing)) {
    return { profile: existing, ready: true };
  }

  await linkInvitationsToContractor(user);

  const prefillInput = profileInputFromPrefill(options?.prefill);
  if (prefillInput?.complete_onboarding) {
    const profile = await upsertContractorProfile(user, {
      ...prefillInput,
      complete_onboarding: true,
    });
    return { profile, ready: isContractorProfileReady(profile) };
  }

  for (const invitation of await listInvitationIdentityForUser(user)) {
    if (
      !canAutoCompleteContractorProfile({
        contact_name: invitation.contractor_name,
        company_name: invitation.contractor_company,
      })
    ) {
      continue;
    }

    const profile = await upsertContractorProfile(user, {
      company_name: invitation.contractor_company!.trim(),
      contact_name: invitation.contractor_name.trim(),
      complete_onboarding: false,
    });

    return { profile, ready: isContractorProfileReady(profile) };
  }

  if (prefillInput) {
    const profile = await upsertContractorProfile(user, {
      ...prefillInput,
      complete_onboarding: prefillInput.complete_onboarding ?? false,
    });
    return { profile, ready: isContractorProfileReady(profile) };
  }

  return { profile: existing, ready: false };
}
