# Spec — Módulo RAG (retrieval-augmented) — Phase 3 M3

**Depende de:** KnowledgeBase · **Status:** ✅ implementado

## Objetivo

Recuperar contexto relevante da KnowledgeBase e aumentar o prompt do LLM.
Consumido pelo Tutor IA (M4) e pela Busca Semântica (M5).

## lib/rag.ts

- `selectContext(hits, {minScore, maxChars})` — filtra por score e orçamento de chars (puro).
- `formatContext(hits)` — bloco numerado `[1] ...` (puro).
- `augmentSystemPrompt(base, context)` — injeta contexto + instrução (puro).
- `retrieveContext(query, {courseId?, k})` — busca vetorial + seleção → `{ context, sources }`.

Sem API/UI próprios — é biblioteca. Verificação end-to-end no Tutor IA (M4).

## Verificação

- **Unit:** `selectContext` (minScore, maxChars), `formatContext`, `augmentSystemPrompt`.
