# Roadmap — ANP LMS

Plataforma de Aprendizagem Não Presencial com IA. Evolução incremental sobre MVP (Next 15 + Auth.js v5 + Prisma/Postgres + pgvector).

## Fase 1 — Base Acadêmica ✅
Fundação (Next 15, Auth.js v5, shadcn/Base UI, TanStack Query, RHF, Vitest/Playwright) + RBAC + Alunos + Cursos + Disciplinas + Aulas + YouTube.

## Fase 2 — Ensino ✅
Banco de Questões + Atividades (autoria+submissão+auto-correção) + Correção (OpenRouter + manual) + Notas + Certificados (PDF).

## Fase 3 — IA ✅
pgvector + KnowledgeBase (embeddings) + Transcrição + RAG + Tutor IA + Busca Semântica.

## Fase 4 — Business Intelligence (pendente)
- **Analytics**: tempo assistido, conclusão, engajamento, evasão.
- **Dashboards**: por role (admin/coordenador/professor).
- **Relatórios**: exportáveis.
- **Auditoria (audit-log)**: rastreio de ações sensíveis (LGPD).

## Débitos técnicos abertos
- `User.role` (String) transitório — dropar após remover leitores.
- Embeddings **hash** (dev) — trocar por API real (OpenAI-compat).
- `OPENROUTER_API_KEY` / `YOUTUBE_API_KEY` — configurar (env ou painel admin).
- pgvector: sem índice ivfflat/HNSW até haver volume (baixa recall com LIMIT).
- MinIO/pg-boss adiados até upload/fila reais.
- Portais dedicados de Coordenador/Tutor/Professor (hoje área /admin).
