import { z } from "zod";
import {
  INSTITUTIONAL_EMAIL_DOMAIN,
  isInstitutionalEmail,
  institutionalEmailMessage,
  normalizeInstitutionalEmail,
} from "@/lib/institutional-email";

/** Valida CPF (11 dígitos + dígitos verificadores). */
export function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function normalizeCPF(raw: string): string {
  return raw.replace(/\D/g, "");
}

const cpfSchema = z
  .string()
  .trim()
  .refine(isValidCPF, "CPF inválido")
  .transform(normalizeCPF);

const institutionalEmailSchema = z
  .string()
  .trim()
  .email("Email inválido")
  .refine(isInstitutionalEmail, institutionalEmailMessage())
  .transform(normalizeInstitutionalEmail);

export const studentCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: institutionalEmailSchema,
  matricula: z.string().trim().min(1, "Matrícula é obrigatória"),
  cpf: cpfSchema,
  phone: z.string().trim().optional().or(z.literal("")),
  // Senha do aluno = CPF (definida no servidor; campo opcional ignorado se vier)
  password: z.string().optional(),
});

export const studentUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  matricula: z.string().trim().min(1, "Matrícula é obrigatória").optional(),
  cpf: cpfSchema.optional(),
  phone: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;

export { INSTITUTIONAL_EMAIL_DOMAIN };
