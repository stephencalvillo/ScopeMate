import { ForbiddenError } from "@/lib/auth/clerk";
import { createServiceClient } from "@/lib/db/supabase";
import { formatCategoryLabel } from "@/lib/utils";
import type { ContractorRateItem } from "@/types";
import { SCOPE_CATEGORIES } from "@/types";

export type ContractorRateInput = {
  category: (typeof SCOPE_CATEGORIES)[number];
  label?: string;
  labor_cost: number;
  material_cost: number;
};

export async function listContractorRates(
  userId: string
): Promise<ContractorRateItem[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_rate_items")
    .select("*")
    .eq("contractor_user_id", userId)
    .order("sort_order", { ascending: true })
    .order("category", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContractorRateItem[];
}

export async function replaceContractorRates(
  userId: string,
  rates: ContractorRateInput[]
): Promise<ContractorRateItem[]> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const normalized = rates
    .filter((rate) => rate.labor_cost > 0 || rate.material_cost > 0)
    .map((rate, index) => ({
      contractor_user_id: userId,
      category: rate.category,
      label: rate.label?.trim() || formatCategoryLabel(rate.category),
      labor_cost: rate.labor_cost,
      material_cost: rate.material_cost,
      sort_order: index,
      updated_at: now,
    }));

  const { error: deleteError } = await supabase
    .from("contractor_rate_items")
    .delete()
    .eq("contractor_user_id", userId);

  if (deleteError) throw deleteError;

  if (normalized.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("contractor_rate_items")
    .insert(normalized)
    .select("*");

  if (error) throw error;
  return (data ?? []) as ContractorRateItem[];
}

export async function getContractorRate(
  userId: string,
  rateId: string
): Promise<ContractorRateItem> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contractor_rate_items")
    .select("*")
    .eq("id", rateId)
    .eq("contractor_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ForbiddenError("Rate not found.");
  }

  return data as ContractorRateItem;
}
