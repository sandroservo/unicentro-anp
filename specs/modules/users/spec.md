# Spec — Usuários (user-management)

**Fase:** extra · **Depende de:** RBAC · **Status:** ✅ implementado

## Objetivo

CRUD de usuários pelo admin, definindo o **tipo (role)**: SUPER_ADMIN, ADMINISTRADOR,
COORDENADOR, TUTOR, PROFESSOR, ALUNO. Gate `users.manage`.

## API (`requirePermission("users.manage")`)

| GET | `/api/admin/users?q=&role=` | lista/filtra |
| POST | `/api/admin/users` | cria { name, email, password, role } → User + roleId |
| PATCH | `/api/admin/users/[id]` | edita nome/role/senha |
| DELETE | `/api/admin/users/[id]` | remove (bloqueia auto-exclusão) |

Role → `roleId` resolvido por slug (lib/rbac). Senha bcrypt(12). Email único → 409.
Mudança de role reflete no próximo login do usuário (permissões no JWT).

## UI

- `app/(dashboard)/admin/usuarios/page.tsx` (gate users.manage).
- `components/users/users-table.tsx` (busca + filtro por role + badge de role).
- `components/users/user-dialog.tsx` (RHF: nome, email, senha, **select de role**).
- Item "Usuários" na sidebar (users.manage).

## Verificação

- **Unit:** schema (role válida obrigatória; senha min 6).
- **Live:** admin cria usuário PROFESSOR → aparece; edita role → COORDENADOR; login do novo usuário reflete permissões; não-admin → 403; auto-exclusão → 400.
