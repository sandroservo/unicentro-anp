# Spec — Autenticação (Auth.js v5)

**Fase:** 1 (fundação) · **Status:** ✅ implementado · **ADR:** [ADR-002](../../decisions/ADR-002.md)

## Objetivo

Login por credenciais (email/senha) com Auth.js v5, JWT, split edge/node. Sessão carrega role + permissões.

## Arquitetura

- `auth.config.ts` (edge-safe): `authorized` (gate `/admin` via `isAdminRole`), `jwt`/`session` (carregam id/role/permissions). Sem Prisma/bcrypt.
- `auth.ts` (node): `Credentials` com Prisma + bcrypt; `authorize` carrega role slug + permissions do DB.
- `middleware.ts`: `NextAuth(authConfig)`; matcher `/aluno/*` + `/admin/*`.
- `types/next-auth.d.ts`: augmenta Session/User/JWT (`@auth/core/jwt`) com role + permissions.

## Fluxos
- Login → `authorize` valida → token com id/role/permissions.
- Registro público (`/api/auth/register`): cria User role ALUNO + roleId, bcrypt(12).
- `/` redireciona: deslogado → `/login`; logado → `/admin` ou `/aluno`.

## Env
`AUTH_SECRET` (fallback `NEXTAUTH_SECRET`), `trustHost: true` (dev). App em :3000/:3001.

## Verificação
Login por role, gate `/admin` ambas direções, cookie `authjs.session-token`, register roleId ALUNO.
