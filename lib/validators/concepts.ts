import { z } from "zod";

export const ConceptCategorySchema = z.enum([
  "Psychological",
  "Philosophical",
  "Experiential",
  "Relational",
  "Medicine",
]);

export const CreateConceptSchema = z.object({
  name: z.string().min(1).max(200),
  category: ConceptCategorySchema,
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1)).default([]),
});

export const UpdateConceptSchema = CreateConceptSchema.partial();

export const SuggestConceptsSchema = z.object({
  concept_ids: z.array(z.string().uuid()).min(1).max(10),
});

export type CreateConceptInput = z.infer<typeof CreateConceptSchema>;
export type UpdateConceptInput = z.infer<typeof UpdateConceptSchema>;
