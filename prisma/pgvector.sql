-- Setup pgvector para a KnowledgeBase (Phase 3).
-- Rodar após `prisma db push`:
--   docker compose exec -T db psql -U anp -d anp -f - < prisma/pgvector.sql
-- (ou colar no psql). Idempotente.

CREATE EXTENSION IF NOT EXISTS vector;

-- Prisma não conhece o tipo vector; a coluna é gerenciada por SQL raw.
ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS embedding vector(384);

-- ATENÇÃO: NÃO criar índice ivfflat com poucos dados — com LIMIT o index scan
-- tem baixa recall e retorna 0 linhas. Criar só quando houver volume:
-- CREATE INDEX kc_embedding_idx ON "KnowledgeChunk"
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Alternativa (melhor recall, sem tuning): HNSW
-- CREATE INDEX kc_embedding_hnsw ON "KnowledgeChunk"
--   USING hnsw (embedding vector_cosine_ops);
