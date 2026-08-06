import { z } from "zod";

export const courseEnrollmentCreateSchema = z.object({
  userId: z.string().min(1, "Aluno é obrigatório"),
});

export const subjectEnrollmentCreateSchema = z.object({
  userId: z.string().min(1, "Aluno é obrigatório"),
});

export type CourseEnrollmentCreateInput = z.infer<typeof courseEnrollmentCreateSchema>;
export type SubjectEnrollmentCreateInput = z.infer<typeof subjectEnrollmentCreateSchema>;
