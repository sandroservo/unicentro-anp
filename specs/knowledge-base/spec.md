# Spec — Módulo KnowledgeBase + Embeddings (Phase 3 M1)

**Fase:** 3 · **Depende de:** pgvector · **Status:** ✅ implementado

## Objetivo

Base de conhecimento vetorizada: indexa textos (chunks + embeddings) e busca por similaridade.
Fundação do RAG, Tutor IA e Busca Semântica.

## Infra

- Imagem docker → `pgvector/pgvector:pg16`; extensão `vector`.
- `KnowledgeBase` (title, courseId?, lessonId?, sourceType) + `KnowledgeChunk` (content, order).
- Coluna `embedding vector(384)` no `KnowledgeChunk` via SQL raw (Prisma não conhece o tipo) + índice ivfflat.

## Embeddings — `lib/embeddings.ts`

Determinístico (dev, sem API): hashing trick → vetor dim 384 L2-normalizado.
Palavras em comum ⇒ próximos por cosseno. `toVectorLiteral`, `cosine` (puros/testáveis).

## Knowledge — `lib/knowledge.ts`

- `chunkText(text, maxLen=500)` — quebra por frase (puro/testável).
- `indexKnowledge(meta, text)` — cria KB + chunks; embedding via `$executeRaw`.
- `searchKnowledge(query, k, {courseId?})` — `$queryRaw` com `<=>` (cosseno pgvector), filtro por curso.

## API (`requirePermission`)

| POST | `/api/admin/knowledge` | lessons.write | indexa { title, text, courseId?, lessonId? } |
| GET | `/api/admin/knowledge/search?q=&courseId=` | courses.read | busca top-k |

## Verificação

- **Unit:** `hashEmbedding` (determinístico, dim, textos similares mais próximos que dissimilares via cosine); `chunkText`.
- **Live:** indexa 2 textos → busca por termo → retorna o chunk relevante 1º (score maior); aluno → 403.
