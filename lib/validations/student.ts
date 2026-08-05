import { z } from "zod";

export const studentCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  matricula: z.string().trim().min(1, "Matrícula é obrigatória"),
  phone: z.string().trim().optional().or(z.literal("")),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const studentUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  matricula: z.string().trim().min(1, "Matrícula é obrigatória").optional(),
  phone: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
