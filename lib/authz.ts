import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import type { Permission } from "@/lib/rbac";

// Autorização fina para server actions e route handlers.
// Lança ApiError (401/403) — o catch das rotas (lib/api.ts) traduz pra resposta.

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Não autorizado");
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  if (!session.user.permissions?.includes(permission)) {
    throw new ApiError(403, "Acesso negado");
  }
  return session;
}

export function hasPermission(
  session: { user?: { permissions?: string[] } } | null,
  permission: Permission
): boolean {
  return !!session?.user?.permissions?.includes(permission);
}
