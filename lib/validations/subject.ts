import { z } from "zod";

export const subjectCreateSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  code: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).optional(),
});

export const subjectUpdateSchema = subjectCreateSchema.partial();

export type SubjectCreateInput = z.infer<typeof subjectCreateSchema>;
export type SubjectUpdateInput = z.infer<typeof subjectUpdateSchema>;
