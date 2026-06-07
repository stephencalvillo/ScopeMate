import { z } from "zod";
import { SCOPE_CATEGORIES } from "@/types";

const categorySchema = z.enum(SCOPE_CATEGORIES);

export const contractorRateInputSchema = z.object({
  category: categorySchema,
  label: z.string().trim().max(120).optional(),
  labor_cost: z.coerce.number().min(0).max(99_999_999),
  material_cost: z.coerce.number().min(0).max(99_999_999),
});

export const saveContractorRatesSchema = z.object({
  rates: z.array(contractorRateInputSchema).max(SCOPE_CATEGORIES.length),
});
