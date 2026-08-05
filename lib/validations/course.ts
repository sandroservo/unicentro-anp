import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  code: z.string().trim().optional().or(z.literal("")),
  workloadHours: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  aiPersona: z.string().trim().optional().or(z.literal("")),
  aiContext: z.string().trim().optional().or(z.literal("")),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
