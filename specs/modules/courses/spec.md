# Spec — Módulo Cursos (course-management)

**Fase:** 1 · **Depende de:** RBAC · **Padrão:** copia o módulo Alunos
**Status:** ✅ implementado (opção A). Verificado: CRUD + slug auto + gate 403.

## Objetivo

CRUD de cursos na área admin: listar, criar, editar, ativar/inativar.
Reusa o padrão do módulo Alunos (tabela + dialog RHF + TanStack + `requirePermission`).

## Escopo

Dentro:
- Listagem buscável + filtro ativo/inativo.
- Criar/editar curso.
- Ativar/inativar (usa o campo `isActive` que **já existe** no Course — soft, não deleta).
- Gate por `courses.read` (ver) / `courses.write` (mutar).

Fora (depois):
- Disciplinas/módulos/aulas do curso → módulos próprios (Disciplinas, Aulas).
- Matrículas de alunos → Phase 2.
- Atribuir Coordenador (precisa de user-picker) → adiado; campo fica no schema, UI depois.

## Delta de schema (Course já existe — só enriquece, aditivo)

Campos atuais mantidos: `title, description, thumbnail?, isActive, aiPersona?, aiContext?`.
Adiciona:
```prisma
model Course {
  // ...existentes...
  slug          String?  @unique   // gerado do título; nullable p/ dados atuais
  code          String?             // código institucional (ex: "ADS-2024")
  workloadHours Int?                // carga horária
  coordinatorId String?             // → User (atribuição de coordenador; UI depois)
  coordinator   User?    @relation("CourseCoordinator", fields: [coordinatorId], references: [id])
}
```
`User` ganha `coordinatedCourses Course[] @relation("CourseCoordinator")`. Tudo nullable → `db push` sem perda; cursos do seed continuam válidos.

## Slug

Gerado do título (`slugify`: minúsculo, sem acento, hífens). Colisão → sufixo `-2`, `-3`...
Helper novo `slugify` em `lib/utils.ts` (+ unit test). Editar título **não** muda slug (estável).

## API (route handlers, `requirePermission`)

| Método | Rota | Permissão | Ação |
|--------|------|-----------|------|
| GET | `/api/admin/courses?q=&active=` | courses.read | lista (busca título/código) |
| POST | `/api/admin/courses` | courses.write | cria (slug auto) |
| PATCH | `/api/admin/courses/[id]` | courses.write | edita |
| DELETE | `/api/admin/courses/[id]` | courses.write | inativa (isActive=false) |

Validação zod (`lib/validations/course.ts`) reutilizada no form e no `parseBody`.
Campos do form: `title, description, code?, workloadHours?, isActive, aiPersona?, aiContext?`.

## UI

- `app/(dashboard)/admin/cursos/page.tsx` (server): `requirePermission('courses.read')` + `canWrite`.
- `components/courses/courses-table.tsx`: TanStack list, busca, badge ativo/inativo, editar/inativar.
- `components/courses/course-dialog.tsx`: dialog RHF create/edit (título, descrição, código, carga horária, ativo, persona/contexto IA em textarea).
- Item "Cursos" na sidebar por `courses.read`.
- Precisa do primitivo shadcn `textarea` (adicionar).

## Verificação

- **Unit (vitest):** `slugify` (acentos, colisão de espaços) + schema zod do curso.
- **Live:** admin cria curso → lista → edita → inativa; aluno (sem `courses.write`) → POST 403.
- Boot limpo em :3001 (kill total + rm .next antes do dev).

## Nota

Área `/admin/cursos` (opção A, só admins) — mesma decisão do módulo Alunos. Coordenador/Professor
com `courses.*`/`courses.read` acessam quando os portais deles existirem.
