# Spec — Módulo Correção (grading)

**Fase:** 2 · **Depende de:** Atividades · **Status:** ✅ implementado

## Objetivo

Corrigir dissertativas de submissões: por **IA (OmniRoute)** e **manual** pelo professor.
Fecha `Submission.finalGrade` e grava `aiFeedback`.

## OmniRoute (gateway)

`lib/ai/openrouter.ts` — endpoint OpenAI-compatible (OmniRoute preferencial; fallback OpenRouter).
Config: settings `ai_base_*` → env `OMNIROUTE_*` → legado `OPENROUTER_*`.
Sem chave no OpenRouter público → `NO_API_KEY` → **503**. Modelo default: `auto` (OmniRoute) ou `openai/gpt-4o-mini` (OpenRouter).

## Correção IA

`gradeEssayWithAI(question, answer, rubric, maxPoints)` → pede ao modelo **JSON** `{ points, feedback }`
(points 0..maxPoints). Parse robusto (extrai primeiro bloco JSON).
Endpoint corre cada dissertativa da submissão, soma pontos-essay, recompõe:
`finalGrade = objetivo (aiGrade da submissão) + pontosEssayIA`; `aiFeedback` = feedback concatenado.

## Correção manual

Professor define `finalGrade` (número) e `aiFeedback` (texto) direto — sobrepõe a IA.

## API (`lessons.write`; GET = `courses.read`)

| GET | `/api/admin/activities/[id]/submissions` | lista submissões (aluno, notas, status) |
| POST | `/api/admin/submissions/[id]/grade-ai` | corrige dissertativas via OmniRoute |
| PATCH | `/api/admin/submissions/[id]` | nota/feedback manual |

## UI

- `app/(dashboard)/admin/atividades/[activityId]/correcao/page.tsx` — lista submissões;
  por submissão: respostas do aluno, botão "Corrigir com IA", campos nota+feedback manual.
- Link "Correção" na activities-table.

## Verificação

- **Unit:** parser de JSON da resposta IA (`extractGradeJson`) — bloco válido, com ruído, inválido.
- **Live:** grade-ai sem chave → 503; manual PATCH define finalGrade+feedback (não precisa IA);
  lista submissões; aluno → 403.
