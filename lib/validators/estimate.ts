import { z } from "zod";

export const estimateLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  scope_item_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(500),
  labor_cost: z.coerce.number().min(0).max(99_999_999),
  material_cost: z.coerce.number().min(0).max(99_999_999),
});

export const saveEstimateSchema = z.object({
  line_items: z.array(estimateLineItemSchema).min(1).max(100),
});
