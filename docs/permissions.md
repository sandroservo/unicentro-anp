# Permissões & RBAC — ANP LMS

> Stub. Matriz completa preenchida no módulo RBAC.

## Roles (6, conjunto fechado)

| Slug | Nome | Origem legada (backfill) |
|------|------|--------------------------|
| `SUPER_ADMIN` | SuperAdmin | `SUPER` |
| `ADMINISTRADOR` | Administrador | `ADMIN` |
| `COORDENADOR` | Coordenador | *(net-new, só seed)* |
| `TUTOR` | Tutor | `MONITOR` |
| `PROFESSOR` | Professor | `TEACHER` |
| `ALUNO` | Aluno | `STUDENT` |

## Modelo

- `Role`, `Permission`, `RolePermission` (join) no DB.
- Permissões resolvidas no **login** e guardadas no JWT (`session.user.permissions: string[]`).
- Mudança de role → reflete no **próximo login** (aceito).

## Camadas de checagem

1. **JWT** (`callbacks.jwt`): carrega role slug + permissions.
2. **Middleware** (edge): autenticado? + gate de área (`/admin/*` → role admin-tier).
3. **Server actions / route handlers**: `requirePermission('students.write')` → `ApiError(403)`.

## Convenção de slug de permissão

`<recurso>.<ação>` — ex: `students.read`, `students.write`, `courses.write`, `subjects.write`, `lessons.write`, `youtube.manage`.
