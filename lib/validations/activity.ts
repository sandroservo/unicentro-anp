import { z } from "zod";

export const activityCreateSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim().optional().or(z.literal("")),
  maxAttempts: z.coerce.number().int().positive().optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  aiGrading: z.boolean().optional(),
});
export const activityUpdateSchema = activityCreateSchema.partial();

export const setQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)),
});

export const submitSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

export const gradeManualSchema = z.object({
  finalGrade: z.coerce.number().min(0),
  feedback: z.string().trim().optional().or(z.literal("")),
});

export type ActivityInput = z.infer<typeof activityCreateSchema>;
