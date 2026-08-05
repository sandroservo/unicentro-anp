# Spec — Módulo Alunos (student-management)

**Fase:** 1 · **Depende de:** RBAC, StudentProfile
**Status:** ✅ implementado (opção A — /admin/alunos, só admins). Verificado ao vivo: CRUD + gate 403.

## Objetivo

CRUD de alunos na área de gestão: listar, criar, editar, ativar/inativar.
Primeiro módulo de feature — **define o padrão** (shadcn table + dialog RHF +
TanStack Query + gate por permissão) que Cursos/Disciplinas/Aulas copiam.

## Escopo

Dentro:
- Listagem paginada/buscável de alunos.
- Criar aluno (cria `User` role ALUNO + `StudentProfile`).
- Editar dados do aluno.
- Ativar/inativar (soft — campo `status`, não deleta).
- Tudo gateado por permissão `students.read` (ver) / `students.write` (mutar).

Fora (fases/módulos futuros):
- Import em massa CSV (adiado — traria MinIO).
- Matrícula em turma (Turma é Phase 2).
- Histórico acadêmico, notas, certificados (Phase 2+).
- Reset de senha por e-mail (SMTP não está na fundação).

## Entidade nova — StudentProfile (1:1 com User)

```prisma
model StudentProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  matricula String   @unique
  phone     String?
  status    String   @default("ATIVO") // ATIVO | INATIVO
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
`User` ganha `studentProfile StudentProfile?` (aditivo, nullable). Migração via `db push`.

## Fluxos

**Criar aluno:** form pede `name`, `email`, `matricula`, `phone?`, `senha inicial`.
Server: valida (zod), cria `User` (role ALUNO + roleId da role ALUNO, senha com bcrypt 12)
e `StudentProfile` numa transação. Email/matrícula únicos → 409 amigável.

**Editar:** altera `name`, `phone`, `status`, `matricula`. Não troca senha (fora de escopo).

**Inativar:** seta `status=INATIVO`. Aluno inativo não some da lista (filtro por status).

## API (route handlers, todos com `requirePermission`)

| Método | Rota | Permissão | Ação |
|--------|------|-----------|------|
| GET | `/api/admin/students?q=&status=` | students.read | lista (busca por nome/email/matrícula) |
| POST | `/api/admin/students` | students.write | cria User+StudentProfile |
| PATCH | `/api/admin/students/[id]` | students.write | edita |
| DELETE | `/api/admin/students/[id]` | students.write | inativa (soft; status=INATIVO) |

Validação zod reutilizada no form (RHF) e no server (`parseBody` de `lib/api.ts`).
Erros padronizados `{ error }` via `apiError`; 401/403 via `requirePermission`.

## UI

- Página `app/(dashboard)/admin/alunos/page.tsx` (server component): guard de sessão +
  `requirePermission('students.read')`; renderiza a tabela client.
- `components/students/students-table.tsx` (client): TanStack Query lista, busca,
  badge de status, botões editar/inativar (só se tiver `students.write`).
- `components/students/student-dialog.tsx` (client): dialog shadcn + RHF (create/edit).
- Toast (`sonner`) em sucesso/erro. Adiciona `form.tsx` (wrapper Base-UI + RHF) aqui —
  primeiro módulo a precisar.
- Item "Alunos" na sidebar, visível só pra quem tem `students.read`.

## Verificação

- **Unit (vitest):** schema zod do aluno (matrícula obrigatória, email válido).
- **E2E (playwright):** login admin → cria aluno → aparece na lista → edita → inativa;
  **+ 1 negativo**: login aluno (sem `students.write`) → POST `/api/admin/students` → 403.
- **Manual:** CRUD ponta-a-ponta em :3001.

## Decisão pendente (pra você)

**Acesso do Coordenador.** Hoje `/admin/*` é gateado a SUPER_ADMIN/ADMINISTRADOR
(middleware). O Coordenador tem `students.write` mas não entra em `/admin`. Opções:
- **(A, recomendado)** Módulo Alunos vive em `/admin/alunos` (só admins agora). Coordenador
  ganha acesso quando construirmos o portal `/coordenador` (feature própria, depois). Menor escopo.
- **(B)** Criar já a área `/gestao/*` acessível a quem tem `students.read` (admin + coordenador +
  tutor/professor read), e pôr Alunos lá. Mais flexível, mais trabalho agora.
