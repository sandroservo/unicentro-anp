# Spec — RBAC / Permissões

**Fase:** 1 (fundação) · **Status:** ✅ implementado · **ADR:** [ADR-003](../../decisions/ADR-003.md)

## Objetivo

Controle de acesso por role e permissão. 6 roles fixas; permissões resolvidas no login e carregadas no JWT.

## Modelo (Prisma)
`Role` (slug único), `Permission` (slug), `RolePermission` (join). `User.roleId` + `role` String transitório.

## Roles
SUPER_ADMIN, ADMINISTRADOR, COORDENADOR, TUTOR, PROFESSOR, ALUNO. Backfill do legado em `lib/rbac.ts` (`toRoleSlug`).

## Permissões (slugs)
`students.read/write`, `courses.read/write`, `subjects.write`, `lessons.write`, `youtube.manage`, `questions.write`, `users.manage`, `settings.manage`. Matriz em `lib/rbac.ts` (`ROLES`).

## Camadas
1. **JWT** (`auth.config` callbacks): role slug + `permissions: string[]`.
2. **Middleware** (edge): gate de área (`/admin` → `isAdminRole`).
3. **Server** (`lib/authz.ts`): `requireSession` / `requirePermission(perm)` / `hasPermission` → 401/403.

## Nota
Puro/edge-safe (`lib/rbac.ts` sem Prisma). Mudança de role reflete no próximo login. Ver [roadmap](../../roadmap.md) (drop de `User.role`).

## Verificação
3 roles: sessão com permissions, gate `/admin` ambas direções; unit `toRoleSlug`/`isAdminRole`.
