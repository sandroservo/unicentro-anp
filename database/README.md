# Database

O schema Prisma e as migrations vivem em `prisma/` na raiz (`prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`) — não foram movidos pra cá pra evitar churn na config já funcional (`prisma.config.ts`, `lib/prisma.ts`).

Este diretório guarda artefatos de dados auxiliares: diagramas ER, dumps de exemplo, notas de modelagem.

- Banco: PostgreSQL via `docker compose up -d` (host **5433**).
- Seed: `npx tsx prisma/seed.ts` (idempotente).
