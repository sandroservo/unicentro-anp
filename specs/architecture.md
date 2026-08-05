# Arquitetura — ANP LMS

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, shadcn/ui (**Base UI**), TailwindCSS (tema tweakcn verde), TanStack Query, React Hook Form + Zod.
- **Backend**: Next.js route handlers + Server Actions, Prisma 7 + `@prisma/adapter-pg`, PostgreSQL + **pgvector**.
- **Auth**: Auth.js v5 (next-auth v5), JWT + Credentials, split edge/node (`auth.config.ts` edge-safe, `auth.ts` node). Permissões resolvidas no login e carregadas no token.
- **IA**: OpenRouter (chat/correção), embeddings hash-determinísticos (dev) → pgvector; RAG em `lib/rag.ts`.
- **Testes**: Vitest (unit) + Playwright (e2e scaffold).
- **Infra**: docker-compose (Postgres/pgvector host 5433). App dev em :3000/:3001.

## Camadas e padrões

- **Autorização**: `lib/rbac.ts` (matriz roles×permissões, puro/edge-safe) → JWT → `lib/authz.ts` `requirePermission()` em toda mutação (401/403 via `lib/api.ts`).
- **Validação**: um schema Zod por entrada, reutilizado no form (RHF) e no server (`parseBody`).
- **Erros**: `{ error: string }` via `apiError`; 500 nunca serializa o objeto.
- **Hierarquia de conteúdo**: `Course → Subject → Module → Lesson → Activity`.
- **Vetores**: coluna `vector(384)` gerenciada por SQL raw (Prisma não conhece o tipo); busca com literal inline (`<=>`).

## Convenções de código
Ver [../docs/coding-standards.md](../docs/coding-standards.md), [../docs/permissions.md](../docs/permissions.md), [../docs/ui-guidelines.md](../docs/ui-guidelines.md).

## Decisões-chave
Ver [decisions/](decisions/) (ADRs).

## Estrutura de diretórios
```
app/            # rotas (App Router): (auth), (dashboard)/{aluno,admin}, api/
components/     # ui/ (shadcn Base UI), layout/, <módulo>/
lib/            # api, authz, rbac, prisma, ai/, knowledge, rag, embeddings, validations/
prisma/         # schema.prisma, seed.ts, pgvector.sql
specs/          # esta documentação (modules/, decisions/, changelog/)
scripts/        # harness.mjs
.claude/agents/ # time de agentes especializados
```
