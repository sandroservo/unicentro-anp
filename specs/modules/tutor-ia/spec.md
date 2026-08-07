# Spec — Tutor IA com RAG — Phase 3 M4

**Depende de:** RAG, OmniRoute · **Status:** ✅ implementado

## Objetivo

Chat do Professor Virtual que responde com base no material do curso (RAG):
recupera contexto da KnowledgeBase, aumenta o prompt com persona da turma e chama o LLM via OmniRoute.

## API

`POST /api/aluno/tutor` (sessão), body `{ message, courseId?, lessonTitle?, lessonContent?, subjectTitle?, history?, stream? }`:
- Carrega `Course.aiPersona` / título / descrição quando `courseId` presente.
- `retrieveContext(message, courseId)` → contexto + fontes.
- `buildSystemPrompt` + `augmentSystemPrompt` + histórico + pergunta → gateway.
- `stream: true` → SSE (`sources` / `delta` / `done` / `error`).
- Sem chave no OpenRouter público (`NO_API_KEY`) → **degrada**: aviso + fontes do material.
- Retorno JSON: `{ answer, sources }`.

## UI

- `app/(dashboard)/aluno/tutor/page.tsx` + `components/tutor/tutor-chat.tsx` (stream + fontes).
- Em aula: `LessonViewer` passa título/conceito/transcrição para o chat.
- Menu "Professor IA" aponta pra `/aluno/tutor`.

## Verificação

- Aluno pergunta sobre conteúdo indexado → resposta com fontes RAG; sem sessão → 401.
- Com OmniRoute (`OMNIROUTE_BASE_URL` ou Admin → Configurações): resposta gerada em stream.
