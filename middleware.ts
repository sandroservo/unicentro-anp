import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Instância só-edge (authConfig sem Prisma) — o gate de role vive em
// authConfig.callbacks.authorized. Não importa auth.ts (traria Prisma pro edge).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/aluno/:path*", "/admin/:path*"],
};
