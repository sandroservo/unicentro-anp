import { z } from "zod";
import { ROLES } from "@/lib/rbac";
import {
  isInstitutionalEmail,
  institutionalEmailMessage,
  normalizeInstitutionalEmail,
} from "@/lib/institutional-email";

const roleSlugs = ROLES.map((r) => r.slug) as [string, ...string[]];
export const ROLE_OPTIONS = ROLES.map((r) => ({ slug: r.slug, name: r.name }));

// Aluno é cadastrado só em /admin/alunos (User + StudentProfile). No painel de
// usuários não se cria/atribui ALUNO — só perfis administrativos.
const assignableRoleSlugs = ROLES.map((r) => r.slug).filter(
  (s) => s !== "ALUNO"
) as [string, ...string[]];
export const ASSIGNABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (r) => r.slug !== "ALUNO"
);

const institutionalEmailSchema = z
  .string()
  .trim()
  .email("Email inválido")
  .refine(isInstitutionalEmail, institutionalEmailMessage())
  .transform(normalizeInstitutionalEmail);

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: institutionalEmailSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(assignableRoleSlugs, { message: "Tipo de usuário inválido" }),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  role: z.enum(assignableRoleSlugs).optional(),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
