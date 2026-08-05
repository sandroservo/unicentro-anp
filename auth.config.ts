import type { NextAuthConfig } from "next-auth";

// Config edge-safe: SEM Prisma, SEM bcrypt. Usado pelo middleware (runtime edge)
// e espalhado dentro de auth.ts (runtime node, que adiciona o provider Credentials).
export default {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [], // Credentials entra em auth.ts (precisa de Prisma/bcrypt).
  callbacks: {
    // Gate de rota no middleware. Retorna false → redireciona pro signIn.
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      if (!isLoggedIn) return false;

      const { pathname } = request.nextUrl;
      const role = auth.user.role;
      const isAdmin = role === "ADMIN" || role === "SUPER";
      if (pathname.startsWith("/admin") && !isAdmin) {
        return Response.redirect(new URL("/aluno", request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
