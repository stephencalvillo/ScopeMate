import { z } from "zod";
import { TIMELINE_CHOICES } from "@/lib/follow-up/timeline";

export const timelineStartSchema = z.enum(TIMELINE_CHOICES);

export const createProjectSchema = z.object({
  title: z.string().trim().max(120).optional(),
  original_description: z
    .string()
    .trim()
    .min(20, "Describe your project in at least a few sentences")
    .max(8000),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(?:-\d{4})?$/, "Enter a valid 5-digit ZIP code"),
  target_start: timelineStartSchema.optional(),
});

export const projectCreatorRoleSchema = z.enum(["homeowner", "contractor"]);

export const createGuestProjectSchema = z.object({
  original_description: z
    .string()
    .trim()
    .min(20, "Describe your project in at least a few sentences")
    .max(8000),
  zip: z
    .string()
    .trim()
    .regex(
      /^\d{5}(?:-\d{4})?$/,
      "Enter a valid 5-digit ZIP code"
    ),
  target_start: timelineStartSchema.optional(),
  creator_role: projectCreatorRoleSchema.optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(2).max(120).optional(),
  original_description: z.string().trim().min(20).max(8000).optional(),
  project_type: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["draft", "scope_ready", "shared", "archived"]).optional(),
});

export const shareProjectSchema = z.object({
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

export const sendShareLinkEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320),
});
