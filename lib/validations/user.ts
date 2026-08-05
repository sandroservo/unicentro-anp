import { z } from "zod";
import { ROLES } from "@/lib/rbac";

const roleSlugs = ROLES.map((r) => r.slug) as [string, ...string[]];
export const ROLE_OPTIONS = ROLES.map((r) => ({ slug: r.slug, name: r.name }));

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(roleSlugs, { message: "Tipo de usuário inválido" }),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").optional(),
  role: z.enum(roleSlugs).optional(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
