import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().max(120).optional(),
  location: z
    .string()
    .trim()
    .min(2, "Add a city or ZIP code so contractors know the general area")
    .max(120),
  original_description: z
    .string()
    .trim()
    .min(20, "Describe your project in at least a few sentences")
    .max(8000),
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
