import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";
import { toRoleSlug } from "@/lib/rbac";
import {
  isInstitutionalEmail,
  normalizeInstitutionalEmail,
} from "@/lib/institutional-email";
import { normalizeCPF } from "@/lib/validations/student";

// Runtime node: adiciona Credentials (usa Prisma + bcrypt). Exporta os helpers
// v5 usados por route handlers, server components e o handler [...nextauth].
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!rawEmail || !password) return null;

        if (!isInstitutionalEmail(rawEmail)) return null;
        const email = normalizeInstitutionalEmail(rawEmail);

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            studentProfile: { select: { cpf: true, status: true } },
            roleRel: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        });
        if (!user) return null;

        const isStudent = Boolean(user.studentProfile);
        if (isStudent && user.studentProfile?.status === "INATIVO") {
          return null;
        }

        // Aluno: senha = CPF (aceita com ou sem máscara)
        // Demais usuários: senha normal
        const candidates = isStudent
          ? Array.from(new Set([normalizeCPF(password), password])).filter(
              (p) => p.length > 0
            )
          : [password];

        let isValid = false;
        for (const candidate of candidates) {
          if (await compare(candidate, user.password)) {
            isValid = true;
            break;
          }
        }
        if (!isValid) return null;

        const role = user.roleRel?.slug ?? toRoleSlug(user.role);
        const permissions = user.roleRel
          ? user.roleRel.permissions.map((rp) => rp.permission.slug)
          : [];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
          permissions,
        };
      },
    }),
  ],
});
