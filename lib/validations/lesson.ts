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
  videoUrl: z
    .string()
    .trim()
    .min(1, "Informe o link do YouTube da aula")
    .url("URL inválida")
    .refine(
      (u) => /youtube\.com|youtu\.be/i.test(u),
      "Use um link do YouTube (youtube.com ou youtu.be)"
    ),
  duration: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0).optional(),
});
export const lessonUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().or(z.literal("")),
  videoUrl: z
    .string()
    .trim()
    .url("URL inválida")
    .refine((u) => /youtube\.com|youtu\.be/i.test(u), "Use um link do YouTube")
    .optional()
    .or(z.literal("")),
  duration: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
