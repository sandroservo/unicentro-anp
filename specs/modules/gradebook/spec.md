# Spec — Módulo Notas (gradebook)

**Fase:** 2 · **Depende de:** Atividades, Correção · **Status:** ✅ implementado

## Objetivo

Visão consolidada de notas por curso: matriz alunos × atividades com `finalGrade`
(melhor tentativa) + média por aluno. Sem schema novo — agrega de `Submission`.

## Agregação (pura, testável) — `lib/gradebook.ts`

`buildGradebook(activities, submissions)`:
- melhor `finalGrade` por (aluno, atividade) — máximo dos não-nulos.
- linha por aluno: notas por atividade + média (sobre atividades com nota; sem nota → 0 na média? → média só das avaliadas; se nenhuma, 0).

## API

`GET /api/admin/courses/[id]/gradebook` (courses.read) — atividades do curso
(via lesson→module→course) + submissões → matriz.

## UI

- `app/(dashboard)/admin/cursos/[cursoId]/notas/page.tsx` — tabela matriz + média.
- Link "Notas" na courses-table.

## Verificação

- **Unit:** `buildGradebook` — melhor tentativa, média, aluno sem nota.
- **Live:** admin abre notas de um curso com submissões → matriz + média; aluno → 403.
