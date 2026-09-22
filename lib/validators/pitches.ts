import { z } from "zod";

export const PitchStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const UpdatePitchStatusSchema = z.object({
  status: PitchStatusSchema,
});

export const GeneratePitchesSchema = z.object({
  count: z.number().int().min(1).max(10).default(3),
});

export type UpdatePitchStatusInput = z.infer<typeof UpdatePitchStatusSchema>;
