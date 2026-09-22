import { z } from "zod";

export const ShotAnalysisItemSchema = z.object({
  description: z.string().min(1),
  type: z.string().min(1),
  effectiveness_rating: z.number().int().min(1).max(10),
  why_effective: z.string().min(1),
  execution_tip: z.string().min(1),
});

export const ShotAnalysisSchema = z.object({
  shots: z.array(ShotAnalysisItemSchema),
});

export const ScriptPayloadSchema = z.object({
  opening_shot: z.string().min(1),
  visual_sequence: z.string().min(1),
  voiceover_line: z.string().min(1),
  closing_shot: z.string().min(1),
  sound_design: z.string().min(1),
  cherry_on_top: z.string().min(1),
  moral: z.string().min(1),
  themes: z.array(z.string().min(1)).min(1),
  shot_analysis: ShotAnalysisSchema,
});

export const ScriptFeedbackSchema = z.object({
  feedback_text: z.string().min(10).max(2000),
});

export const UpdateScriptStatusSchema = z.object({
  status: z.enum(["draft", "final"]),
});

export type ScriptPayloadInput = z.infer<typeof ScriptPayloadSchema>;
export type ScriptFeedbackInput = z.infer<typeof ScriptFeedbackSchema>;
