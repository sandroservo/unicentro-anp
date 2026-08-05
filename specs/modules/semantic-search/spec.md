# Spec — Busca Semântica — Phase 3 M5

**Depende de:** KnowledgeBase · **Status:** ✅ implementado

## Objetivo

Aluno busca trechos do material por significado (busca vetorial), com o título da fonte.

## API

`GET /api/aluno/search?q=&courseId=` (sessão) — `searchKnowledge` + enriquece com título da KnowledgeBase.
Retorna `{ results: [{ content, score, source, lessonId }] }`.

## UI

`app/(dashboard)/aluno/busca/page.tsx` + `components/search/semantic-search.tsx` (input + resultados com relevância). Item "Busca" na sidebar do aluno.

## Verificação

- **Live:** busca por termo indexado → resultados ordenados por relevância com fonte; sem sessão → 401.
- Lógica de busca já coberta por `tests/unit/embeddings.test.ts`.
