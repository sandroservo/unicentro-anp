import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";
import { toRoleSlug } from "@/lib/rbac";

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
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roleRel: { include: { permissions: { include: { permission: true } } } } },
        });
        if (!user) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        // Slug canônico: usa a role vinculada (RBAC) ou faz fallback do string legado.
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
