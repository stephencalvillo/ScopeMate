import { z } from "zod";

export const scopeItemPrioritySchema = z.enum([
  "required",
  "recommended",
  "optional",
]);

export const createScopeItemSchema = z.object({
  category: z.string().trim().min(1).max(60),
  text: z.string().trim().min(1, "Describe this scope item").max(500),
  priority: scopeItemPrioritySchema.default("recommended"),
  needs_verification: z.boolean().optional(),
});

export const updateScopeItemSchema = createScopeItemSchema.partial();

export const reorderScopeItemsSchema = z.object({
  item_ids: z.array(z.string().uuid()).min(1),
});

export const generateScopeSchema = z.object({
  additional_notes: z
    .string()
    .trim()
    .min(1, "Describe what you want to add")
    .max(4000)
    .optional(),
});
