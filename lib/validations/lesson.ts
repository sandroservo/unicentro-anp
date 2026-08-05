import { z } from "zod";

export const moduleCreateSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).optional(),
});
export const moduleUpdateSchema = moduleCreateSchema.partial();

export const lessonCreateSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional().or(z.literal("")),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  duration: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0).optional(),
});
export const lessonUpdateSchema = lessonCreateSchema.partial();

export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
