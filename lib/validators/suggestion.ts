import { z } from "zod";
import { SCOPE_CATEGORIES } from "@/types";

const categorySchema = z.enum(SCOPE_CATEGORIES);

export const createSuggestionSchema = z
  .object({
    suggestion_type: z.enum(["add", "edit", "remove", "note"]),
    target_scope_item_id: z.string().uuid().optional(),
    category: categorySchema.optional(),
    suggested_text: z.string().trim().max(2000).optional(),
    contractor_note: z.string().trim().max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.suggestion_type === "add" && !value.suggested_text?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Describe the scope item you want to add.",
        path: ["suggested_text"],
      });
    }

    if (
      (value.suggestion_type === "edit" || value.suggestion_type === "remove") &&
      !value.target_scope_item_id
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select a scope item.",
        path: ["target_scope_item_id"],
      });
    }

    if (value.suggestion_type === "edit" && !value.suggested_text?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Describe the updated scope text.",
        path: ["suggested_text"],
      });
    }
  });

export const updateSuggestionSchema = z.object({
  category: categorySchema.optional(),
  suggested_text: z.string().trim().max(2000).optional(),
  contractor_note: z.string().trim().max(2000).optional(),
});

export const followUpMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(2000),
});

export const rejectSuggestionSchema = z.object({
  reason: z.string().trim().max(2000).optional(),
});

export const reviewNotesSchema = z.object({
  notes: z.string().trim().max(4000).optional(),
});
