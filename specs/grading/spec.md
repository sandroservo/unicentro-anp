# Spec — Módulo Correção (grading)

**Fase:** 2 · **Depende de:** Atividades · **Status:** ✅ implementado

## Objetivo

Corrigir dissertativas de submissões: por **IA (OpenRouter)** e **manual** pelo professor.
Fecha `Submission.finalGrade` e grava `aiFeedback`.

## OpenRouter

`lib/ai/openrouter.ts` — endpoint compatível OpenAI (`https://openrouter.ai/api/v1/chat/completions`).
Chave: `getSetting("openrouter_api_key")` → env `OPENROUTER_API_KEY`. Sem chave → erro `NO_API_KEY` → **503**.
Modelo default configurável (`getSetting("openrouter_model")`, fallback `openai/gpt-4o-mini`).

## Correção IA

`gradeEssayWithAI(question, answer, rubric, maxPoints)` → pede ao modelo **JSON** `{ points, feedback }`
(points 0..maxPoints). Parse robusto (extrai primeiro bloco JSON).
Endpoint corre cada dissertativa da submissão, soma pontos-essay, recompõe:
`finalGrade = objetivo (aiGrade da submissão) + pontosEssayIA`; `aiFeedback` = feedback concatenado.

## Correção manual

Professor define `finalGrade` (número) e `aiFeedback` (texto) direto — sobrepõe a IA.

## API (`lessons.write`; GET = `courses.read`)

| GET | `/api/admin/activities/[id]/submissions` | lista submissões (aluno, notas, status) |
| POST | `/api/admin/submissions/[id]/grade-ai` | corrige dissertativas via OpenRouter |
| PATCH | `/api/admin/submissions/[id]` | nota/feedback manual |

## UI

- `app/(dashboard)/admin/atividades/[activityId]/correcao/page.tsx` — lista submissões;
  por submissão: respostas do aluno, botão "Corrigir com IA", campos nota+feedback manual.
- Link "Correção" na activities-table.

## Verificação

- **Unit:** parser de JSON da resposta IA (`extractGradeJson`) — bloco válido, com ruído, inválido.
- **Live:** grade-ai sem chave → 503; manual PATCH define finalGrade+feedback (não precisa IA);
  lista submissões; aluno → 403.
