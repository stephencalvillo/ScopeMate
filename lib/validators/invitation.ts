import { z } from "zod";

export const createInvitationSchema = z.object({
  contractor_name: z
    .string()
    .trim()
    .min(1, "Enter the contractor's name.")
    .max(120),
  contractor_email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320),
  contractor_company: z.string().trim().max(120).optional(),
});

export const contractorIdentitySchema = z.object({
  contractor_name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120),
  contractor_email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(320),
  contractor_company: z.string().trim().max(120).optional(),
});
