import { z } from "zod";

export const followUpAnswerSchema = z
  .object({
    answer: z.string().trim().min(1).max(500).optional(),
    skipped: z.boolean().optional(),
  })
  .refine((data) => data.answer !== undefined || data.skipped === true, {
    message: "Provide an answer or skip the question.",
  });
