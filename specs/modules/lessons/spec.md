# Spec — Módulo Aulas (modules-lessons)

**Fase:** 1 · **Depende de:** RBAC, Disciplinas · **Status:** ✅ implementado

## Objetivo

CRUD de **Módulos** (dentro de uma disciplina) e **Aulas/Lessons** (dentro de um módulo).
Reusa os models `Module` e `Lesson` existentes. Fecha o drill-down
`Curso → Disciplina → Módulo → Aula`.

## Escopo

Dentro:
- Módulos de uma disciplina: criar/editar/remover/ordenar (`Module.subjectId`).
- Aulas de um módulo: criar/editar/remover/ordenar (title, description, videoUrl, order).
- Gate: ver `courses.read`, mutar `lessons.write`.

Fora (próximo módulo YouTube): buscar título/duração/thumb do YouTube, transcrição.
Aqui `videoUrl` é só um campo de texto.

## API (`requirePermission`)

Módulos:
| GET/POST | `/api/admin/subjects/[id]/modules` | courses.read / lessons.write |
| PATCH/DELETE | `/api/admin/modules/[id]` | lessons.write |

Aulas:
| GET/POST | `/api/admin/modules/[id]/lessons` | courses.read / lessons.write |
| PATCH/DELETE | `/api/admin/lessons/[id]` | lessons.write |

Delete real (aula não tem status). Remover módulo remove suas aulas (cascade já existe em Lesson→Module).

## UI (rotas flat p/ evitar threading de params)

- `app/(dashboard)/admin/disciplinas/[subjectId]/page.tsx` — módulos da disciplina + link "Aulas".
- `app/(dashboard)/admin/modulos/[moduleId]/page.tsx` — aulas do módulo.
- `components/modules/*` e `components/lessons/*` (table + dialog, padrão dos anteriores).
- Link "Módulos" na subjects-table → `/admin/disciplinas/[subjectId]`.

## Verificação

- **Unit:** schemas zod de módulo e aula (videoUrl opcional).
- **Live:** cria módulo numa disciplina → cria aula no módulo → edita/remove; aluno → 403.
