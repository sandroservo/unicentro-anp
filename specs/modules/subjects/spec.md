# Spec — Módulo Disciplinas (subjects)

**Fase:** 1 · **Depende de:** RBAC, Cursos · **Status:** ✅ implementado

## Objetivo

CRUD de disciplinas (Subject) **aninhado num curso**. Camada entre Course e Module:
`Curso → Disciplina → Módulo → Aula`.

## Schema (novo Subject + link no Module)

```prisma
model Subject {
  id       String  @id @default(cuid())
  courseId String
  title    String
  code     String?
  order    Int     @default(0)
  course   Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  modules  Module[]
}
```
`Course.subjects Subject[]`. `Module` ganha `subjectId String?` + `subject Subject? @relation(onDelete: SetNull)` (nullable → módulos atuais válidos; usado no módulo Aulas).

## API (`requirePermission`)

| Método | Rota | Permissão | Ação |
|--------|------|-----------|------|
| GET | `/api/admin/courses/[id]/subjects` | courses.read | lista disciplinas do curso |
| POST | `/api/admin/courses/[id]/subjects` | subjects.write | cria |
| PATCH | `/api/admin/subjects/[id]` | subjects.write | edita |
| DELETE | `/api/admin/subjects/[id]` | subjects.write | remove (módulos ficam, subjectId→null) |

Sem soft-delete (disciplina não tem status; delete é real, módulos preservados).

## UI

- `app/(dashboard)/admin/cursos/[cursoId]/disciplinas/page.tsx`: gate `courses.read`,
  cabeçalho com nome do curso, tabela de disciplinas ordenadas.
- `components/subjects/subjects-table.tsx` + `subject-dialog.tsx` (padrão Alunos/Cursos).
- Link "Disciplinas" na linha do curso (courses-table).

## Verificação

- **Unit:** schema zod de disciplina.
- **Live:** admin cria/lista/edita/remove disciplina num curso; aluno → POST 403.
