# Arquitetura — ANP LMS

> Stub. Preenchido ao longo da Fundação + Phase 1.

## Stack (alvo v2.0)

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, shadcn/ui, TailwindCSS, TanStack Query, React Hook Form + Zod.
- **Backend**: Next.js API/Server Actions, Prisma 7 + `@prisma/adapter-pg`, PostgreSQL.
- **Auth**: Auth.js v5 (next-auth v5), JWT + Credentials. RBAC com permissões resolvidas no token.
- **Adiado**: MinIO (storage), pg-boss (fila), OpenRouter (IA/RAG) — entram com seus módulos.

## Convenções

- Rotas em português (`/aluno`, `/professor`, `/coordenador`, `/admin`).
- Portas: app em **:3001** (nginx ocupa :3000). Postgres host **5433** via docker-compose.
- Validação: schemas Zod únicos — form (client) e `parseBody` (server, `lib/api.ts`).
- Autorização fina: `lib/authz.ts` `requirePermission(perm)` em server actions/route handlers.

## Hierarquia de conteúdo

`Course → Subject (Disciplina) → Module → Lesson (Aula)`.
