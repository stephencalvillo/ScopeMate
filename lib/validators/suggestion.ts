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

    if (value.suggestion_type === "edit") {
      if (!value.target_scope_item_id) {
        ctx.addIssue({
          code: "custom",
          message: "Select a scope item.",
          path: ["target_scope_item_id"],
        });
      }

      if (!value.suggested_text?.trim() && !value.contractor_note?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Add a comment or suggested wording.",
          path: ["contractor_note"],
        });
      }
    }

    if (value.suggestion_type === "remove" && !value.target_scope_item_id) {
      ctx.addIssue({
        code: "custom",
        message: "Select a scope item.",
        path: ["target_scope_item_id"],
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

export const generateAddSuggestionSchema = z.object({
  category: categorySchema,
  description: z
    .string()
    .trim()
    .min(1, "Describe what you want to add.")
    .max(2000),
});
