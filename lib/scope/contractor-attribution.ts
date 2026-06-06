import {
  isShareLinkPlaceholder,
  SHARE_LINK_PLACEHOLDER_NAME,
} from "@/lib/contractor/project-share";
import { createServiceClient } from "@/lib/db/supabase";
import type { ScopeItem } from "@/types";

type SuggestionInviteRow = {
  id: string;
  contractor_invitations:
    | {
        contractor_name: string;
        contractor_email: string;
      }
    | {
        contractor_name: string;
        contractor_email: string;
      }[]
    | null;
};

function readInvitationFromRow(row: SuggestionInviteRow) {
  const invite = row.contractor_invitations;
  if (!invite) return null;
  return Array.isArray(invite) ? invite[0] ?? null : invite;
}

function resolveContractorAttributionName(
  name: string,
  email: string
): string | null {
  if (isShareLinkPlaceholder({ contractor_email: email })) {
    return null;
  }

  if (name.trim() === SHARE_LINK_PLACEHOLDER_NAME) {
    return null;
  }

  return name.trim() || null;
}

export async function enrichScopeItemsWithContractorAttribution<
  T extends ScopeItem,
>(items: T[]): Promise<T[]> {
  const suggestionIds = items
    .map((item) => item.suggestion_id)
    .filter((id): id is string => Boolean(id));

  if (suggestionIds.length === 0) {
    return items;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scope_suggestions")
    .select("id, contractor_invitations(contractor_name, contractor_email)")
    .in("id", suggestionIds);

  if (error) throw error;

  const nameBySuggestionId = new Map<string, string>();
  for (const row of data ?? []) {
    const invite = readInvitationFromRow(row as SuggestionInviteRow);
    if (!invite) continue;

    const name = resolveContractorAttributionName(
      invite.contractor_name,
      invite.contractor_email
    );
    if (name) {
      nameBySuggestionId.set(row.id, name);
    }
  }

  return items.map((item) => {
    if (!item.suggestion_id) return item;

    const contractorAttributionName = nameBySuggestionId.get(item.suggestion_id);
    if (!contractorAttributionName) return item;

    return {
      ...item,
      contractor_attribution_name: contractorAttributionName,
    };
  });
}
