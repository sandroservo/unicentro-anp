# Spec — Módulo Atividades (activities)

**Fase:** 2 · **Depende de:** Banco de Questões, Aulas · **Status:** ✅ implementado

## Objetivo

Professor/admin monta atividades (vinculadas a uma aula) a partir de questões do banco;
aluno submete respostas. Objetivas (MC/TF) são **auto-corrigidas na submissão**;
dissertativas ficam pendentes de correção (módulo Correção, M3).

## Escopo

Dentro:
- Autoria: CRUD de `Activity` sob uma `Lesson`; anexar/remover questões do banco (join).
- Aluno: listar atividades das suas aulas, abrir, submeter respostas (respeita `maxAttempts`).
- Auto-correção objetiva na submissão → `aiGrade` parcial; se 100% objetiva, `finalGrade` na hora.
- Gate autoria `lessons.write`; submissão exige sessão (qualquer aluno matriculado — simplificado: qualquer autenticado nesta fase).

Fora (M3 Correção): correção IA/manual de dissertativas, feedback textual, nota final de atividades com essay.

## Schema

Novo join:
```prisma
model ActivityQuestion {
  activityId String
  questionId String
  order      Int      @default(0)
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@id([activityId, questionId])
}
```
`Activity.activityQuestions ActivityQuestion[]`, `Question.activityQuestions ActivityQuestion[]`.
Campo `Activity.questions` (JSON legado) deixa de ser usado — mantido transitório.
`Submission.answers` (JSON) passa a guardar `{ [questionId]: valor }` +
`Submission.aiGrade` recebe o parcial objetivo; `finalGrade` só quando não há dissertativa.

## API

Autoria (`lessons.write`, exceto GET = `courses.read`):
| GET/POST | `/api/admin/lessons/[id]/activities` | lista/cria atividade da aula |
| PATCH/DELETE | `/api/admin/activities/[id]` | edita/remove |
| PUT | `/api/admin/activities/[id]/questions` | define questões (array de questionId+order) |

Aluno (sessão):
| GET | `/api/aluno/activities/[id]` | atividade + questões (sem gabarito) |
| POST | `/api/aluno/activities/[id]/submit` | submete respostas → auto-corrige objetivas |

Auto-correção: pra cada questão MC/TF, compara resposta com `options` (correct). Soma pontos.
`aiGrade = pontosObjetivosObtidos`. Se a atividade não tem dissertativa → `finalGrade = aiGrade`.

## UI

Autoria:
- `app/(dashboard)/admin/aulas/[lessonId]/atividades/page.tsx` — CRUD + seletor de questões.
- `components/activities/*` (table + dialog); link "Atividades" na lessons-table.

Aluno:
- Refaz `app/(dashboard)/aluno/atividades/page.tsx` (hoje mock) → lista real via API.
- Página de resolução simples por atividade (render questões, submit).

## Verificação

- **Unit:** função de auto-correção objetiva (`lib/grading.ts` `gradeObjective`) — acerto/erro/parcial.
- **Live:** admin cria atividade numa aula + anexa 1 MC + 1 ESSAY → aluno submete →
  objetiva corrigida (aiGrade parcial), finalGrade null (tem essay); atividade só-MC → finalGrade cheio.
  Aluno sem sessão → 401; não-autor cria atividade → 403.
