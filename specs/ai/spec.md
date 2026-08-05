# Spec — Tutor IA com RAG — Phase 3 M4

**Depende de:** RAG, OpenRouter · **Status:** ✅ implementado

## Objetivo

Chat do Professor Virtual que responde com base no material do curso (RAG):
recupera contexto da KnowledgeBase, aumenta o prompt e chama o LLM (OpenRouter).

## API

`POST /api/aluno/tutor` (sessão), body `{ message, courseId?, history? }`:
- `retrieveContext(message, courseId)` → contexto + fontes.
- `augmentSystemPrompt` + histórico + pergunta → `chatCompletion` (OpenRouter).
- Sem chave (`NO_API_KEY`) → **degrada**: 200 com aviso + fontes do material (RAG funciona sem LLM).
- Retorna `{ answer, sources }`.

## UI

- `app/(dashboard)/aluno/tutor/page.tsx` + `components/tutor/tutor-chat.tsx` (chat + fontes).
- Menu "Professor IA" aponta pra `/aluno/tutor`.

## Verificação

- **Live:** aluno pergunta sobre conteúdo indexado → resposta degradada (sem chave) traz fontes RAG
  relevantes; sem sessão → 401. (Com OPENROUTER_API_KEY: resposta gerada.)
